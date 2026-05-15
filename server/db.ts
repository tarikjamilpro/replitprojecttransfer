import { Pool } from "pg";
import type { AiPrompt, InsertAiPrompt, UpdateAiPrompt } from "@shared/schema";

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
