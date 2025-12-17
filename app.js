import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, "data.json");
let routesData = { routes: [] };

try {
  const rawData = fs.readFileSync(dataPath, "utf8");
  routesData = JSON.parse(rawData);
  console.log(`Loaded ${routesData.routes.length} jeepney routes`);
} catch (error) {
  console.error("Error loading routes data:", error.message);
}

app.get("/api/routes", (req, res) => {
  res.json(routesData.routes);
});

app.get("/api/routes/:code", (req, res) => {
  const route = routesData.routes.find(
    (r) => r.code.toLowerCase() === req.params.code.toLowerCase()
  );

  if (!route) {
    return res.status(404).json({ error: "Route not found" });
  }

  res.json(route);
});

app.get("/api/search", (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Search query required" });
  }

  const query = q.toLowerCase();
  const results = routesData.routes.filter((route) =>
    route.stops.some((stop) => stop.toLowerCase().includes(query))
  );

  res.json(results);
});

app.get("/api/popular-locations", (req, res) => {
  res.json(routesData.popularLocations || []);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CDO Jeepney Guide API is running!" });
});

app.get("/", (req, res) => {
  res.json({
    name: "CDO Jeepney Guide API",
    version: "1.0.0",
    tagline: "Wag ka mawala sa sariling bayan.",
    endpoints: {
      "GET /api/routes": "Get all jeepney routes",
      "GET /api/routes/:code": "Get route by code",
      "GET /api/search?q=location": "Search routes by location",
      "GET /api/health": "Health check",
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
