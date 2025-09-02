import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProjectById, updateProject } from "../firebase/projects";
import type { Project } from "../types";

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Define a reusable style for form inputs to maintain consistency
  const inputStyles =
    "w-full rounded-lg bg-white text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-3";

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

  useEffect(() => {
    let active = true;
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
    return () => {
      active = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [id, previewUrl]);

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setNewFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await updateProject(id, { title, description, newFile });
      navigate("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update project");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="py-16 text-center">Loading…</div>;
  if (error)
    return <div className="py-16 text-center text-red-600">{error}</div>;
  if (!project)
    return <div className="py-16 text-center">Project not found.</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Project</h1>

      <form
        onSubmit={onSubmit}
        className="p-6 bg-white rounded-lg shadow-md space-y-6"
      >
        <div>
          <label className="block text-sm text-gray-700 font-medium mb-1">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputStyles}
            placeholder="Project title"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className={`${inputStyles} resize-y`}
            placeholder="Describe the project…"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-700 font-medium mb-2">
              Current image
            </p>
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full aspect-video object-cover rounded-lg border border-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 font-medium mb-2">
              Replace image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200"
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

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-green-600 hover:bg-green-500
                       px-5 py-2.5 font-medium text-white focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
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
