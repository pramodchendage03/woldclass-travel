import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Initial data if not exists
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialData = {
      settings: {
        siteName: "WorldClass Travel",
        primaryColor: "#1e40af",
        secondaryColor: "#fbbf24",
        fontFamily: "Inter",
        logo: "https://picsum.photos/seed/travel-logo/200/80",
        seo: {
          title: "WorldClass Travel - Explore the World",
          description: "Premium international travel agency platform."
        }
      },
      content: {
        home: {
          heroTitle: "Discover Your Next Adventure",
          heroSubtitle: "Experience the world like never before with our curated luxury travel packages.",
          heroImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80"
        },
        about: {
          title: "Our Story",
          content: "WorldClass Travel was founded with a simple mission: to make global exploration accessible and luxurious for everyone.",
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
        }
      },
      destinations: [
        { id: "1", name: "Santorini, Greece", description: "Beautiful white buildings and blue domes.", price: 1200, image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80", type: "Beach" },
        { id: "2", name: "Kyoto, Japan", description: "Historic temples and stunning gardens.", price: 1500, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80", type: "Cultural" },
        { id: "3", name: "Swiss Alps, Switzerland", description: "Majestic mountains and luxury ski resorts.", price: 2000, image: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=800&q=80", type: "Adventure" }
      ],
      blogPosts: [
        { id: "1", title: "Top 10 Travel Tips for 2026", content: "Traveling in 2026 is all about sustainability and local experiences...", date: "2026-03-20", author: "Travel Expert", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80" }
      ],
      services: [
        { id: "1", title: "Travel Planning", description: "Customized itineraries tailored to your preferences.", icon: "Map" },
        { id: "2", title: "Visa Assistance", description: "Hassle-free visa processing for all countries.", icon: "FileText" },
        { id: "3", title: "Hotel Booking", description: "Exclusive deals at the world's finest hotels.", icon: "Hotel" }
      ]
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
  }

  // API Routes
  app.get("/api/data", async (req, res) => {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    res.json(JSON.parse(data));
  });

  app.post("/api/data", async (req, res) => {
    await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  });

  app.post("/api/login", (req, res) => {
    const { password } = req.body;
    if (password === "admin123") {
      res.json({ success: true, token: "mock-token" });
    } else {
      res.status(401).json({ success: false });
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
