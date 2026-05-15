import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const aiPrompts = pgTable("ai_prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  meigenTargetLink: text("meigen_target_link").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAiPromptSchema = createInsertSchema(aiPrompts)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().min(1, "Description is required").max(2000),
    imageUrl: z.string().trim().url("Must be a valid image URL"),
    meigenTargetLink: z.string().trim().url("Must be a valid URL"),
  });

export const updateAiPromptSchema = insertAiPromptSchema.partial();

export type InsertAiPrompt = z.infer<typeof insertAiPromptSchema>;
export type UpdateAiPrompt = z.infer<typeof updateAiPromptSchema>;
export type AiPrompt = typeof aiPrompts.$inferSelect;
