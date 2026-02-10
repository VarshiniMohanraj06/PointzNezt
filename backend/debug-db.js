
const mongoose = require('mongoose');

// Use IPv4 to avoid localhost resolution issues
const uri = 'mongodb://127.0.0.1:27017/pointznest';

console.log("Script starting...");

async function run() {
    try {
        console.log(`Connecting to ${uri}...`);
        // 5 second timeout
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("Connected to MongoDB.");

        const db = mongoose.connection.db;
        const hotels = db.collection('hotels');

        console.log("Fetching indexes...");
        const indexes = await hotels.indexes();
        console.log("Current Indexes:", JSON.stringify(indexes, null, 2));

        let found = false;
        for (let idx of indexes) {
            // Check for hotel_id index (usually name ends in _1 or key contains hotel_id)
            if (idx.key.hotel_id) {
                console.log(`Found conflicting index: ${idx.name}. Dropping...`);
                await hotels.dropIndex(idx.name);
                console.log(`Successfully dropped index: ${idx.name}`);
                found = true;
            }
        }

        if (!found) {
            console.log("No index with hotel_id found. It might have been dropped already.");
        }

    } catch (e) {
        console.error("An error occurred:", e.message);
    } finally {
        // Force close
        await mongoose.disconnect();
        console.log("Disconnected. Script finished.");
        process.exit(0);
    }
}

run();
