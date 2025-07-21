// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Authenticating...</p>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
