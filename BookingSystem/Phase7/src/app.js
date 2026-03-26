// src/app.js
import express from "express";
import cookieParser from "cookie-parser"; // ✅ Add this import
import resourcesRouter from "./routes/resources.routes.js";
import reservationsRouter from "./routes/reservations.routes.js";
import authRoutes from "./routes/auth.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "./middleware/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware ---
app.use(express.json()); // Parse application/json
app.use(cookieParser()); // ✅ Add cookie parser middleware

// Content Security Policy Header
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' 'unsafe-eval' https://cdn.tailwindcss.com https://fonts.googleapis.com https://fonts.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src https://fonts.gstatic.com;"
  );
  next();
});

// Serve everything in ./public as static assets
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// --- Views (HTML pages) ---
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/resources", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views/resources.html'));
});

app.get("/reservations", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views/reservations.html'));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(publicDir, "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(publicDir, "register.html"));
});

// ----------------------------
// API routes
// ----------------------------
app.use("/api/resources", resourcesRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/auth", authRoutes);

// ----------------------------
// API 404 (unknown API routes)
// ----------------------------
app.use("/api", (req, res) => {
  return res.status(404).json({
    ok: false,
    error: "Not found",
    path: req.originalUrl,
  });
});

// ----------------------------
// Frontend 404 (unknown pages)
// ----------------------------
app.use((req, res) => {
  return res.status(404).send("404 - Page not found");
});

// ----------------------------
// Central error handler
// ----------------------------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  if (res.headersSent) return next(err);

  return res.status(500).json({
    ok: false,
    error: "Internal server error",
  });
});

export default app;