import { Router, type IRouter } from "express";
import { db, tripsTable, bookmarksTable, destinationsTable } from "@workspace/db";
import { count, sum } from "drizzle-orm";
import { GetTemperatureTrendsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/summary", async (_req, res): Promise<void> => {
  const [tripsCount] = await db.select({ count: count() }).from(tripsTable);
  const [bookmarksCount] = await db.select({ count: count() }).from(bookmarksTable);
  const trips = await db.select().from(tripsTable);

  const upcomingTrips = trips.filter(t => t.status === "planning" || t.status === "upcoming").length;
  const totalSpend = trips.reduce((acc, t) => acc + (t.estimatedSpend ?? 0), 0);

  res.json({
    totalTrips: tripsCount?.count ?? 0,
    destinationsVisited: Math.max(0, (tripsCount?.count ?? 0) - upcomingTrips),
    upcomingTrips,
    totalSpend,
    savedDestinations: bookmarksCount?.count ?? 0,
    mostVisitedRegion: "Europe",
    avgTripDuration: 7,
  });
});

router.get("/analytics/temperature-trends", async (req, res): Promise<void> => {
  const parsed = GetTemperatureTrendsQueryParams.safeParse(req.query);
  const city = parsed.success && parsed.data.city ? parsed.data.city : "bali";

  const cityData: Record<string, { base: number; rain: number[] }> = {
    bali: { base: 28, rain: [200, 210, 170, 80, 40, 20, 15, 20, 50, 90, 150, 190] },
    paris: { base: 12, rain: [50, 40, 50, 45, 60, 55, 50, 55, 50, 55, 55, 55] },
    tokyo: { base: 15, rain: [50, 60, 120, 130, 150, 170, 140, 150, 200, 200, 95, 40] },
    london: { base: 11, rain: [55, 40, 45, 45, 50, 50, 55, 60, 55, 60, 60, 55] },
    dubai: { base: 28, rain: [10, 10, 15, 5, 0, 0, 0, 0, 0, 0, 5, 10] },
    sydney: { base: 22, rain: [100, 120, 130, 120, 100, 120, 90, 80, 90, 90, 90, 80] },
  };
  const data = cityData[city.toLowerCase()] ?? cityData.bali;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const seasonalOffsets = [-5, -4, -1, 3, 6, 8, 9, 8, 5, 1, -3, -5];

  const result = months.map((month, i) => ({
    month,
    high: Math.round(data.base + seasonalOffsets[i] + 4),
    low: Math.round(data.base + seasonalOffsets[i] - 4),
    rainfall: data.rain[i],
  }));

  res.json(result);
});

router.get("/analytics/popular-destinations", async (_req, res): Promise<void> => {
  const rows = await db.select().from(destinationsTable);

  const result = rows.slice(0, 6).map((d, i) => ({
    name: d.name,
    country: d.country,
    visits: 5000 - i * 600,
    score: d.travelScore,
    imageUrl: d.imageUrl,
  }));

  if (result.length === 0) {
    res.json([
      { name: "Bali", country: "Indonesia", visits: 4800, score: 92, imageUrl: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400" },
      { name: "Paris", country: "France", visits: 4200, score: 89, imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" },
      { name: "Tokyo", country: "Japan", visits: 3900, score: 94, imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400" },
      { name: "New York", country: "USA", visits: 3600, score: 87, imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400" },
      { name: "Dubai", country: "UAE", visits: 3200, score: 85, imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400" },
    ]);
    return;
  }

  res.json(result);
});

export default router;
