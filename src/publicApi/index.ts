import { Router } from "express";
import documentsRoute from "./routes/documentsRoute";
import { swaggerUi, publicApiSwaggerSpec } from "./config/swagger";

const publicApiRouter = Router();

publicApiRouter.use(
  "/docs",
  swaggerUi.serveFiles(publicApiSwaggerSpec, {}),
  swaggerUi.setup(publicApiSwaggerSpec, {
    customSiteTitle: "Andes Docs — Public API",
  }),
);

publicApiRouter.get("/openapi.json", (_req, res) => {
  res.json(publicApiSwaggerSpec);
});

publicApiRouter.use("/documents", documentsRoute);

export default publicApiRouter;
