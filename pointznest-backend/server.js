// server.js - UPDATED
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customer");
const feedbackRoutes = require("./routes/feedback");

// Import db to initialize connection
const db = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request Logger
const fs = require('fs');
app.use((req, res, next) => {
  const log = `${new Date().toISOString()} ${req.method} ${req.url}\n`;
  try {
    fs.appendFileSync(path.join(__dirname, 'request.log'), log);
  } catch (e) { }
  next();
});

// Serve static files from frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/feedback", feedbackRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) {
      res.status(500).json({ status: "Database connection failed", error: err.message });
    } else {
      res.json({
        status: "LEGACY SERVER IS RUNNING",
        database: "Connected",
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Test database endpoint
app.get("/api/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS result", (err, results) => {
    if (err) {
      res.status(500).json({ error: "Database connection failed", details: err.message });
    } else {
      res.json({
        message: "Database connection successful",
        result: results[0].result
      });
    }
  });
});

// Serve frontend HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/customer-login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/auth/customer-login.html"));
});

app.get("/customer-registration", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/auth/customer-register.html"));
});

app.get("/customer-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dashboards/customer-dashboard.html"));
});

app.get("/hotel-login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/auth/hotel-login.html"));
});

app.get("/hotel-registration", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/auth/hotel-register.html"));
});

app.get("/hotel-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dashboards/hotel-dashboard.html"));
});

app.get("/feedback", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/common/feedback.html"));
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: "[LEGACY-JS] Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test DB: http://localhost:${PORT}/api/test-db`);
});