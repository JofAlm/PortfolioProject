// src/types/index.ts
import { Timestamp } from "firebase/firestore";

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imagePath?: string; // ← NYTT (valfritt, ex: "projects/<docId>/filnamn.jpg")
  createdAt: Timestamp;
}
