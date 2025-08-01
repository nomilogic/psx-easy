import { Router } from "express";
import { Pool } from "pg";

const router = Router();

// Create a pool for database queries
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// **Get stocks by index (KSE100, etc.)**
router.get("/api/stocks/index/:indexSymbol", async (req, res) => {
  try {
    const { indexSymbol } = req.params;
    
    // Get constituent stocks for the index
    const constituents = await pool.query(
      'SELECT stock_symbol FROM index_constituents WHERE index_symbol = $1',
      [indexSymbol]
    );

    if (constituents.rows.length === 0) {
      return res.json([]);
    }

    // Get stock data for constituents
    const symbols = constituents.rows.map(row => row.stock_symbol);
    const placeholders = symbols.map((_, i) => `$${i + 1}`).join(',');
    
    const stocksQuery = `
      SELECT 
        symbol, name, sector, ldcp, open, high, low, current, 
        change, change_percent as "changePercent", volume, is_positive as "isPositive"
      FROM stocks 
      WHERE symbol IN (${placeholders})
      ORDER BY current DESC
    `;
    
    const stocks = await pool.query(stocksQuery, symbols);

    res.json(stocks.rows);
  } catch (error) {
    console.error(`Error fetching stocks for index ${req.params.indexSymbol}:`, error);
    res.status(500).json({ error: "Failed to fetch index stocks" });
  }
});

// **Get available market indices**
router.get("/api/indices", async (req, res) => {
  try {
    const indices = await pool.query(
      'SELECT symbol, name, current_value, change_value, change_percent, is_positive FROM market_indices ORDER BY symbol'
    );
    
    res.json(indices.rows);
  } catch (error) {
    console.error("Error fetching market indices:", error);
    res.status(500).json({ error: "Failed to fetch market indices" });
  }
});

export default router;