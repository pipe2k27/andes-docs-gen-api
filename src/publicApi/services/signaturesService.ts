import { getAllCompanySignatures, SignatureItem } from "../dynamoDB/signaturesRepo";
import { findUserByEmailForCompany, UserItem } from "../dynamoDB/usersRepo";
import { PublicDocument, toPublicDocument } from "../mappers/signatureMapper";

export type StatusFilter = "pending" | "signed" | "all";

export interface ListDocumentsInput {
  companyId: string;
  email: string;
  status?: StatusFilter;
  limit?: number;
}

export interface ListDocumentsResult {
  user: Pick<UserItem, "userId" | "email" | "role">;
  documents: PublicDocument[];
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

export const listDocuments = async ({
  companyId,
  email,
  status = "all",
  limit = 50,
}: ListDocumentsInput): Promise<ListDocumentsResult | null> => {
  const user = await findUserByEmailForCompany(email, companyId);
  if (!user) return null;

  const allSignatures = await getAllCompanySignatures(companyId);
  const scoped = filterByScope(allSignatures, user);
  const filtered = filterByStatus(scoped, status);

  const capped = filtered.slice(0, limit);

  return {
    user: { userId: user.userId, email: user.email, role: user.role },
    documents: capped.map(toPublicDocument),
  };
};
