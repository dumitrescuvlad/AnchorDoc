import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Shell from "../components/Shell";
import { apiGetDocument } from "../lib/api/documents";
import { apiVerify } from "../lib/api/verify";
import type { VerifyResult } from "../types/verify";

const DOC_ID_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function looksLikeSha256Hex(s: string) {
  const t = s.trim();
  return t.length === 64 && /^[0-9a-f]+$/i.test(t);
}

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [docId, setDocId] = useState("");
  const [sha, setSha] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [docIdHintError, setDocIdHintError] = useState<string | null>(null);
  const [issuer, setIssuer] = useState("");
  const [receiver, setReceiver] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [shipmentId, setShipmentId] = useState("");

  useEffect(() => {
    const fromUrl = searchParams.get("docId");
    if (fromUrl?.trim()) {
      setDocId(fromUrl.trim());
    }
  }, [searchParams]);

  useEffect(() => {
    const id = docId.trim();
    if (!DOC_ID_UUID_RE.test(id)) {
      setDocIdHintError(null);
      return;
    }

    const t = window.setTimeout(() => {
      void (async () => {
        try {
          const d = await apiGetDocument(id);
          setIssuer(d.metadata.issuer ?? "");
          setReceiver(d.metadata.receiver ?? "");
          setDocumentType(d.metadata.documentType ?? "");
          setShipmentId(d.metadata.shipmentId ?? "");
          setDocIdHintError(null);
        } catch {
          setDocIdHintError("No document found for this ID.");
        }
      })();
    }, 400);

    return () => window.clearTimeout(t);
  }, [docId]);

  const metadataPayload = useMemo(
    () => ({
      issuer: issuer.trim(),
      receiver: receiver.trim(),
      documentType: documentType.trim(),
      shipmentId: shipmentId.trim(),
    }),
    [issuer, receiver, documentType, shipmentId],
  );

  async function run() {
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", JSON.stringify(metadataPayload));

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
              The fingerprint is the PDF plus the business metadata (issuer,
              receiver, type, shipment ID) from when you notarized it. If you
              paste the{" "}
              <span className="font-medium text-text">document ID</span> or the
              notarized <span className="font-medium text-text">SHA-256</span>,
              you only need the file—those fields identify the stored metadata.
              Otherwise, enter the same metadata you used at upload (or leave
              all four empty if you left them empty then).
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
                  placeholder="Optional — from dashboard"
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                />
                {docIdHintError && (
                  <div className="mt-2 text-xs text-danger">{docIdHintError}</div>
                )}
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

              <div className="rounded-xl border border-border bg-surface/30 p-4">
                <div className="mb-3 text-xs font-medium uppercase tracking-wide text-textMuted">
                  Business metadata
                </div>
                {(docId.trim() && DOC_ID_UUID_RE.test(docId.trim())) ||
                looksLikeSha256Hex(sha) ? (
                  <div className="mb-3 text-xs leading-5 text-textMuted">
                    Optional when document ID or SHA-256 is set—the server uses
                    the notarized values for the check.
                  </div>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <VerifyField
                    label="Issuer"
                    value={issuer}
                    onChange={setIssuer}
                  />
                  <VerifyField
                    label="Receiver"
                    value={receiver}
                    onChange={setReceiver}
                  />
                  <VerifyField
                    label="Document type"
                    value={documentType}
                    onChange={setDocumentType}
                  />
                  <VerifyField
                    label="Shipment ID"
                    value={shipmentId}
                    onChange={setShipmentId}
                  />
                </div>
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
              Verification uses the PDF plus the business metadata fields
              below (same fingerprint as notarization).
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ResultField
                label="Computed SHA-256 (file + metadata)"
                value={result.computedSha256}
              />
              <ResultField
                label="Notarized SHA-256"
                value={result.notarizedSha256 || "—"}
              />
            </div>

            <div className="mt-6 rounded-xl border border-border bg-white/80 p-4">
              <div className="mb-3 text-xs font-medium uppercase tracking-wide text-textMuted">
                Submitted metadata
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <MetaLine
                  label="Issuer"
                  value={result.submittedMetadata.issuer}
                />
                <MetaLine
                  label="Receiver"
                  value={result.submittedMetadata.receiver}
                />
                <MetaLine
                  label="Document type"
                  value={result.submittedMetadata.documentType}
                />
                <MetaLine
                  label="Shipment ID"
                  value={result.submittedMetadata.shipmentId}
                />
              </div>
            </div>

            {result.result !== "NOT_FOUND" && (
              <div className="mt-4 rounded-xl border border-border bg-white/80 p-4">
                <div className="mb-3 text-xs font-medium uppercase tracking-wide text-textMuted">
                  Notarized metadata
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetaLine
                    label="Issuer"
                    value={result.metadata.issuer ?? "—"}
                  />
                  <MetaLine
                    label="Receiver"
                    value={result.metadata.receiver ?? "—"}
                  />
                  <MetaLine
                    label="Document type"
                    value={result.metadata.documentType ?? "—"}
                  />
                  <MetaLine
                    label="Shipment ID"
                    value={result.metadata.shipmentId ?? "—"}
                  />
                </div>
              </div>
            )}

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

function VerifyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-textMuted">
        {label}
      </label>
      <input
        className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primarySoft"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Optional"
      />
    </div>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-textMuted">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-text">{value || "—"}</div>
    </div>
  );
}
