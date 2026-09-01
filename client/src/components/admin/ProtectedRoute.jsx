import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

// A "qaaVerifier" account (see server/models/Admin.js) is an externally
// issued login — created only by a superadmin — that must never see the
// rest of the admin panel, only the QAA verification screen. The server
// already rejects every non-QAA API call for this role (see
// server/middleware/restrictQaaVerifier.js); this is the client-side half
// of that same boundary, so the UI doesn't even let them navigate there.
const QAA_ONLY_PATH = "/admin/qaa";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, admin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-navy-500">
        Loading…
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (admin?.role === "qaaVerifier" && location.pathname !== QAA_ONLY_PATH) {
    return <Navigate to={QAA_ONLY_PATH} replace />;
  }
  return children;
}
