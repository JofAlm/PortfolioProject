// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

// Protects routes from unauthenticated users
const ProtectedRoute = () => {
  const { user, loading } = useAuth(); // Get auth state from context

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Authenticating...</p>
      </div>
    );
  }

  // If user is authenticated, render the child route; otherwise redirect to login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
