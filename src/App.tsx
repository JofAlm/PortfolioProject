// src/App.tsx
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
import { useAuth } from "./auth/AuthProvider"; // <- din hook

import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase/config.ts";

// Valfritt: scrolla till toppen på "back/forward"
function ScrollToTop() {
  useEffect(() => {
    const onPop = () =>
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return null;
}

export default function App() {
  const { user } = useAuth(); // från din AuthProvider
  const isAuthed = !!user;

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
        <Navbar
          logoSrc="/audiovisium-logo.png"
          logoClassName="h-16 w-auto md:h-20" // styr från App
          isAuthed={isAuthed}
          onSignOut={handleSignOut}
        />

        <main className="container mx-auto px-4 sm:px-6 py-6">
          <Routes>
            {/* Publika sidor */}
            <Route path="/" element={<MyWorkPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/login"
              element={
                isAuthed ? <Navigate to="/admin" replace /> : <LoginPage />
              }
            />

            {/* Skyddade rutter via Outlet-pattern */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/edit/:id" element={<EditPage />} />
            </Route>

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="container mx-auto px-6 py-16">
                  <h1 className="text-2xl font-bold mb-2">
                    Sidan kunde inte hittas
                  </h1>
                  <p className="text-gray-600">
                    Kontrollera adressen eller gå tillbaka till startsidan.
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
