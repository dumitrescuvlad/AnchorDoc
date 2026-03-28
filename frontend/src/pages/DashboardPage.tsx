import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { apiGetDocument, apiGetDocuments } from "../lib/api/documents";
import { apiVerify } from "../lib/api/verify";
import type { DocumentDetails, DocumentItem } from "../types/document";

export default function DashboardPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<DocumentDetails | null>(null);
  const [stats, setStats] = useState({ total: 0 });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      const res = await apiGetDocuments(50, 0, q || undefined);
      setItems(res.items);
      setStats({ total: res.total });

      setSelectedId((currentSelectedId) => {
        if (
          currentSelectedId &&
          res.items.some((item) => item.id === currentSelectedId)
        ) {
          return currentSelectedId;
        }

        return res.items?.[0]?.id ?? null;
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Load failed");
    }
  }, [q]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    void (async () => {
      try {
        const documentDetails = await apiGetDocument(selectedId);
        setSelected(documentDetails);
      } catch {
        setSelected(null);
      }
    })();
  }, [selectedId]);

  const notarizedCount = useMemo(
    () => items.filter((item) => item.status === "NOTARIZED").length,
    [items],
  );

  const lastNotarization = useMemo(() => {
    return items.find((item) => item.notarizedAt)?.notarizedAt || "—";
  }, [items]);

  async function verifyWithUpload(
    docId: string,
    meta: DocumentDetails["metadata"] | undefined,
  ) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("docId", docId);

      formData.append(
        "metadata",
        JSON.stringify({
          issuer: meta?.issuer ?? "",
          receiver: meta?.receiver ?? "",
          documentType: meta?.documentType ?? "",
          shipmentId: meta?.shipmentId ?? "",
        }),
      );

      const res = await apiVerify(formData);

      alert(
        `Verify result: ${res.result}\ncomputed: ${res.computedSha256}\nnotarized: ${res.notarizedSha256}`,
      );
    };

    input.click();
  }

  return (
    <Shell
      title="Documents"
      right={
        <button
          className="rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-medium transition hover:bg-surface"
          onClick={() => {
            void load();
          }}
        >
          Sync
        </button>
      }
    >
      <div className="space-y-6">
        <section>
          <div className="text-sm text-textMuted">
            Notarized transport documents anchored on IOTA.
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <CardStat label="Total documents" value={stats.total} />
          <CardStat label="Notarized" value={notarizedCount} />
          <CardStat label="Last notarization" value={lastNotarization} isText />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <div className="rounded-2xl border border-border bg-white shadow-panel">
              <div className="border-b border-border px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold">All documents</div>
                    <div className="mt-1 text-sm text-textMuted">
                      Browse notarized transport documents and inspect their
                      proof details.
                    </div>
                  </div>

                  <div className="flex w-full gap-2 lg:w-auto lg:min-w-[420px]">
                    <input
                      className="min-w-0 flex-1 rounded-xl border border-border px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primarySoft"
                      placeholder="Search documents..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />

                    <button
                      className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                      onClick={() => {
                        void load();
                      }}
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="px-5 pt-4">
                  <div className="rounded-xl border border-dangerSoft bg-dangerSoft p-3 text-sm text-danger">
                    {error}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[1.7fr_.8fr_1.2fr_1.1fr] gap-3 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-textMuted">
                    <div>Document</div>
                    <div>Status</div>
                    <div>SHA-256</div>
                    <div>Timestamp</div>
                  </div>

                  {items.length > 0 ? (
                    items.map((item) => (
                      <button
                        key={item.id}
                        className={[
                          "grid w-full grid-cols-[1.7fr_.8fr_1.2fr_1.1fr] gap-3 border-b border-border px-5 py-4 text-left transition",
                          selectedId === item.id
                            ? "bg-surface"
                            : "hover:bg-surface/70",
                        ].join(" ")}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-text">
                            {item.originalFilename}
                          </div>
                        </div>

                        <div>
                          <span className="inline-flex rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium text-text">
                            Anchored
                          </span>
                        </div>

                        <div className="truncate font-mono text-xs text-textMuted">
                          {item.sha256}
                        </div>

                        <div className="text-sm text-textMuted">
                          {item.notarizedAt || item.createdAt}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-5 py-12">
                      <div className="text-base font-semibold">
                        No documents yet
                      </div>
                      <div className="mt-1 text-sm text-textMuted">
                        Upload a document to create your first notarized proof.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-white p-5 shadow-panel">
            <div className="text-base font-semibold">Proof of integrity</div>
            <div className="mt-1 text-sm text-textMuted">
              Review the selected document metadata and blockchain proof.
            </div>

            {selectedId && selected?.id === selectedId ? (
              <div className="mt-5 space-y-4">
                <div>
                  <div className="text-lg font-semibold">
                    {selected.originalFilename}
                  </div>
                  <div className="mt-1 text-sm text-textMuted">
                    {(selected.sizeBytes / (1024 * 1024)).toFixed(2)} MB ·{" "}
                    {selected.mimeType}
                  </div>
                </div>

                <DetailField label="SHA-256" value={selected.sha256} mono />
                <DetailField
                  label="Issuer"
                  value={selected.metadata?.issuer || "—"}
                />
                <DetailField
                  label="Receiver"
                  value={selected.metadata?.receiver || "—"}
                />
                <DetailField
                  label="Document type"
                  value={selected.metadata?.documentType || "—"}
                />
                <DetailField
                  label="Shipment ID"
                  value={selected.metadata?.shipmentId || "—"}
                />
                <DetailField
                  label="Timestamp"
                  value={selected.notarizedAt || "—"}
                  mono
                />

                <DetailField
                  label="IOTA transaction digest"
                  value={selected.iotaTxDigest || "—"}
                  mono
                />

                {selected.iotaExplorerUrl && (
                  <a
                    className="inline-flex w-full items-center justify-center rounded-xl border border-border px-3 py-2.5 text-sm font-medium transition hover:bg-surface"
                    href={selected.iotaExplorerUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on IOTA Explorer
                  </a>
                )}

                <button
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm font-medium transition hover:bg-surface"
                  onClick={() =>
                    verifyWithUpload(selected.id, selected.metadata)
                  }
                >
                  Verify document
                </button>
                <Link
                  className="mt-2 flex w-full items-center justify-center rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium transition hover:bg-surface"
                  to={`/verify?docId=${encodeURIComponent(selected.id)}`}
                >
                  Verify on verify page
                </Link>
              </div>
            ) : (
              <div className="mt-5 text-sm text-textMuted">
                Select a document to review its proof data.
              </div>
            )}
          </aside>
        </section>
      </div>
    </Shell>
  );
}

function CardStat({
  label,
  value,
  isText = false,
}: {
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white px-5 py-4 shadow-panel">
      <div
        className={[
          "font-semibold tracking-tight",
          isText ? "text-base leading-6" : "text-3xl",
        ].join(" ")}
      >
        {value}
      </div>
      <div className="mt-1 text-sm text-textMuted">{label}</div>
    </div>
  );
}

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-textMuted">
        {label}
      </div>
      <div
        className={[
          "rounded-xl border border-border bg-surface px-3 py-3 text-sm",
          mono ? "break-all font-mono" : "",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}
