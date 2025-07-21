// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MyWorkPage from "./pages/MyWorkPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AdminPage from "./pages/AdminPage.tsx";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
        <header className="bg-white shadow-md sticky top-0 z-50">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              My Portfolio
            </Link>
            <div className="space-x-6 text-gray-600">
              <Link to="/" className="hover:text-blue-500 transition-colors">
                My Work
              </Link>
              <Link
                to="/about"
                className="hover:text-blue-500 transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="hover:text-blue-500 transition-colors"
              >
                Contact
              </Link>

              {/* === LÄGG TILL DENNA RAD === */}
              <Link
                to="/login"
                className="text-sm text-gray-400 hover:text-blue-500"
              >
                Admin
              </Link>
            </div>
          </nav>
        </header>
        <main className="container mx-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<MyWorkPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route path="" element={<AdminPage />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
