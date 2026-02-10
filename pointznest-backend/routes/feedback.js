const express = require("express");
const db = require("../db");
const router = express.Router();

/* ADD FEEDBACK */
router.post("/add", (req, res) => {
  const { customer_id, rating, comment } = req.body;

  const sql = `
    INSERT INTO feedback (customer_id, rating, comment, feedback_date)
    VALUES (?, ?, ?, CURDATE())
  `;

  db.query(sql, [customer_id, rating, comment], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Feedback submitted" });
  });
});

/* GET ALL FEEDBACK */
router.get("/all", (req, res) => {
  const sql = `
    SELECT f.*, c.username as customerName, c.email 
    FROM feedback f
    JOIN customers c ON f.customer_id = c.id
    ORDER BY f.feedback_date DESC
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

module.exports = router;
