import { useContext } from "react";
import { AuthContext } from "./AuthContext";
// Custom hook for accessing the authentication context.
export const useAuth = () => useContext(AuthContext);
