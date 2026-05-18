import { Pool } from "pg";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type {
  AiPrompt, InsertAiPrompt, UpdateAiPrompt, PublicUser,
  DigitalProduct, InsertDigitalProduct, UpdateDigitalProduct,
} from "@shared/schema";

const scrypt = promisify(scryptCb) as (password: string, salt: string, keylen: number) => Promise<Buffer>;

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}

const DEFAULT_ADS_CONFIG = {
  interstitial: { active: true, activeProvider: "adsterra" },
  directLinks: { adsterra: "", monetag: "", custom: "" },
  bannerScripts: { adsterra: "", monetag: "", custom: "" },
};

export async function readAdsConfig(): Promise<object> {
  try {
    const db = getPool();
    const result = await db.query("SELECT config FROM ads_config WHERE id = 1");
    return result.rows[0]?.config ?? DEFAULT_ADS_CONFIG;
  } catch (err) {
    console.error("readAdsConfig error:", err);
    return DEFAULT_ADS_CONFIG;
  }
}

export async function writeAdsConfig(data: object): Promise<void> {
  const db = getPool();
  await db.query(
    `INSERT INTO ads_config (id, config, updated_at)
     VALUES (1, $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET config = $1::jsonb, updated_at = NOW()`,
    [JSON.stringify(data)]
  );
}

// ── ai_prompts table ─────────────────────────────────────────────────────────

let promptsTableReady: Promise<void> | null = null;

export function ensureAiPromptsTable(): Promise<void> {
  if (!promptsTableReady) {
    promptsTableReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS ai_prompts (
           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
           title TEXT NOT NULL,
           description TEXT NOT NULL,
           image_url TEXT NOT NULL,
           meigen_target_link TEXT NOT NULL,
           created_at TIMESTAMP NOT NULL DEFAULT NOW(),
           updated_at TIMESTAMP NOT NULL DEFAULT NOW()
         )`
      )
      .then(() => undefined)
      .catch((err) => {
        promptsTableReady = null;
        throw err;
      });
  }
  return promptsTableReady;
}

function rowToPrompt(row: any): AiPrompt {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    meigenTargetLink: row.meigen_target_link,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listAiPrompts(): Promise<AiPrompt[]> {
  await ensureAiPromptsTable();
  const result = await getPool().query(
    `SELECT id, title, description, image_url, meigen_target_link, created_at, updated_at
     FROM ai_prompts ORDER BY created_at DESC`
  );
  return result.rows.map(rowToPrompt);
}

export async function getAiPrompt(id: string): Promise<AiPrompt | null> {
  await ensureAiPromptsTable();
  const result = await getPool().query(
    `SELECT id, title, description, image_url, meigen_target_link, created_at, updated_at
     FROM ai_prompts WHERE id = $1`,
    [id]
  );
  return result.rows[0] ? rowToPrompt(result.rows[0]) : null;
}

export async function createAiPrompt(data: InsertAiPrompt): Promise<AiPrompt> {
  await ensureAiPromptsTable();
  const result = await getPool().query(
    `INSERT INTO ai_prompts (title, description, image_url, meigen_target_link)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, image_url, meigen_target_link, created_at, updated_at`,
    [data.title, data.description, data.imageUrl, data.meigenTargetLink]
  );
  return rowToPrompt(result.rows[0]);
}

export async function updateAiPrompt(id: string, data: UpdateAiPrompt): Promise<AiPrompt | null> {
  await ensureAiPromptsTable();
  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;
  if (data.title !== undefined) { fields.push(`title = $${i++}`); values.push(data.title); }
  if (data.description !== undefined) { fields.push(`description = $${i++}`); values.push(data.description); }
  if (data.imageUrl !== undefined) { fields.push(`image_url = $${i++}`); values.push(data.imageUrl); }
  if (data.meigenTargetLink !== undefined) { fields.push(`meigen_target_link = $${i++}`); values.push(data.meigenTargetLink); }
  if (fields.length === 0) return getAiPrompt(id);
  fields.push(`updated_at = NOW()`);
  values.push(id);
  const result = await getPool().query(
    `UPDATE ai_prompts SET ${fields.join(", ")} WHERE id = $${i}
     RETURNING id, title, description, image_url, meigen_target_link, created_at, updated_at`,
    values
  );
  return result.rows[0] ? rowToPrompt(result.rows[0]) : null;
}

export async function deleteAiPrompt(id: string): Promise<boolean> {
  await ensureAiPromptsTable();
  const result = await getPool().query(`DELETE FROM ai_prompts WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

// ── users table (signup/login) ───────────────────────────────────────────────

let usersTableReady: Promise<void> | null = null;

export function ensureUsersTable(): Promise<void> {
  if (!usersTableReady) {
    usersTableReady = (async () => {
      const db = getPool();
      await db.query(
        `CREATE TABLE IF NOT EXISTS users (
           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
           username TEXT NOT NULL UNIQUE,
           password TEXT NOT NULL
         )`
      );
      // Idempotent column additions for backward compatibility with legacy table
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW()`);
      // Case-insensitive uniqueness for username and email (skip silently if pre-existing dupes)
      await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_unique ON users (LOWER(username))`).catch(() => {});
      await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON users (LOWER(email)) WHERE email IS NOT NULL`).catch(() => {});
    })().catch((err) => {
      usersTableReady = null;
      throw err;
    });
  }
  return usersTableReady;
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = await scrypt(plain, salt, 64);
  return `${salt}:${buf.toString("hex")}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  try {
    const [salt, hashHex] = stored.split(":");
    if (!salt || !hashHex) return false;
    const hashBuf = Buffer.from(hashHex, "hex");
    const testBuf = await scrypt(plain, salt, hashBuf.length);
    return hashBuf.length === testBuf.length && timingSafeEqual(hashBuf, testBuf);
  } catch {
    return false;
  }
}

function rowToPublicUser(row: any): PublicUser {
  return {
    id: row.id,
    username: row.username,
    firstName: row.first_name ?? null,
    lastName: row.last_name ?? null,
    email: row.email ?? "",
  };
}

export async function findUserByUsernameOrEmail(identifier: string): Promise<{ row: any } | null> {
  await ensureUsersTable();
  const id = identifier.trim().toLowerCase();
  const result = await getPool().query(
    `SELECT id, first_name, last_name, username, email, password FROM users
     WHERE LOWER(username) = $1 OR LOWER(email) = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] ? { row: result.rows[0] } : null;
}

export async function createUserAccount(input: {
  firstName: string; lastName: string; username: string; email: string; password: string;
}): Promise<PublicUser> {
  await ensureUsersTable();
  const hashed = await hashPassword(input.password);
  const result = await getPool().query(
    `INSERT INTO users (first_name, last_name, username, email, password)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, first_name, last_name, username, email`,
    [input.firstName, input.lastName, input.username, input.email, hashed]
  );
  return rowToPublicUser(result.rows[0]);
}

export async function loginUserAccount(identifier: string, password: string): Promise<PublicUser | null> {
  const found = await findUserByUsernameOrEmail(identifier);
  if (!found) return null;
  const ok = await verifyPassword(password, found.row.password);
  if (!ok) return null;
  return rowToPublicUser(found.row);
}

// ── digital_products table (Store) ───────────────────────────────────────────

let productsTableReady: Promise<void> | null = null;

export function ensureDigitalProductsTable(): Promise<void> {
  if (!productsTableReady) {
    productsTableReady = (async () => {
      const db = getPool();
      await db.query(
        `CREATE TABLE IF NOT EXISTS digital_products (
           id SERIAL PRIMARY KEY,
           title VARCHAR(255) NOT NULL,
           short_description TEXT,
           price DECIMAL(10, 2) NOT NULL,
           image_url TEXT,
           stock_status VARCHAR(20) DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock')),
           category VARCHAR(100),
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )`
      );
    })().catch((err) => { productsTableReady = null; throw err; });
  }
  return productsTableReady;
}

function rowToProduct(row: any): DigitalProduct {
  return {
    id: row.id,
    title: row.title,
    shortDescription: row.short_description,
    price: row.price,
    imageUrl: row.image_url,
    stockStatus: row.stock_status,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listDigitalProducts(opts: { onlyAvailable?: boolean } = {}): Promise<DigitalProduct[]> {
  await ensureDigitalProductsTable();
  const where = opts.onlyAvailable ? `WHERE stock_status = 'in_stock'` : "";
  const result = await getPool().query(
    `SELECT id, title, short_description, price, image_url, stock_status, category, created_at, updated_at
     FROM digital_products ${where}
     ORDER BY (stock_status = 'in_stock') DESC, created_at DESC`
  );
  return result.rows.map(rowToProduct);
}

export async function getDigitalProduct(id: number): Promise<DigitalProduct | null> {
  await ensureDigitalProductsTable();
  const result = await getPool().query(
    `SELECT id, title, short_description, price, image_url, stock_status, category, created_at, updated_at
     FROM digital_products WHERE id = $1`,
    [id]
  );
  return result.rows[0] ? rowToProduct(result.rows[0]) : null;
}

export async function createDigitalProduct(data: InsertDigitalProduct): Promise<DigitalProduct> {
  await ensureDigitalProductsTable();
  const result = await getPool().query(
    `INSERT INTO digital_products (title, short_description, price, image_url, stock_status, category)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, short_description, price, image_url, stock_status, category, created_at, updated_at`,
    [data.title, data.shortDescription ?? null, data.price, data.imageUrl ?? null, data.stockStatus, data.category ?? null]
  );
  return rowToProduct(result.rows[0]);
}

export async function updateDigitalProduct(id: number, data: UpdateDigitalProduct): Promise<DigitalProduct | null> {
  await ensureDigitalProductsTable();
  const map: Record<string, string> = {
    title: "title", shortDescription: "short_description", price: "price",
    imageUrl: "image_url", stockStatus: "stock_status", category: "category",
  };
  const fields: string[] = []; const values: any[] = []; let i = 1;
  for (const [k, col] of Object.entries(map)) {
    const v = (data as any)[k];
    if (v !== undefined) { fields.push(`${col} = $${i++}`); values.push(v === "" ? null : v); }
  }
  if (fields.length === 0) return getDigitalProduct(id);
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  const result = await getPool().query(
    `UPDATE digital_products SET ${fields.join(", ")} WHERE id = $${i}
     RETURNING id, title, short_description, price, image_url, stock_status, category, created_at, updated_at`,
    values
  );
  return result.rows[0] ? rowToProduct(result.rows[0]) : null;
}

export async function deleteDigitalProduct(id: number): Promise<boolean> {
  await ensureDigitalProductsTable();
  const result = await getPool().query(`DELETE FROM digital_products WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
