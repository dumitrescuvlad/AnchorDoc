import { useMemo, useState } from "react";
import Shell from "../components/Shell";
import { apiNotarize } from "../lib/api/documents";
import type { NotarizeResponse } from "../types/document";

type Step = "IDLE" | "HASH" | "NOTARIZING" | "DONE" | "ERROR";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("IDLE");
  const [sha, setSha] = useState<string>("");
  const [doc, setDoc] = useState<NotarizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileMeta = useMemo(() => {
    if (!file) return null;
    return `${(file.size / (1024 * 1024)).toFixed(2)} MB · PDF`;
  }, [file]);

  async function computeSha256Browser(fileToHash: File) {
    const buffer = await fileToHash.arrayBuffer();
    const hash = await crypto.subtle.digest("SHA-256", buffer);
    const bytes = Array.from(new Uint8Array(hash));

    return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function onPickFile(fileToUpload: File) {
    setError(null);
    setDoc(null);
    setFile(fileToUpload);

    setStep("HASH");
    const computedSha = await computeSha256Browser(fileToUpload);
    setSha(computedSha);

    setStep("NOTARIZING");

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);

      const out = await apiNotarize(formData);
      setDoc(out);
      setStep("DONE");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Notarization failed");
      setStep("ERROR");
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) void onPickFile(droppedFile);
  }

  return (
    <Shell title="Upload document">
      <div className="mx-auto grid max-w-[1180px] gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
        <section className="rounded-2xl border border-border bg-white p-6 shadow-panel md:p-7">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight">
              Anchor a transport document on IOTA
            </h1>
            <p className="mt-2 text-sm leading-6 text-textMuted">
              Upload a PDF document to generate its SHA-256 fingerprint and
              anchor the proof on IOTA. The original file stays off-chain while
              the proof remains immutable and verifiable.
            </p>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="mt-8 rounded-2xl border-2 border-dashed border-border bg-surface/50 px-6 py-16 text-center transition hover:bg-surface"
          >
            <div className="mx-auto max-w-md">
              <div className="text-lg font-semibold">
                Drag and drop a PDF file
              </div>
              <div className="mt-2 text-sm text-textMuted">
                Maximum size 25 MB
              </div>

              <div className="mt-6">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-surface">
                  Select file
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) void onPickFile(selectedFile);
                    }}
                  />
                </label>
              </div>

              {file && (
                <div className="mt-5 rounded-xl border border-border bg-white px-4 py-3 text-left">
                  <div className="truncate text-sm font-medium">
                    {file.name}
                  </div>
                  <div className="mt-1 text-xs text-textMuted">{fileMeta}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-border bg-white p-6 shadow-panel">
          <div className="text-base font-semibold">Notarization flow</div>
          <div className="mt-1 text-sm text-textMuted">
            Follow the proof creation process step by step.
          </div>

          <div className="mt-5 space-y-3">
            <StatusRow
              title="1 Generate SHA-256"
              description={sha ? `SHA-256 · ${sha.slice(0, 16)}…` : "Waiting"}
              status={step === "HASH" ? "processing" : sha ? "done" : "idle"}
            />

            <StatusRow
              title="2 Anchor on IOTA"
              description={
                doc?.iotaTxDigest
                  ? `TX ${doc.iotaTxDigest.slice(0, 16)}…`
                  : "Waiting"
              }
              status={
                step === "NOTARIZING"
                  ? "sending"
                  : step === "DONE"
                    ? "done"
                    : "idle"
              }
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-dangerSoft bg-dangerSoft p-3 text-sm text-danger">
              {error}
            </div>
          )}

          {doc?.iotaExplorerUrl && (
            <a
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-border px-3 py-2.5 text-sm font-medium transition hover:bg-surface"
              href={doc.iotaExplorerUrl}
              target="_blank"
              rel="noreferrer"
            >
              View transaction on IOTA Explorer
            </a>
          )}
        </aside>
      </div>
    </Shell>
  );
}

function StatusRow({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/50 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="mt-1 font-mono text-xs text-textMuted">
            {description}
          </div>
        </div>

        <div className="shrink-0 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium text-textMuted">
          {status}
        </div>
      </div>
    </div>
  );
}
