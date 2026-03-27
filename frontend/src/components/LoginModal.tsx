import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin, type LoginRole } from "../lib/api/auth";
import { setSession } from "../lib/auth";

export default function LoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const nav = useNavigate();

  const [role, setRole] = useState<LoginRole>("company");
  const [companyName, setCompanyName] = useState("Alfa Srl");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setRole("company");
    setCompanyName("Alfa Srl");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function onSubmit() {
    setError(null);
    try {
      const res = await apiLogin(
        role,
        role === "company" ? companyName : undefined,
      );
      setSession(res);
      onClose();
      nav(res.role === "company" ? "/upload" : "/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-white shadow-card p-6 text-text"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="text-xl font-semibold">AnchorDoc</div>
        <div className="text-sm text-textMuted mt-1">
          Demo login (Company / Auditor)
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="text-xs text-textMuted mb-2">Role</div>

            <div className="flex gap-2">
              <button
                className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                  role === "company"
                    ? "border-primary bg-primarySoft text-primary"
                    : "border-border hover:bg-surface"
                }`}
                onClick={() => setRole("company")}
                type="button"
              >
                Company
              </button>

              <button
                className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                  role === "auditor"
                    ? "border-primary bg-primarySoft text-primary"
                    : "border-border hover:bg-surface"
                }`}
                onClick={() => setRole("auditor")}
                type="button"
              >
                Auditor
              </button>
            </div>
          </div>

          {role === "company" && (
            <div>
              <div className="text-xs text-textMuted mb-2">Company name</div>

              <input
                className="w-full border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primarySoft"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          )}

          {error && (
            <div className="text-sm text-danger bg-dangerSoft border border-dangerSoft rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            className="w-full bg-primary text-white rounded-lg px-3 py-2 font-medium hover:bg-blue-700"
            onClick={() => void onSubmit()}
            type="button"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

