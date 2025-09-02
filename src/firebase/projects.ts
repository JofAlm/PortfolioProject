import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";
import type { Project } from "../types";

export type UpdateProjectPayload = {
  title: string;
  description: string;
  /** Optional: new image file to replace the old one. */
  newFile?: File | null;
};

/**
 * Fetches a single project document by its ID from Firestore.
 * @param {string} id The ID of the project to fetch.
 * @returns {Promise<Project>} A promise that resolves to the complete Project object.
 * @throws {Error} Throws an error if the project is not found.
 */
export async function getProjectById(id: string): Promise<Project> {
  const projectDocRef = doc(db, "projects", id);
  const docSnap = await getDoc(projectDocRef);

  if (!docSnap.exists()) {
    throw new Error(`Project with ID "${id}" not found.`);
  }

  return { id: docSnap.id, ...docSnap.data() } as Project;
}

/**
 * Updates a project's title/description and optionally replaces its image in Storage.
 * Note: The old image is not deleted for simplicity.
 * @param {string} id The ID of the project to update.
 * @param {UpdateProjectPayload} payload The data to update.
 */
export async function updateProject(
  id: string,
  payload: UpdateProjectPayload
): Promise<void> {
  const dataToUpdate: Partial<Project> = {
    title: payload.title,
    description: payload.description,
  };

  // If a new file is provided, upload it and update image-related fields.
  if (payload.newFile) {
    const newPath = `projects/${id}/${payload.newFile.name}`;
    const storageRef = ref(storage, newPath);
    await uploadBytes(storageRef, payload.newFile);
    const newUrl = await getDownloadURL(storageRef);

    dataToUpdate.imageUrl = newUrl;
    dataToUpdate.imagePath = newPath;
  }

  // Apply the updates to the Firestore document.
  await updateDoc(doc(db, "projects", id), dataToUpdate);
}
