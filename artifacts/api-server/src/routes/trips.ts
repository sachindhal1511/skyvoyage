import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, tripsTable } from "@workspace/db";
import {
  CreateTripBody,
  UpdateTripParams,
  UpdateTripBody,
  GetTripParams,
  DeleteTripParams,
  GetTripsResponseItem,
  GetTripResponse,
  UpdateTripResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/trips", async (_req, res): Promise<void> => {
  const rows = await db.select().from(tripsTable).orderBy(tripsTable.createdAt);
  res.json(rows.map(t => GetTripsResponseItem.parse({ ...t, interests: t.interests ?? [], createdAt: t.createdAt.toISOString() })));
});

router.post("/trips", async (req, res): Promise<void> => {
  const parsed = CreateTripBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [trip] = await db.insert(tripsTable).values({
    title: parsed.data.title,
    destination: parsed.data.destination,
    destinationId: parsed.data.destinationId ?? null,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    budget: parsed.data.budget,
    interests: parsed.data.interests ?? [],
    notes: parsed.data.notes ?? null,
    coverImageUrl: parsed.data.coverImageUrl ?? null,
  }).returning();

  res.status(201).json(GetTripResponse.parse({ ...trip, interests: trip.interests ?? [], createdAt: trip.createdAt.toISOString() }));
});

router.get("/trips/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetTripParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, params.data.id));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }

  res.json(GetTripResponse.parse({ ...trip, interests: trip.interests ?? [], createdAt: trip.createdAt.toISOString() }));
});

router.patch("/trips/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateTripParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTripBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [trip] = await db.update(tripsTable).set(parsed.data).where(eq(tripsTable.id, params.data.id)).returning();
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }

  res.json(UpdateTripResponse.parse({ ...trip, interests: trip.interests ?? [], createdAt: trip.createdAt.toISOString() }));
});

router.delete("/trips/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteTripParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [trip] = await db.delete(tripsTable).where(eq(tripsTable.id, params.data.id)).returning();
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
