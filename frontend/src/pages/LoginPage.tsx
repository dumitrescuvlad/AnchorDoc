import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin, type LoginRole } from "../lib/api/auth";
import { setSession } from "../lib/auth";

export default function LoginPage() {
  const nav = useNavigate();

  const [role, setRole] = useState<LoginRole>("company");
  const [companyName, setCompanyName] = useState("Alfa Srl");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);

    try {
      const res = await apiLogin(
        role,
        role === "company" ? companyName : undefined,
      );

      setSession(res);
      nav("/upload");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-md border border-border rounded-xl bg-white shadow-card p-6">
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
            onClick={onSubmit}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
