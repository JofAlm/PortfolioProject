// src/pages/AdminPage.tsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase/config";
import type { ChangeEvent } from "react";
import type { Project } from "../types";

/** Attempt to infer a Storage path from a Firebase download URL (fallback when imagePath is missing). */
function inferStoragePathFromUrl(url: string): string | null {
  try {
    // Example: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<ENCODED_PATH>?...
    const u = new URL(url);
    const encoded = u.pathname.split("/o/")[1];
    if (!encoded) return null;
    return decodeURIComponent(encoded.split("?")[0]);
  } catch {
    return null;
  }
}

export default function AdminPage() {
  // --- Form state for "Add New Project"
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // --- UI state (submission, error handling)
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Data state (projects list and loading flag)
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects on mount, ordered by createdAt desc then title asc
  useEffect(() => {
    (async () => {
      try {
        const projectsRef = collection(db, "projects");
        const q = query(
          projectsRef,
          orderBy("createdAt", "desc"),
          orderBy("title", "asc")
        );
        const snap = await getDocs(q);
        const data: Project[] = snap.docs.map((d) => {
          const raw = d.data() as Omit<Project, "id">;
          return { id: d.id, ...raw };
        });
        setProjects(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Handle file selection for image upload
  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  // Create a new project: add Firestore doc, upload image, then update doc with image fields
  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !file) {
      setError("Title and image are required.");
      return;
    }

    setSubmitting(true);
    try {
      // 1) Create Firestore document first to obtain a stable ID for the Storage path
      const docRef = await addDoc(collection(db, "projects"), {
        title: title.trim(),
        description: description.trim(),
        createdAt: serverTimestamp(),
        imageUrl: "", // to be filled after upload
        // imagePath will be set after upload
      });

      // 2) Upload the image to Storage using the document ID in the path
      const path = `projects/${docRef.id}/${file.name}`;
      const sref = ref(storage, path);
      await uploadBytes(sref, file);
      const url = await getDownloadURL(sref);

      // 3) Update the Firestore document with image URL and path
      await updateDoc(doc(db, "projects", docRef.id), {
        imageUrl: url,
        imagePath: path,
      });

      // 4) Optimistically update UI (adds to the top of the list)
      setProjects((prev) => [
        {
          id: docRef.id,
          title: title.trim(),
          description: description.trim(),
          imageUrl: url,
          imagePath: path,
          // Temporary createdAt for UI; Firestore will provide the real timestamp on next fetch
          createdAt: {
            seconds: Math.floor(Date.now() / 1000),
          } as unknown as Project["createdAt"],
        },
        ...prev,
      ]);

      // 5) Reset form state and input element
      setTitle("");
      setDescription("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add project");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete a project: try to remove image from Storage, then delete Firestore document
  async function handleDelete(p: Project) {
    // eslint-disable-next-line no-alert
    if (!confirm(`Delete "${p.title}"?`)) return;

    try {
      // Try removing the associated image from Storage (use imagePath, fallback to URL inference)
      const path =
        (p as Project & { imagePath?: string }).imagePath ??
        inferStoragePathFromUrl(p.imageUrl);
      if (path) {
        try {
          await deleteObject(ref(storage, path));
        } catch {
          // Ignore storage errors (file missing, permissions) and proceed with doc deletion
        }
      }

      // Delete the Firestore document
      await deleteDoc(doc(db, "projects", p.id));

      // Update UI by removing the deleted project
      setProjects((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e instanceof Error ? e.message : "Failed to delete project");
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* Create form */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Add New Project
        </h2>

        <form
          onSubmit={handleAddProject}
          className="bg-white rounded-2xl shadow p-6 space-y-4"
        >
          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm">
              {error}
            </div>
          )}

          {/* Title input */}
          <div>
            <label className="block mb-1 text-gray-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-gray-900 text-white placeholder-gray-400
                         border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                         px-4 py-3"
              placeholder="Project title"
            />
          </div>

          {/* Description input */}
          <div>
            <label className="block mb-1 text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg bg-gray-900 text-white placeholder-gray-400
                         border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                         px-4 py-3 resize-y"
              placeholder="Describe the project…"
            />
          </div>

          {/* File input */}
          <div>
            <label className="block mb-1 text-gray-700">Image</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0 file:bg-yellow-500 file:text-gray-900 hover:file:bg-yellow-400"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-lg bg-green-600 hover:bg-green-500
                         px-5 py-2.5 font-medium text-white focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60"
            >
              {submitting ? "Adding…" : "Add Project"}
            </button>
          </div>
        </form>
      </section>

      {/* Projects list */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Manage Projects
        </h2>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No projects yet.
          </div>
        ) : (
          <ul className="space-y-4">
            {projects.map((p) => (
              <li
                key={p.id}
                className="bg-white rounded-2xl shadow flex items-center gap-4 p-4"
              >
                {/* Thumbnail */}
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="h-16 w-16 object-cover rounded-lg"
                />

                {/* Title + description */}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-lg text-gray-900">
                    {p.title}
                  </div>
                  <div className="truncate text-sm text-gray-500">
                    {p.description}
                  </div>
                </div>

                {/* Actions: Edit + Delete */}
                <div className="ml-auto flex items-center gap-2">
                  <Link
                    to={`/edit/${p.id}`}
                    className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-white text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p)}
                    className="inline-flex items-center rounded-lg bg-red-50 hover:bg-red-100 px-3 py-1.5 text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
