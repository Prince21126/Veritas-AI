import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import "express-async-errors";
import veritasRouter from "./server/api/veritas";
import knowledgeRouter from "./server/api/knowledge";
import authRouter from "./server/api/auth";
import adminRouter from "./server/api/admin";
import partnerRouter from "./server/api/partner";
import sourcesRouter from "./server/api/sources";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS for cross-origin requests & OPTIONS preflights
  app.use(cors({ origin: true, credentials: true }));

  // Middleware for parsing requests
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Routes
  app.use("/api/v1/veritas", veritasRouter);
  app.use("/api/v1/knowledge", knowledgeRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/partner", partnerRouter);
  app.use("/api/v1/sources", sourcesRouter);

  // Catch-all 404 for unhandled API requests (always return JSON, never HTML)
  app.all("/api/*", (req, res) => {
    res.status(404).json({ detail: `Route API introuvable: ${req.method} ${req.originalUrl}` });
  });

  // Vite middleware for development or Static file serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Server Error:", err);
    res.status(err.status || 500).json({ detail: err.message || "Internal Server Error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
