import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../services/authService";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    (!user || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
