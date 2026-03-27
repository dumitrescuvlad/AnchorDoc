import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../lib/auth";

function NavItem({ to, label }: { to: string; label: string }) {
  const loc = useLocation();
  const active = loc.pathname === to;

  return (
    <Link
      to={to}
      className={[
        "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-surface2 text-text border border-border"
          : "text-textMuted hover:bg-surface hover:text-text",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function Shell({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  const nav = useNavigate();
  const session = getSession();

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 border-r border-border bg-bg md:flex md:flex-col">
          <div className="border-b border-border px-5 py-6">
            <div className="text-[28px] font-semibold tracking-tight leading-none">
              AnchorDoc
            </div>
            <div className="mt-2 text-sm text-textMuted">
              Proof of Delivery notarization on IOTA
            </div>
          </div>

          <div className="flex-1 px-3 py-5">
            <nav className="space-y-1.5">
              {session?.role === "company" ? (
                <NavItem to="/upload" label="Anchor document" />
              ) : null}
              <NavItem to="/dashboard" label="Documents" />
              <NavItem to="/verify" label="Verify integrity" />
            </nav>
          </div>

          <div className="border-t border-border px-4 py-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-textMuted">
              <span className="h-2.5 w-2.5 rounded-full bg-success" />
              <span>IOTA Testnet</span>
            </div>

            <button
              className="mb-2 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm font-medium text-textMuted transition-colors hover:bg-surface hover:text-text"
              onClick={() => nav("/")}
            >
              Back to landing page
            </button>

            <button
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm font-medium text-textMuted transition-colors hover:bg-surface hover:text-text"
              onClick={() => {
                clearSession();
                nav("/");
              }}
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-border bg-bg/95 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-4 px-5 md:px-8">
              <div className="min-w-0">
                <div className="text-[28px] font-semibold tracking-tight text-text leading-none">
                  {title}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-3">
                {right}
                <div className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-textMuted">
                  {session?.role === "company"
                    ? session.companyName || "Company"
                    : "Auditor"}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1">
            <div className="mx-auto w-full max-w-[1400px] px-5 py-6 md:px-8 md:py-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
