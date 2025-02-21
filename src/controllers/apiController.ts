import { Request, Response } from "express";

export const apiController = (req: Request, res: Response) => {
  res.json({ message: "JSON recibido correctamente", data: req.body });
};
