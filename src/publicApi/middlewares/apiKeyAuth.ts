import { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { errors } from "../common/errors";
import { ApiKeyEntry, AuthenticatedApiRequest } from "../types";

dotenv.config();

let cachedEntries: ApiKeyEntry[] | null = null;

const loadEntries = (): ApiKeyEntry[] => {
  if (cachedEntries) return cachedEntries;

  const raw = process.env.PUBLIC_API_KEYS;
  if (!raw) {
    cachedEntries = [];
    return cachedEntries;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("PUBLIC_API_KEYS must be a JSON array");
    cachedEntries = parsed.filter(
      (e: ApiKeyEntry) => !!e?.companyId && !!e?.hash && !e?.revoked,
    );
    return cachedEntries;
  } catch (err) {
    console.error("Failed to parse PUBLIC_API_KEYS env var:", err);
    cachedEntries = [];
    return cachedEntries;
  }
};

export const apiKeyAuth = async (
  req: AuthenticatedApiRequest,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.header("x-api-key");
  if (!apiKey) {
    res.status(401).json({ error: errors.missingApiKey });
    return;
  }

  const entries = loadEntries();
  if (entries.length === 0) {
    console.error("PUBLIC_API_KEYS is not configured");
    res.status(500).json({ error: errors.configError });
    return;
  }

  for (const entry of entries) {
    try {
      const match = await bcrypt.compare(apiKey, entry.hash);
      if (match) {
        req.companyId = entry.companyId;
        req.apiKeyLabel = entry.label;
        next();
        return;
      }
    } catch (err) {
      console.warn("bcrypt compare failed for entry", entry.label, err);
    }
  }

  res.status(401).json({ error: errors.invalidApiKey });
};
