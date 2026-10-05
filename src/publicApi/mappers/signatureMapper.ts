import { SignatureItem } from "../dynamoDB/signaturesRepo";

export interface PublicDocument {
  id: string;
  companyId: string;
  companyName: string | null;
  fileName: string | null;
  documentKind: string | null;
  status: "pending" | "signed" | string;
  createdAt: string | null;
  signedAt: string | null;
  downloadUrl: string | null;
  creatorEmail: string | null;
}

const toIso = (millisString: string | undefined | null): string | null => {
  if (!millisString) return null;
  const millis = Number(millisString);
  if (!Number.isFinite(millis)) return null;
  return new Date(millis).toISOString();
};

export const toPublicDocument = (item: SignatureItem): PublicDocument => ({
  id: item.signatureId,
  companyId: String(item.companyId),
  companyName: item.companyName ?? null,
  fileName: item.fileName ?? null,
  documentKind: item.documentKind ?? null,
  status: (item.status as PublicDocument["status"]) ?? "pending",
  createdAt: toIso(item.dateCreated),
  signedAt: toIso(item.signedAt),
  downloadUrl: item.signedFile ?? null,
  creatorEmail: item.creatorEmail ?? null,
});
