// db.js - UPDATED
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "", // Leave empty if no password
  database: process.env.DB_NAME || "pointznest"
});

db.connect(err => {
  if (err) {
    console.error("❌ DB Connection Failed:", err.message);
    
    // Detailed error info
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("Access denied. Check username/password.");
      console.error("Try these solutions:");
      console.error("1. Check if MySQL is running: sudo service mysql status");
      console.error("2. Try with empty password if you haven't set one");
      console.error("3. Reset MySQL password if needed");
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error("Database 'pointznest' doesn't exist. Creating it...");
      createDatabase();
    } else if (err.code === 'ECONNREFUSED') {
      console.error("MySQL service not running or wrong port.");
      console.error("Start MySQL: sudo service mysql start");
    } else {
      console.error("Error code:", err.code);
    }
  } else {
    console.log("✅ MySQL Connected to database: pointznest");
    initializeTables();
  }
});

// Function to create database if it doesn't exist
function createDatabase() {
  const tempConnection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || ""
  });

  tempConnection.connect(err => {
    if (err) {
      console.error("Cannot connect to MySQL server:", err.message);
      return;
    }

    tempConnection.query("CREATE DATABASE IF NOT EXISTS pointznest", (err) => {
      if (err) {
        console.error("Failed to create database:", err.message);
      } else {
        console.log("✅ Database 'pointznest' created");
        
        // Now connect to the new database
        db.config.database = "pointznest";
        db.connect(initializeTables);
      }
      tempConnection.end();
    });
  });
}

// Function to create tables
function initializeTables() {
  const customersTable = `
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id VARCHAR(50) UNIQUE DEFAULT NULL,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20) NOT NULL,
      password VARCHAR(255) NOT NULL,
      points INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  const hotelsTable = `
    CREATE TABLE IF NOT EXISTS hotels (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hotel_id VARCHAR(50) UNIQUE DEFAULT NULL,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20) NOT NULL,
      password VARCHAR(255) NOT NULL,
      hotel_type VARCHAR(50),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  const feedbackTable = `
    CREATE TABLE IF NOT EXISTS feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT,
      hotel_id INT,
      rating INT CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      feedback_date DATE DEFAULT (CURRENT_DATE),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
    )`;

  const visitsTable = `
    CREATE TABLE IF NOT EXISTS visits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT,
      hotel_id INT,
      hotel_name VARCHAR(200),
      visit_date DATE,
      amount_spent DECIMAL(10, 2),
      rating INT,
      feedback TEXT,
      points_earned INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
    )`;

  db.query(customersTable, (err) => {
    if (err) console.error("Error creating customers table:", err.message);
    else console.log("✅ Customers table ready");
  });

  db.query(hotelsTable, (err) => {
    if (err) console.error("Error creating hotels table:", err.message);
    else console.log("✅ Hotels table ready");
  });

  db.query(feedbackTable, (err) => {
    if (err) console.error("Error creating feedback table:", err.message);
    else console.log("✅ Feedback table ready");
  });

  db.query(visitsTable, (err) => {
    if (err) console.error("Error creating visits table:", err.message);
    else console.log("✅ Visits table ready");
  });
}

module.exports = db;