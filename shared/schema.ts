import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
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

export const guildSettings = pgTable("guild_settings", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  transactionLogChannel: text("transaction_log_channel"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  fromCharacterId: integer("from_character_id").notNull(),
  toCharacterId: integer("to_character_id").notNull(),
  currencyName: text("currency_name").notNull(),
  amount: integer("amount").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
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

export const insertGuildSettingsSchema = createInsertSchema(guildSettings).pick({
  guildId: true,
  transactionLogChannel: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  guildId: true,
  fromCharacterId: true,
  toCharacterId: true,
  currencyName: true,
  amount: true,
});

export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type GuildSettings = typeof guildSettings.$inferSelect;
export type InsertGuildSettings = z.infer<typeof insertGuildSettingsSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;