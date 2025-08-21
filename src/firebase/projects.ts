// src/firebase/projects.ts
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";
import type { Project } from "../types";

export type UpdateProjectPayload = {
  title: string;
  description: string;
  /** Optional: new image file to replace the old one */
  newFile?: File | null;
};

/** Fetch a project by ID (returns a complete Project object). */
export async function getProjectById(id: string): Promise<Project> {
  const dref = doc(db, "projects", id);
  const snap = await getDoc(dref);

  if (!snap.exists()) {
    throw new Error("Project not found");
  }

  const data = snap.data() as Omit<Project, "id">;
  return { id: snap.id, ...data };
}

/**
 * Update project title/description and optionally replace the image.
 * NOTE: Old images are not deleted here (low risk).
 *       Cleanup logic can be added later if needed.
 */
export async function updateProject(
  id: string,
  payload: UpdateProjectPayload
): Promise<void> {
  const patch: Partial<Project> = {
    title: payload.title,
    description: payload.description,
  };

  // If a new image file is provided, upload and replace image URL
  if (payload.newFile) {
    const newPath = `projects/${id}/${payload.newFile.name}`;
    const sref = ref(storage, newPath);
    await uploadBytes(sref, payload.newFile);
    const newUrl = await getDownloadURL(sref);

    patch.imageUrl = newUrl;
    patch.imagePath = newPath; // stored for potential cleanup later
  }

  // Apply updates to Firestore document
  await updateDoc(doc(db, "projects", id), patch);
}
