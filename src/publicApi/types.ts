import { Request } from "express";

export interface ApiKeyEntry {
  companyId: string;
  // Extra companies this key can also read (e.g. a partner with several accounts).
  companyIds?: string[];
  label: string;
  hash: string;
  revoked?: boolean;
}

export interface AuthenticatedApiRequest extends Request {
  companyIds?: string[];
  apiKeyLabel?: string;
}
