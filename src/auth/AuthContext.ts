import { createContext } from "react";
import type { User } from "firebase/auth";

// Defines the shape of the data that the context will provide.
export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Create and export the context with a default value.
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});
