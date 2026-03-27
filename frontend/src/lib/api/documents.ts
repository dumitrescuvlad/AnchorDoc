import { buildUrl, handleJson } from "./client";

import type {
  DocumentsListResponse,
  DocumentDetails,
  NotarizeResponse,
} from "../../types/document";

export async function apiNotarize(
  formData: FormData,
): Promise<NotarizeResponse> {
  const res = await fetch(buildUrl("/api/documents/notarize"), {
    method: "POST",
    body: formData,
  });

  return handleJson<NotarizeResponse>(res);
}

export async function apiGetDocuments(
  limit = 20,
  offset = 0,
  q?: string,
): Promise<DocumentsListResponse> {
  const sp = new URLSearchParams();
  sp.set("limit", String(limit));
  sp.set("offset", String(offset));
  if (q) sp.set("q", q);

  const res = await fetch(`${buildUrl("/api/documents")}?${sp}`);

  return handleJson<DocumentsListResponse>(res);
}

export async function apiGetDocument(id: string): Promise<DocumentDetails> {
  const res = await fetch(buildUrl(`/api/documents/${id}`));

  return handleJson<DocumentDetails>(res);
}
