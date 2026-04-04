import express from "express";
import cors from "cors";
import pool from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ message: "API is running successfully 🚀" });
});

// ==================== RESOURCES API (Task I) ====================

// Get all resources
app.get("/api/resources", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, type, description, status FROM resources ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Create resource
app.post("/api/resources", async (req, res) => {
  try {
    const { name, type, description, status } = req.body;
    
    const result = await pool.query(
      "INSERT INTO resources (name, type, description, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, type || null, description || null, status || 'available']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Insert failed:", error);
    res.status(500).json({ error: "Insert failed" });
  }
});

// Update resource
app.put("/api/resources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, status } = req.body;
    
    const result = await pool.query(
      "UPDATE resources SET name = $1, type = $2, description = $3, status = $4 WHERE id = $5 RETURNING *",
      [name, type || null, description || null, status || 'available', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Resource not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete resource
app.delete("/api/resources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM resources WHERE id = $1 RETURNING id", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Resource not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

// ==================== SUBMISSIONS API (Task J) ====================

// Get all submissions (for the bonus page)
app.get("/api/submissions", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, booking_date, purpose, accept_terms, created_at FROM submissions ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Create submission (from Task J form)
app.post("/api/submissions", async (req, res) => {
  try {
    const { name, email, bookingDate, purpose, acceptTerms } = req.body;
    
    const result = await pool.query(
      "INSERT INTO submissions (name, email, booking_date, purpose, accept_terms) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, bookingDate, purpose, acceptTerms]
    );
    
    res.status(201).json({ 
      success: true, 
      message: "Form submitted successfully!",
      data: result.rows[0] 
    });
  } catch (error) {
    console.error("Insert failed:", error);
    res.status(500).json({ error: "Failed to save submission" });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});