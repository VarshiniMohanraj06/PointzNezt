// setup-database.js
const mysql = require("mysql2");

console.log("🔧 Setting up PointzNest database...");

// Create connection without database first
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: ""  // Change this if you have a password
});

connection.connect(err => {
  if (err) {
    console.error("❌ Cannot connect to MySQL server:", err.message);
    console.log("\n💡 Troubleshooting tips:");
    console.log("1. Is MySQL running? (sudo service mysql status)");
    console.log("2. Try: sudo service mysql start");
    console.log("3. Check if you need a password");
    process.exit(1);
  }

  console.log("✅ Connected to MySQL server");

  // Create database
  connection.query("CREATE DATABASE IF NOT EXISTS pointznest", (err) => {
    if (err) {
      console.error("❌ Failed to create database:", err.message);
      connection.end();
      process.exit(1);
    }

    console.log("✅ Database 'pointznest' created/verified");

    // Switch to database
    connection.changeUser({ database: "pointznest" }, (err) => {
      if (err) {
        console.error("❌ Failed to switch to database:", err.message);
        connection.end();
        process.exit(1);
      }

      // Create tables
      const queries = [
        `CREATE TABLE IF NOT EXISTS customers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          customer_id VARCHAR(50) UNIQUE,
          username VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          phone VARCHAR(20) NOT NULL,
          password VARCHAR(255) NOT NULL,
          points INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS hotels (
          id INT AUTO_INCREMENT PRIMARY KEY,
          hotel_id VARCHAR(50) UNIQUE,
          name VARCHAR(200) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          phone VARCHAR(20) NOT NULL,
          password VARCHAR(255) NOT NULL,
          hotel_type VARCHAR(50),
          address TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      ];

      let completed = 0;
      queries.forEach((query, index) => {
        connection.query(query, (err) => {
          if (err) {
            console.error(`❌ Error creating table ${index + 1}:`, err.message);
          } else {
            console.log(`✅ Table ${index + 1} created successfully`);
          }
          
          completed++;
          if (completed === queries.length) {
            console.log("\n🎉 Database setup completed!");
            console.log("You can now run: npm start");
            connection.end();
          }
        });
      });
    });
  });
});