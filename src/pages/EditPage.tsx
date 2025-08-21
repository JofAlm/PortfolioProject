import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { getProjectById, updateProject } from "../firebase/projects";
import type { Project } from "../types";

/** Edit form for an existing project (title/description + optional image). */
export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Async state flags
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch the project on mount (and when id changes)
  useEffect(() => {
    let active = true; // guards against state updates after unmount

    (async () => {
      try {
        if (!id) throw new Error("Missing project id");
        const data = await getProjectById(id);
        if (!active) return;
        setProject(data);
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load project");
      } finally {
        if (active) setLoading(false);
      }
    })();

    // Cleanup: prevent updates after unmount and revoke preview object URL
    return () => {
      active = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [id, previewUrl]);

  // Handle new file selection and preview URL lifecycle
  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setNewFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  // Submit handler: updates Firestore and optionally uploads a new image
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);

    try {
      await updateProject(id, { title, description, newFile });
      navigate("/admin"); // go back to admin list after save
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update project");
    } finally {
      setSaving(false);
    }
  }

  // Loading / error / not-found states
  if (loading) return <div className="py-16 text-center">Loading…</div>;
  if (error)
    return <div className="py-16 text-center text-red-600">{error}</div>;
  if (!project)
    return <div className="py-16 text-center">Project not found.</div>;

  // Form UI
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Edit Project</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Title input */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg bg-gray-900 text-white placeholder-gray-400
                       border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 px-4 py-3"
            placeholder="Project title"
          />
        </div>

        {/* Description input */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-lg bg-gray-900 text-white placeholder-gray-400
                       border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 px-4 py-3 resize-y"
            placeholder="Describe the project…"
          />
        </div>

        {/* Current image + optional replacement */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600 mb-2">Current image</p>
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full aspect-video object-cover rounded-lg border border-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Replace image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0 file:bg-yellow-500 file:text-gray-900 hover:file:bg-yellow-400"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="mt-3 w-full aspect-video object-cover rounded-lg border border-gray-200"
              />
            )}
          </div>
        </div>

        {/* Server error (if any) */}
        {error && <div className="text-sm text-red-500">{error}</div>}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-yellow-500 hover:bg-yellow-400
                       px-5 py-2.5 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300
                       px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
