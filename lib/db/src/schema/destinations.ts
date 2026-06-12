import { pgTable, serial, text, real, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const destinationsTable = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  category: text("category").notNull(),
  rating: real("rating").notNull().default(4.0),
  travelScore: integer("travel_score").notNull().default(80),
  budgetLevel: text("budget_level").notNull().default("moderate"),
  bestSeason: text("best_season").notNull(),
  avgTemperature: real("avg_temperature").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  currency: text("currency"),
  language: text("language"),
  timezone: text("timezone"),
  isFeatured: boolean("is_featured").notNull().default(false),
  estimatedDailyBudget: real("estimated_daily_budget"),
  tags: jsonb("tags").$type<string[]>().default([]),
});

export const insertDestinationSchema = createInsertSchema(destinationsTable).omit({ id: true });
export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = typeof destinationsTable.$inferSelect;
