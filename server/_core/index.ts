import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // Dev-only: bypass OAuth with a mock user session
  if (process.env.NODE_ENV === "development") {
    app.post("/api/dev-login", async (req, res) => {
      try {
        const { email = "dev@tutorflow.local", name = "Dev User" } = req.body || {};
        const openId = `dev_${email.replace(/[^a-z0-9]/gi, "_")}`;

        // Upsert mock user into DB (or skip if no DB)
        const db = await import("../db");
        await db.upsertUser({
          openId,
          name,
          email,
          loginMethod: "dev",
          lastSignedIn: new Date(),
        });

        // Create session token
        const { sdk } = await import("./sdk");
        const sessionToken = await sdk.createSessionToken(openId, {
          name,
          expiresInMs: 1000 * 60 * 60 * 24 * 365, // 1 year
        });

        const { getSessionCookieOptions } = await import("./cookies");
        const { COOKIE_NAME } = await import("@shared/const");
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 365 });

        res.json({ success: true, openId, name, email });
      } catch (error) {
        console.error("[Dev Login] Failed:", error);
        res.status(500).json({ error: "Dev login failed", details: String(error) });
      }
    });
    console.log("[Dev] Dev login available at POST /api/dev-login");
  }

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
