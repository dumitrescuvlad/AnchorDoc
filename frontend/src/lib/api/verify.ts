import { buildUrl, handleJson } from "./client";
import type { VerifyResult } from "../../types/verify";

export async function apiVerify(formData: FormData): Promise<VerifyResult> {
  const res = await fetch(buildUrl("/api/documents/verify"), {
    method: "POST",
    body: formData,
  });

  return handleJson<VerifyResult>(res);
}
