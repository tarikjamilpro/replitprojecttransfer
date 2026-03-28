import { Pool } from "pg";

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
