import { useState } from "react";
import Shell from "../components/Shell";
import { apiVerify } from "../lib/api/verify";
import type { VerifyResult } from "../types/verify";

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [docId, setDocId] = useState("");
  const [sha, setSha] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    if (docId) formData.append("docId", docId);
    if (sha) formData.append("sha256", sha);

    try {
      const out = await apiVerify(formData);
      setResult(out);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed");
    }
  }

  return (
    <Shell title="Verify integrity">
      <div className="mx-auto max-w-[1100px] space-y-6">
        <section className="rounded-2xl border border-border bg-white p-6 shadow-panel md:p-7">
          <div className="max-w-2xl">
            <div className="text-2xl font-semibold tracking-tight">
              Verify document integrity
            </div>
            <div className="mt-2 text-sm leading-6 text-textMuted">
              Upload a PDF to check whether it matches a notarized record. You
              can optionally provide a document ID or SHA-256 hash to narrow the
              verification target.
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-textMuted">
                  PDF file
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3 transition hover:bg-surface">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text">
                      {file ? file.name : "Choose a PDF file"}
                    </div>
                    <div className="mt-1 text-xs text-textMuted">
                      {file
                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                        : "No file selected"}
                    </div>
                  </div>

                  <span className="shrink-0 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium">
                    Browse
                  </span>

                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-textMuted">
                  Document ID
                </label>
                <input
                  className="w-full rounded-xl border border-border px-3.5 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primarySoft"
                  placeholder="Optional"
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-textMuted">
                  SHA-256 hash
                </label>
                <input
                  className="w-full rounded-xl border border-border px-3.5 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primarySoft"
                  placeholder="Optional"
                  value={sha}
                  onChange={(e) => setSha(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-dangerSoft bg-dangerSoft p-3 text-sm text-danger">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-start lg:justify-end">
              <button
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 lg:w-auto lg:min-w-[180px]"
                onClick={run}
              >
                Verify document
              </button>
            </div>
          </div>
        </section>

        {result && (
          <section
            className={[
              "rounded-2xl border p-6 shadow-panel md:p-7",
              result.result === "VERIFIED"
                ? "border-success bg-successSoft"
                : result.result === "MODIFIED"
                  ? "border-danger bg-dangerSoft"
                  : "border-border bg-white",
            ].join(" ")}
          >
            <div className="text-2xl font-semibold tracking-tight">
              {result.result === "VERIFIED"
                ? "Document verified"
                : result.result === "MODIFIED"
                  ? "Document modified"
                  : "Document not found"}
            </div>

            <div className="mt-2 text-sm text-textMuted">
              Verification result based on the uploaded file and available
              notarized data.
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ResultField
                label="Computed SHA-256"
                value={result.computedSha256}
              />
              <ResultField
                label="Notarized SHA-256"
                value={result.notarizedSha256 || "—"}
              />
            </div>

            {result.result !== "NOT_FOUND" && result.notarizedAt && (
              <div className="mt-4">
                <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-textMuted">
                  Notarized at
                </div>
                <div className="rounded-xl border border-border bg-white/80 px-3 py-3 font-mono text-sm">
                  {result.notarizedAt}
                </div>
              </div>
            )}

            {result.result !== "NOT_FOUND" && result.iotaExplorerUrl && (
              <a
                className="mt-5 inline-flex items-center justify-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-surface"
                href={result.iotaExplorerUrl}
                target="_blank"
                rel="noreferrer"
              >
                View on IOTA Explorer
              </a>
            )}
          </section>
        )}
      </div>
    </Shell>
  );
}

function ResultField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-textMuted">
        {label}
      </div>
      <div className="rounded-xl border border-border bg-white/80 px-3 py-3 font-mono text-sm break-all">
        {value}
      </div>
    </div>
  );
}
