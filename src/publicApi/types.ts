import { Request } from "express";

export interface ApiKeyEntry {
  companyId: string;
  label: string;
  hash: string;
  revoked?: boolean;
}

export interface AuthenticatedApiRequest extends Request {
  companyId?: string;
  apiKeyLabel?: string;
}
