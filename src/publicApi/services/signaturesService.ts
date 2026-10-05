import { createHash } from "crypto";
import { getAllCompanySignatures, SignatureItem } from "../dynamoDB/signaturesRepo";
import { findUserByEmailForCompany, UserItem } from "../dynamoDB/usersRepo";
import { PublicDocument, toPublicDocument } from "../mappers/signatureMapper";

export type StatusFilter = "pending" | "signed" | "all";
export type ListScope = "user" | "company";

export interface ListDocumentsInput {
  companyIds: string[];
  scope: ListScope;
  email?: string;
  status?: StatusFilter;
  limit?: number;
  cursor?: string;
}

export type ListDocumentsResult =
  | {
      kind: "ok";
      user: Pick<UserItem, "userId" | "email" | "role"> | null;
      documents: PublicDocument[];
      nextCursor: string | null;
    }
  | { kind: "userNotFound" }
  | { kind: "invalidCursor" };

interface CursorPosition {
  d: number;
  id: string;
  // Company tiebreaker (hashed, so the cursor does not expose the companyId); absent
  // in cursors issued before keys could span several companies.
  c?: string;
}

const ADMIN_ROLES: UserItem["role"][] = ["admin", "admin-editor"];
const SUPERVISOR_ROLES: UserItem["role"][] = ["supervisor"];

const isAdminRole = (role?: UserItem["role"]) => !!role && ADMIN_ROLES.includes(role);
const isSupervisorRole = (role?: UserItem["role"]) =>
  !!role && SUPERVISOR_ROLES.includes(role);

const filterByScope = (
  signatures: SignatureItem[],
  user: UserItem,
): SignatureItem[] => {
  if (isAdminRole(user.role)) return signatures;

  if (isSupervisorRole(user.role)) {
    const allowed = new Set<string>([user.userId, ...(user.supervisedUsers || [])]);
    return signatures.filter((s) => !!s.userId && allowed.has(s.userId));
  }

  return signatures.filter((s) => s.userId === user.userId);
};

const filterByStatus = (
  signatures: SignatureItem[],
  status: StatusFilter,
): SignatureItem[] => {
  if (status === "all") return signatures;
  return signatures.filter((s) => s.status === status);
};

const createdMillis = (s: SignatureItem) => {
  const millis = Number(s.dateCreated);
  return Number.isFinite(millis) ? millis : 0;
};

const compareDesc = (a: string, b: string) => (a < b ? 1 : a > b ? -1 : 0);

const companyTiebreaker = (companyId: string) =>
  createHash("sha256").update(String(companyId)).digest("hex").slice(0, 8);

// Newest first; signatureId (then company) breaks ties so the order is total and
// stable across requests.
const compareNewestFirst = (a: CursorPosition, b: CursorPosition) =>
  b.d - a.d || compareDesc(a.id, b.id) || compareDesc(a.c ?? "", b.c ?? "");

const positionOf = (s: SignatureItem): CursorPosition => ({
  d: createdMillis(s),
  id: String(s.signatureId),
  c: companyTiebreaker(s.companyId),
});

const encodeCursor = (position: CursorPosition) =>
  Buffer.from(JSON.stringify(position)).toString("base64url");

const decodeCursor = (cursor: string): CursorPosition | null => {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (typeof parsed?.d !== "number" || typeof parsed?.id !== "string") return null;
    if (parsed.c !== undefined && typeof parsed.c !== "string") return null;
    return { d: parsed.d, id: parsed.id, c: parsed.c };
  } catch {
    return null;
  }
};

export const listDocuments = async ({
  companyIds,
  scope,
  email,
  status = "all",
  limit = 50,
  cursor,
}: ListDocumentsInput): Promise<ListDocumentsResult> => {
  let after: CursorPosition | null = null;
  if (cursor) {
    after = decodeCursor(cursor);
    if (!after) return { kind: "invalidCursor" };
  }

  // The same email can be a different user (and role) in each company of the key.
  const perCompany = await Promise.all(
    companyIds.map(async (companyId) => {
      const user =
        scope === "user"
          ? await findUserByEmailForCompany(email as string, companyId)
          : null;
      if (scope === "user" && !user) return { user, signatures: [] };

      const signatures = await getAllCompanySignatures(companyId);
      return { user, signatures: user ? filterByScope(signatures, user) : signatures };
    }),
  );

  const user = perCompany.find((c) => c.user)?.user ?? null;
  if (scope === "user" && !user) return { kind: "userNotFound" };

  const scoped = perCompany.flatMap((c) => c.signatures);
  const filtered = filterByStatus(scoped, status).sort((a, b) =>
    compareNewestFirst(positionOf(a), positionOf(b)),
  );

  const start = after
    ? filtered.filter((s) => compareNewestFirst(after as CursorPosition, positionOf(s)) < 0)
    : filtered;

  const page = start.slice(0, limit);
  const hasMore = start.length > limit;
  const last = page[page.length - 1];

  return {
    kind: "ok",
    user: user ? { userId: user.userId, email: user.email, role: user.role } : null,
    documents: page.map(toPublicDocument),
    nextCursor: hasMore && last ? encodeCursor(positionOf(last)) : null,
  };
};
