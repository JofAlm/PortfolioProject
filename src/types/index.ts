// src/types/index.ts
import { Timestamp } from "firebase/firestore";

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: Timestamp;
}
