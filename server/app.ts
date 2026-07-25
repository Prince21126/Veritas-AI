import express from "express";
import cors from "cors";
import "express-async-errors";
import veritasRouter from "./api/veritas";
import knowledgeRouter from "./api/knowledge";
import authRouter from "./api/auth";
import adminRouter from "./api/admin";
import partnerRouter from "./api/partner";
import sourcesRouter from "./api/sources";

export const app = express();

// Enable CORS for cross-origin requests & OPTIONS preflights
app.use(cors({ origin: true, credentials: true }));

// Middleware for parsing requests
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// URL prefix normalization for serverless platform rewrites
app.use((req, res, next) => {
  if (!req.url.startsWith("/api")) {
    req.url = "/api" + (req.url.startsWith("/") ? "" : "/") + req.url;
  }
  next();
});

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

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({ detail: err.message || "Internal Server Error" });
});

export default app;
