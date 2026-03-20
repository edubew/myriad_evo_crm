import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEV_BYPASS = import.meta.env.DEV;

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (DEV_BYPASS) return children;

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F0F13",
          color: "#6C63FF",
          fontSize: "14px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
