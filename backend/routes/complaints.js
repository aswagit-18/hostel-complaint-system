import express from "express";
import pool from "../db.js";
const router = express.Router();
router.post("/", async (req, res) => {
  try {
    const { reg_no, student_name, room_no, work_type, category, comments } = req.body;
    console.log(" Received body:", req.body);
    if (!reg_no || !student_name || !room_no || !work_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const query = `
      INSERT INTO complaints (reg_no, student_name, room_no, work_type, category, comments, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;

    const values = [reg_no, student_name, room_no, work_type, category || '', comments || ''];

    const result = await pool.query(query, values);

    console.log(" Complaint inserted:", result.rows[0]);

    res.status(201).json({
      message: "Complaint submitted successfully!",
      complaint: result.rows[0],
    });
  } catch (err) {
    console.error(" Database error:", err);
    res.status(500).json({ error: "Database error while submitting complaint" });
  }
});
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM complaints ORDER BY created_at DESC;");
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error while fetching complaints" });
  }
});
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to } = req.body;

    const result = await pool.query(
      `UPDATE complaints SET status = $1, assigned_to = $2 WHERE id = $3 RETURNING *;`,
      [status || "Pending", assigned_to || null, id]
    );

    res.json({ message: "Complaint updated!", complaint: result.rows[0] });
  } catch (err) {
    console.error(" Database error:", err);
    res.status(500).json({ error: "Database error while updating complaint" });
  }
});
router.delete("/delete/all", async (req, res) => {
  try {
    await pool.query("DELETE FROM complaints;");
    res.status(200).json({ message: "All complaints deleted successfully" });
  } catch (err) {
    console.error(" Database error:", err);
    res.status(500).json({ error: "Failed to delete complaints" });
  }
});
export default router;
