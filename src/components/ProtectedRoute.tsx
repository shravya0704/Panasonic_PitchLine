import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const loggedIn =
    sessionStorage.getItem("adminLoggedIn") === "true";

  if (!loggedIn) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}