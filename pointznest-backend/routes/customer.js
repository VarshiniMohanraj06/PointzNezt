const express = require("express");
const db = require("../db");
const router = express.Router();

/* ADD CUSTOMER */
router.post("/add", (req, res) => {
  const { name, email, phone, points } = req.body;

  const sql = `
    INSERT INTO customers (username, email, phone, password)
    VALUES (?, ?, ?, 'default')
  `;

  db.query(sql, [name, email, phone], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Customer added successfully" });
  });
});

/* GET ALL CUSTOMERS */
router.get("/all", (req, res) => {
  db.query("SELECT * FROM customers", (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

module.exports = router;
