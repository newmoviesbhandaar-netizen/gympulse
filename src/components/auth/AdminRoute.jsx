import { Navigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";

export default function AdminRoute({ children }) {
  const { data: profile, isLoading } = useProfile();
  if (isLoading) return null;
  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />;
  return children;
}
