import { Router } from "express";
import { Pool } from "pg";

const router = Router();

// Create a pool for database queries
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// **Get stocks by index (KSE100, etc.) with optimized database filtering**
router.get("/api/stocks/:indexSymbol", async (req, res) => {
  try {
    const { indexSymbol } = req.params;
    const { limit, offset } = req.query;

    const limitNum = limit ? parseInt(limit as string, 10) : 100;
    const offsetNum = offset ? parseInt(offset as string, 10) : 0;

    const stocksQuery = `
      SELECT 
        symbol, name, sector, ldcp, open, high, low, current, 
        change, change_percent as "changePercent", volume, is_positive as "isPositive",
        sector_code as "sectorCode", listed_in as "listedIn"
      FROM stocks
      WHERE listed_in @> $1
      ORDER BY current DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM stocks
      WHERE listed_in @> $1
    `;

    const [stocks, countResult] = await Promise.all([
      pool.query(stocksQuery, [JSON.stringify([indexSymbol]), limitNum, offsetNum]),
      pool.query(countQuery, [JSON.stringify([indexSymbol])])
    ]);

    const total = parseInt(countResult.rows[0].total);

    res.json({
      stocks: stocks.rows,
      total: total,
      index: indexSymbol,
      pagination: {
        offset: offsetNum,
        limit: limitNum,
        hasMore: offsetNum + stocks.rows.length < total
      }
    });
  } catch (error) {
    console.error(
      `Error fetching stocks for index ${req.params.indexSymbol}:`,
      error,
    );
    res.status(500).json({ error: "Failed to fetch index stocks" });
  }
});

// **Get available market indices**
router.get("/api/indices", async (req, res) => {
  try {
    const indices = await pool.query(
      "SELECT symbol, name, current_value, change_value, change_percent, is_positive FROM market_indices ORDER BY symbol",
    );

    res.json(indices.rows);
  } catch (error) {
    console.error("Error fetching market indices:", error);
    res.status(500).json({ error: "Failed to fetch market indices" });
  }
});

export default router;
