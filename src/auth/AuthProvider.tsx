import { useState, useEffect, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase/config";
import { AuthContext } from "./AuthContext"; // Imports the context from the new file

// The provider component that wraps the application and provides the auth state.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged is a Firebase listener that fires
    // whenever the user's login state changes.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // Authentication check is now complete.
    });

    // The cleanup function unsubscribes from the listener when the component unmounts.
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
