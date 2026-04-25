import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  const DATA_DIR = path.join(__dirname, 'data_store');
  const STATUSES_FILE = path.join(DATA_DIR, 'statuses.json');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  if (!fs.existsSync(STATUSES_FILE)) {
    fs.writeFileSync(STATUSES_FILE, JSON.stringify([]));
  }

  // API Routes
  app.get("/api/statuses", (req, res) => {
    try {
      const data = fs.readFileSync(STATUSES_FILE, 'utf-8');
      const statuses = JSON.parse(data);
      // Filter out statuses older than 24 hours
      const now = Date.now();
      const freshStatuses = statuses.filter((s: any) => now - s.timestamp < 24 * 60 * 60 * 1000);
      res.json(freshStatuses);
    } catch (err) {
      res.status(500).json({ error: "Failed to read statuses" });
    }
  });

  app.post("/api/statuses", (req, res) => {
    try {
      const { image, caption } = req.body;
      if (!image) return res.status(400).json({ error: "Image required" });

      const newStatus = {
        id: crypto.randomUUID(),
        image,
        caption,
        timestamp: Date.now()
      };

      const data = fs.readFileSync(STATUSES_FILE, 'utf-8');
      const statuses = JSON.parse(data);
      statuses.push(newStatus);
      fs.writeFileSync(STATUSES_FILE, JSON.stringify(statuses));

      res.status(201).json(newStatus);
    } catch (err) {
      res.status(500).json({ error: "Failed to save status" });
    }
  });

  app.delete("/api/statuses/:id", (req, res) => {
    try {
      const { id } = req.params;
      const data = fs.readFileSync(STATUSES_FILE, 'utf-8');
      const statuses = JSON.parse(data);
      const filtered = statuses.filter((s: any) => s.id !== id);
      fs.writeFileSync(STATUSES_FILE, JSON.stringify(filtered));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete status" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
