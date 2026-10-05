import { Router, Response } from "express";
import { validationResult } from "express-validator";
import { apiKeyAuth } from "../middlewares/apiKeyAuth";
import { listDocumentsDto } from "../dtos/listDocumentsDto";
import { listDocuments, ListScope, StatusFilter } from "../services/signaturesService";
import { errors } from "../common/errors";
import { AuthenticatedApiRequest } from "../types";

const router = Router();

router.get(
  "/",
  apiKeyAuth,
  listDocumentsDto,
  async (req: AuthenticatedApiRequest, res: Response) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      res.status(400).json({
        error: errors.invalidQuery,
        details: validation.array(),
      });
      return;
    }

    try {
      const companyIds = req.companyIds as string[];
      const scope: ListScope = req.query.scope === "company" ? "company" : "user";
      const email = scope === "user" ? String(req.query.email) : undefined;
      const status = (req.query.status as StatusFilter) || "all";
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

      if (scope === "company") {
        console.info(
          `[public-api] company-scope listing by key "${req.apiKeyLabel}" (companies ${companyIds.join(", ")})`,
        );
      }

      const result = await listDocuments({ companyIds, scope, email, status, limit, cursor });

      if (result.kind === "userNotFound") {
        res.status(404).json({ error: errors.userNotFound });
        return;
      }

      if (result.kind === "invalidCursor") {
        res.status(400).json({ error: errors.invalidCursor });
        return;
      }

      res.status(200).json({
        user: result.user,
        data: result.documents,
        nextCursor: result.nextCursor,
      });
    } catch (err) {
      console.error("GET /public-api/v1/documents error:", err);
      res.status(500).json({ error: errors.internal });
    }
  },
);

export default router;
