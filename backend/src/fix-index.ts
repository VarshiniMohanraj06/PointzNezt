
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') }); // Adjust path if needed

const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/pointznest';

async function fixIndex() {
    try {
        await mongoose.connect(DB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;

        // Fix Hotels collection
        const hotelsCollection = db.collection('hotels');
        const hotelIndexes = await hotelsCollection.indexes();
        console.log('Current Hotel Indexes:', hotelIndexes);

        // Find the index with key { hotel_id: 1 }
        const indexName = hotelIndexes.find(idx => idx.key.hotel_id === 1)?.name;

        if (indexName) {
            console.log(`Dropping index: ${indexName}`);
            await hotelsCollection.dropIndex(indexName);
            console.log('Index dropped successfully.');
        } else {
            console.log('Index on hotel_id not found (maybe already dropped?)');
        }

        // Fix Customers collection (just in case)
        const customersCollection = db.collection('customers');
        const customerIndexes = await customersCollection.indexes();
        const custIndexName = customerIndexes.find(idx => idx.key.customer_id === 1)?.name;

        if (custIndexName) {
            console.log(`Dropping customer_id index: ${custIndexName}`);
            await customersCollection.dropIndex(custIndexName);
            console.log('Customer index dropped successfully.');
        }

        console.log('Done. Please restart your backend server now to recreate indexes with sparse: true.');

    } catch (err) {
        console.error('Error fixing index:', err);
    } finally {
        await mongoose.disconnect();
    }
}

fixIndex();
