import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Webhook Endpoint
  app.post("/api/webhook", (req, res) => {
    const { event, data } = req.body;
    const secret = req.headers["x-webhook-secret"];

    if (secret !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("Webhook received:", event, data);

    // Logic to update Supabase user status would go here
    // For now, we just acknowledge receipt
    res.json({ status: "ok" });
  });

  // OpenF1 API Proxy
  app.get("/api/openf1/*", async (req: express.Request, res: express.Response) => {
    try {
      const index = req.originalUrl.indexOf("/api/openf1");
      const subUrl = index !== -1 
        ? req.originalUrl.substring(index + "/api/openf1".length).replace(/^\//, "") 
        : req.originalUrl.replace(/^\/api\/openf1\/?/, "");
      const targetUrl = `https://api.openf1.org/v1/${subUrl}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const fetchResponse = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
      clearTimeout(timeoutId);

      if (!fetchResponse.ok) {
        let errorBody = "";
        try {
          errorBody = await fetchResponse.text();
        } catch (_) {}

        if (fetchResponse.status === 401) {
          console.log("[OpenF1 Graceful Handling] Status 401: Live session restricted. Switching to high-fidelity simulated fallback.");
          return res.status(401).json({
            error: "OpenF1 API is currently restricted due to an active live session. Fallback data will be used.",
            detail: errorBody,
            isRestricted: true
          });
        }

        if (fetchResponse.status === 404) {
          console.log("[OpenF1 Graceful Handling] Status 404: No results found upstream. Returning empty list []");
          return res.json([]);
        }

        console.error(`OpenF1 API returned status ${fetchResponse.status}. Body:`, errorBody);
        throw new Error(`OpenF1 API returned status ${fetchResponse.status}: ${errorBody.slice(0, 200)}`);
      }

      const data = await fetchResponse.json();
      res.json(data);
    } catch (error: any) {
      console.error("OpenF1 proxy request failed:", error.message);
      res.status(502).json({ error: error.message || "Failed to fetch from OpenF1 API" });
    }
  });

  // Vite middleware for development
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
