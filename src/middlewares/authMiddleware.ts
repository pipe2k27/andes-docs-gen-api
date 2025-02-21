import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

export const apiKeyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.header("x-api-key");
  const storedHash = process.env.API_KEY || "";

  if (!apiKey) {
    res.status(403).json({ message: "Forbidden: No API Key provided" });
    return;
  }

  const isMatch = await bcrypt.compare(apiKey, storedHash);
  if (!isMatch) {
    res.status(403).json({ message: "Forbidden: Invalid API Key" });
    return;
  }

  next();
};
