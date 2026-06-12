import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, bookmarksTable } from "@workspace/db";
import {
  CreateBookmarkBody,
  DeleteBookmarkParams,
  GetBookmarksResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/bookmarks", async (_req, res): Promise<void> => {
  const rows = await db.select().from(bookmarksTable).orderBy(bookmarksTable.createdAt);
  res.json(rows.map(b => GetBookmarksResponseItem.parse({ ...b, createdAt: b.createdAt.toISOString() })));
});

router.post("/bookmarks", async (req, res): Promise<void> => {
  const parsed = CreateBookmarkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [bookmark] = await db.insert(bookmarksTable).values({
    type: parsed.data.type,
    referenceId: parsed.data.referenceId,
    title: parsed.data.title,
    subtitle: parsed.data.subtitle ?? null,
    imageUrl: parsed.data.imageUrl,
  }).returning();

  res.status(201).json(GetBookmarksResponseItem.parse({ ...bookmark, createdAt: bookmark.createdAt.toISOString() }));
});

router.delete("/bookmarks/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteBookmarkParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(bookmarksTable).where(eq(bookmarksTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
