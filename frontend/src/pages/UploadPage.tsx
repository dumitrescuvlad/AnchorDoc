import { useMemo, useState } from "react";
import Shell from "../components/Shell";
import { apiNotarize } from "../lib/api/documents";
import { sha256FileAndMetadata } from "../lib/documentMetadata";
import type { NotarizeResponse } from "../types/document";

type Step = "IDLE" | "HASH" | "NOTARIZING" | "DONE" | "ERROR";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("IDLE");
  const [sha, setSha] = useState<string>("");
  const [doc, setDoc] = useState<NotarizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [issuer, setIssuer] = useState("");
  const [receiver, setReceiver] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [shipmentId, setShipmentId] = useState("");

  const metadataPayload = useMemo(
    () => ({
      issuer: issuer.trim(),
      receiver: receiver.trim(),
      documentType: documentType.trim(),
      shipmentId: shipmentId.trim(),
    }),
    [issuer, receiver, documentType, shipmentId],
  );

  const fileMeta = useMemo(() => {
    if (!file) return null;
    return `${(file.size / (1024 * 1024)).toFixed(2)} MB · PDF`;
  }, [file]);

  async function onPickFile(fileToUpload: File) {
    setError(null);
    setDoc(null);
    setFile(fileToUpload);

    setStep("HASH");
    const computedSha = await sha256FileAndMetadata(
      fileToUpload,
      metadataPayload,
    );
    setSha(computedSha);

    setStep("NOTARIZING");

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("metadata", JSON.stringify(metadataPayload));

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

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Field
              label="Issuer"
              value={issuer}
              onChange={setIssuer}
              placeholder="Optional"
            />
            <Field
              label="Receiver"
              value={receiver}
              onChange={setReceiver}
              placeholder="Optional"
            />
            <Field
              label="Document type"
              value={documentType}
              onChange={setDocumentType}
              placeholder="Optional"
            />
            <Field
              label="Shipment ID"
              value={shipmentId}
              onChange={setShipmentId}
              placeholder="Optional"
            />
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
              title="1 Generate fingerprint"
              description={
                sha
                  ? `SHA-256 (file + metadata) · ${sha.slice(0, 16)}…`
                  : "Waiting"
              }
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

          {doc?.metadata && (
            <div className="mt-5 space-y-3 rounded-xl border border-border bg-surface/50 p-4 text-left">
              <div className="text-xs font-medium uppercase tracking-wide text-textMuted">
                Business metadata
              </div>
              <MetaRow label="Issuer" value={doc.metadata.issuer} />
              <MetaRow label="Receiver" value={doc.metadata.receiver} />
              <MetaRow label="Document type" value={doc.metadata.documentType} />
              <MetaRow label="Shipment ID" value={doc.metadata.shipmentId} />
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

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-textMuted">
        {label}
      </label>
      <input
        className="w-full rounded-xl border border-border px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-primarySoft"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-textMuted">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-text">
        {value || "—"}
      </div>
    </div>
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
