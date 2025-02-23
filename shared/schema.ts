import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const currencies = pgTable("currencies", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  level: integer("level").notNull(),
  class: text("class").notNull(),
  race: text("race").notNull(),
  wallet: json("wallet").$type<Record<string, number>>().notNull().default({}),
});

export const insertCurrencySchema = createInsertSchema(currencies).pick({
  guildId: true,
  name: true,
  symbol: true,
});

export const insertCharacterSchema = createInsertSchema(characters).pick({
  guildId: true,
  userId: true,
  name: true,
  level: true,
  class: true,
  race: true,
});

export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
