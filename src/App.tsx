import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";

import MyWorkPage from "./pages/MyWorkPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import EditPage from "./pages/EditPage";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthProvider";

import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase/config.ts";

/** Scrolls to the top when navigating back/forward. */
function ScrollToTop() {
  useEffect(() => {
    const onPop = () =>
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return null;
}

/** Main application entry with routes, auth handling, and layout. */
export default function App() {
  const { user } = useAuth(); // Get user state from AuthProvider
  const isAuthed = !!user; // Boolean flag for authentication

  /** Sign out current user from Firebase Auth. */
  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
        {/* Global navbar with logo and login/logout state */}
        <Navbar
          logoSrc="/audiovisium-logo.png"
          logoClassName="h-16 w-auto md:h-20"
          isAuthed={isAuthed}
          onSignOut={handleSignOut}
        />

        <main className="container mx-auto px-4 sm:px-6 py-6">
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<MyWorkPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/login"
              element={
                isAuthed ? <Navigate to="/admin" replace /> : <LoginPage />
              }
            />

            {/* Protected routes (requires authentication) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/edit/:id" element={<EditPage />} />
            </Route>

            {/* Catch-all route (404 page) */}
            <Route
              path="*"
              element={
                <div className="container mx-auto px-6 py-16">
                  <h1 className="text-2xl font-bold mb-2">Page not found</h1>
                  <p className="text-gray-600">
                    Check the URL or go back to the homepage.
                  </p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
