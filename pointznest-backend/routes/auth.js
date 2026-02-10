const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require('bcrypt');



// ✅ CUSTOMER REGISTER
router.post("/register", async (req, res) => {
  const { username, email, phone, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO customers (username, email, phone, password)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [username, email, phone, hashedPassword], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Customer registered successfully" });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ CUSTOMER LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM customers WHERE email = ?";
  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0)
      return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, result[0].password);
    if (!isMatch)
      return res.status(401).json({ message: "Wrong password" });

    res.json({
      message: "Login successful",
      customer: {
        customer_id: result[0].customer_id,
        username: result[0].username,
        email: result[0].email,
      },
    });
  });
});

module.exports = router;
