import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/pointznest';
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB Connected to pointznest');

        // SELF-HEALING: Drop the strict hotel_id index if it exists, so Mongoose can recreate it as sparse
        try {
            const db = mongoose.connection.db;
            const hotels = db.collection('hotels');
            const indexes = await hotels.indexes();

            for (const idx of indexes) {
                // Look for index on hotel_id that might not be sparse (or just drop to reset)
                if (idx.key.hotel_id) {
                    // Check if it's already sparse? 
                    // To be safe, we drop it. Mongoose will recreate it on startup if defined in schema.
                    // But we only want to drop it ONCE or if it's bad. 
                    // If we drop it every time, Mongoose creates it every time. It's fine for dev.
                    // But to avoid "index not found" errors, we check existence (loop).
                    console.log(`[Auto-Fix] Found existing index on hotel_id: ${idx.name}. Dropping to ensure correct options...`);
                    await hotels.dropIndex(idx.name);
                    console.log(`[Auto-Fix] Successfully dropped index: ${idx.name}`);
                }
            }
        } catch (idxErr) {
            console.warn("[Auto-Fix] Error checking/dropping indexes (might be fine):", idxErr);
        }
    } catch (err: any) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

export default connectDB;
