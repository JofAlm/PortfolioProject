import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
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
import type { Project } from "../types";

// Helper function to infer Storage path from a URL if imagePath is missing.
function inferStoragePathFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const path = u.pathname.split("/o/")[1];
    return path ? decodeURIComponent(path.split("?")[0]) : null;
  } catch {
    return null;
  }
}

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Define a reusable style for form inputs to maintain consistency
  const inputStyles =
    "w-full rounded-lg bg-white text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-3";

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
        const data: Project[] = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Project)
        );
        setProjects(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  async function handleAddProject(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !file) {
      setError("Title and image are required.");
      return;
    }

    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "projects"), {
        title: title.trim(),
        description: description.trim(),
        createdAt: serverTimestamp(),
        imageUrl: "",
      });

      const path = `projects/${docRef.id}/${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "projects", docRef.id), {
        imageUrl: url,
        imagePath: path,
      });

      const newProject: Project = {
        id: docRef.id,
        title: title.trim(),
        description: description.trim(),
        imageUrl: url,
        imagePath: path,
        createdAt: new Date() as unknown as Project["createdAt"], // Temporary timestamp for UI
      };
      setProjects((prev) => [newProject, ...prev]);

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

  async function handleDelete(p: Project) {
    if (!window.confirm(`Are you sure you want to delete "${p.title}"?`))
      return;

    try {
      const path =
        (p as Project & { imagePath?: string }).imagePath ??
        inferStoragePathFromUrl(p.imageUrl);
      if (path) {
        try {
          await deleteObject(ref(storage, path));
        } catch {
          // Non-critical error: proceed with doc deletion even if image removal fails.
        }
      }

      await deleteDoc(doc(db, "projects", p.id));
      setProjects((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed to delete project");
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

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

          <div>
            <label className="block mb-1 text-gray-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputStyles}
              placeholder="Project title"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`${inputStyles} resize-y`}
              placeholder="Describe the project…"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Image</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0 file:bg-gray-100 hover:file:bg-gray-200"
            />
          </div>

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
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="h-16 w-16 object-cover rounded-lg"
                />

                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-lg text-gray-900">
                    {p.title}
                  </div>
                  <div className="truncate text-sm text-gray-500">
                    {p.description}
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <Link
                    to={`/edit/${p.id}`}
                    className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-white text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p)}
                    className="inline-flex items-center rounded-lg bg-red-100 hover:bg-red-200 px-3 py-1.5 text-red-700 text-sm font-medium"
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
