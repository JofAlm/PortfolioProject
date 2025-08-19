// src/pages/LoginPage.tsx
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Om användaren redan är inloggad, omdirigera till admin-sidan
  useEffect(() => {
    if (user) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err: unknown) {
      setError(
        "Inloggning misslyckades. Vänligen kontrollera e-post och lösenord."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "calc(100vh - 200px)" }}
    >
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              E-post
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lösenord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 border rounded-md shadow-sm"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
