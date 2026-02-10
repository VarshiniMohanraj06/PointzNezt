
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/pointznest';

async function diagnose() {
    try {
        console.log('Connecting to:', DB_URI);
        await mongoose.connect(DB_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const hotels = db.collection('hotels');
        const indexes = await hotels.indexes();
        console.log('Current Indexes on hotels:', JSON.stringify(indexes, null, 2));

        // Find and drop any index that uses hotel_id
        for (const idx of indexes) {
            if (idx.key.hotel_id) {
                console.log(`Found index on hotel_id: ${idx.name}. Dropping...`);
                try {
                    await hotels.dropIndex(idx.name);
                    console.log(`Dropped ${idx.name}`);
                } catch (e) {
                    console.error(`Failed to drop ${idx.name}:`, e);
                }
            }
        }

        console.log('Diagnosis complete.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

diagnose();
