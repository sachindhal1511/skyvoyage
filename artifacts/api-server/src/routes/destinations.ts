import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, destinationsTable } from "@workspace/db";
import {
  GetDestinationsQueryParams,
  GetDestinationParams,
  GetDestinationsResponseItem,
  GetDestinationResponse,
  GetFeaturedDestinationsResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/destinations", async (req, res): Promise<void> => {
  const parsed = GetDestinationsQueryParams.safeParse(req.query);
  let query = db.select().from(destinationsTable);
  const rows = await query;

  let results = rows;
  if (parsed.success) {
    if (parsed.data.category) {
      results = results.filter(d => d.category.toLowerCase() === parsed.data.category!.toLowerCase());
    }
    if (parsed.data.search) {
      const s = parsed.data.search.toLowerCase();
      results = results.filter(d => d.name.toLowerCase().includes(s) || d.country.toLowerCase().includes(s));
    }
    if (parsed.data.budget) {
      results = results.filter(d => d.budgetLevel.toLowerCase() === parsed.data.budget!.toLowerCase());
    }
  }

  res.json(results.map(d => GetDestinationsResponseItem.parse({ ...d, tags: d.tags ?? [] })));
});

router.get("/destinations/featured", async (req, res): Promise<void> => {
  const rows = await db.select().from(destinationsTable).where(eq(destinationsTable.isFeatured, true));
  res.json(rows.map(d => GetFeaturedDestinationsResponseItem.parse({ ...d, tags: d.tags ?? [] })));
});

router.get("/destinations/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetDestinationParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [dest] = await db.select().from(destinationsTable).where(eq(destinationsTable.id, params.data.id));
  if (!dest) {
    res.status(404).json({ error: "Destination not found" });
    return;
  }

  res.json(GetDestinationResponse.parse({ ...dest, tags: dest.tags ?? [] }));
});

export default router;
