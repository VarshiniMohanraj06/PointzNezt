import fs from 'fs';
import path from 'path';

process.on('uncaughtException', (err) => {
    fs.appendFileSync(path.join(__dirname, '../crash_report.log'), `UNCAUGHT EXCEPTION: ${err.stack}\n`);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    fs.appendFileSync(path.join(__dirname, '../crash_report.log'), `UNHANDLED REJECTION: ${reason}\n`);
});

import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './db';
import mongoose from 'mongoose';

// Import Routes
import authRoutes from './routes/auth';
import hotelAuthRoutes from './routes/hotelAuth';
import customerRoutes from './routes/customer';
import feedbackRoutes from './routes/feedback';
import hotelRoutes from './routes/hotel';
import billRoutes from './routes/bill';
import reportsRoutes from './routes/reports';
import menuRoutes from './routes/menu';

dotenv.config();

const app = express();
const PORT = 7000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
    const log = `${new Date().toISOString()} ${req.method} ${req.url}\n`;
    try {
        fs.appendFileSync(path.join(__dirname, '../request_7000.log'), log);
    } catch (e) { }
    next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", hotelAuthRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bill", billRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/menu", menuRoutes);

app.get("/api/health", (req: Request, res: Response) => {
    res.json({
        status: "TYPESCRIPT SERVER IS FULLY RUNNING ON 7000 (CLEAN)",
        database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        dbName: mongoose.connection.name,
        timestamp: new Date().toISOString()
    });
});



// TEMPORARY MIGRATION ROUTE
app.get("/api/admin/migrate-data", async (req: Request, res: Response) => {
    try {
        const hotelDbUri = "mongodb://127.0.0.1:27017/hotel_db";
        const hotelConn = await mongoose.createConnection(hotelDbUri).asPromise();
        const oldItems = await hotelConn.db.collection("menu").find().toArray();
        const oldItemsPlural = await hotelConn.db.collection("menus").find().toArray();
        const allOld = [...oldItems, ...oldItemsPlural];

        if (allOld.length > 0) {
            const currentDb = mongoose.connection.db;
            await currentDb.collection("menu").insertMany(allOld.map(i => {
                const { _id, ...rest } = i;
                return rest; // Let Mongo generate new IDs or preserve them? Better safe to let them generate or use existing
            }));
            await hotelConn.close();
            return res.json({ message: `Successfully migrated ${allOld.length} items from hotel_db to pointznest` });
        }
        await hotelConn.close();
        res.json({ message: "No items found in hotel_db to migrate" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: "[FULL-7000-CLEAN] Route not found" });
});

// Start server first, then connect to DB
app.listen(PORT, async () => {
    console.log(`🚀 Full Server running on http://localhost:${PORT}`);
    try {
        await connectDB();
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
    }
});
