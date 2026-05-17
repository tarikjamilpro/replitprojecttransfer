import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name"),
  lastName: text("last_name"),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const signupUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(50)
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, _ . -"),
  email: z.string().trim().toLowerCase().email("Must be a valid email").max(150),
  password: z.string().min(6, "Password must be at least 6 characters").max(200),
});

export const loginUserSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type SignupUser = z.infer<typeof signupUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type PublicUser = { id: string; username: string; firstName: string | null; lastName: string | null; email: string };

// Backwards-compat aliases (legacy MemStorage uses these)
export const insertUserSchema = signupUserSchema;
export type InsertUser = SignupUser;

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
