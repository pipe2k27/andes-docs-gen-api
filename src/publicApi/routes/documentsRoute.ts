import { Router, Response } from "express";
import { validationResult } from "express-validator";
import { apiKeyAuth } from "../middlewares/apiKeyAuth";
import { listDocumentsDto } from "../dtos/listDocumentsDto";
import { listDocuments, StatusFilter } from "../services/signaturesService";
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
      const companyId = req.companyId as string;
      const email = String(req.query.email);
      const status = (req.query.status as StatusFilter) || "all";
      const limit = req.query.limit ? Number(req.query.limit) : 50;

      const result = await listDocuments({ companyId, email, status, limit });

      if (!result) {
        res.status(404).json({ error: errors.userNotFound });
        return;
      }

      res.status(200).json({
        user: result.user,
        data: result.documents,
        nextCursor: null,
      });
    } catch (err) {
      console.error("GET /public-api/v1/documents error:", err);
      res.status(500).json({ error: errors.internal });
    }
  },
);

export default router;
