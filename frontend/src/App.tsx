import { Navigate, Route, Routes } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import DashboardPage from "./pages/DashboardPage";
import VerifyPage from "./pages/VerifyPage";
import LandingPage from "./pages/LandingPage";
import { requireRole } from "./lib/auth";

function Protected({
  roles,
  children,
}: {
  roles: ("company" | "auditor")[];
  children: React.ReactNode;
}) {
  const ok = requireRole(roles);
  if (!ok) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Navigate to="/" replace />} />

      <Route
        path="/upload"
        element={
          <Protected roles={["company"]}>
            <UploadPage />
          </Protected>
        }
      />

      <Route
        path="/dashboard"
        element={
          <Protected roles={["company", "auditor"]}>
            <DashboardPage />
          </Protected>
        }
      />

      <Route
        path="/verify"
        element={
          <Protected roles={["auditor", "company"]}>
            <VerifyPage />
          </Protected>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
