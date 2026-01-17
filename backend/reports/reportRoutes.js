import express from "express";
import pool from "../db.js";
import PDFDocument from "pdfkit";
const router = express.Router();
async function getFilteredComplaints({ from, to, type, reg_no }) {
  let query = "SELECT * FROM complaints WHERE 1=1";
  const params = [];
  if (from && to) {
    params.push(from, to);
    query += ` AND created_at BETWEEN $${params.length - 1} AND $${params.length}`;
  }
  if (type) {
    params.push(type);
    query += ` AND work_type = $${params.length}`;
  }
  if (reg_no) {
    params.push(reg_no);
    query += ` AND reg_no = $${params.length}`;
  }
  query += " ORDER BY created_at DESC";
  const result = await pool.query(query, params);
  return result.rows;
}
router.get("/pdf", async (req, res) => {
  try {
    const { from, to, type, reg_no } = req.query;
    const complaints = await getFilteredComplaints({ from, to, type, reg_no });
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=complaints_report.pdf");
    doc.pipe(res);
    doc.fontSize(18).font("Helvetica-Bold").text("Student Hostel Complaint Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).font("Helvetica");
    doc.text(`Generated on: ${new Date().toLocaleString()}`);
    if (from && to) doc.text(`Date Range: ${from} → ${to}`);
    if (type) doc.text(`Work Type: ${type}`);
    if (reg_no) doc.text(`Student Reg No: ${reg_no}`);
    doc.moveDown(1);
    const tableTop = doc.y;
    const colWidths = [40, 90, 120, 100, 100];
    doc.rect(40, tableTop, 510, 25).fill("#0047b3");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(12);
    const headers = ["ID", "Reg No", "Work Type", "Status", "Created"];
    let x = 45;
    headers.forEach((h, i) => {
      doc.text(h, x, tableTop + 7);
      x += colWidths[i];
    });
    doc.fillColor("black").font("Helvetica");
    let y = tableTop + 25;
    complaints.forEach((c, idx) => {
      if (y > 760) {
        doc.addPage();
        y = 50;
      }
      if (idx % 2 === 0) {
        doc.rect(40, y, 510, 22).fill("#f2f2f2");
        doc.fillColor("black");
      }
      const row = [
        c.id,
        c.reg_no,
        c.work_type,
        c.status,
        new Date(c.created_at).toLocaleDateString(),
      ];
      x = 45;
      row.forEach((text, i) => {
        doc.text(text, x, y + 5);
        x += colWidths[i];
      });
      doc.rect(40, y, 510, 22).stroke();
      y += 22;
    });
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});
export default router;