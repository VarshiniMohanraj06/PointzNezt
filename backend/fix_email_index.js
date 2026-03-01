// Fix duplicate customer email issue
const mongoose = require('mongoose');

async function fixEmailIndex() {
    try {
        await mongoose.connect('mongodb://localhost:27017/pointznest');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('customers');

        // List all indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        // Drop the email_1 index if it exists
        try {
            await collection.dropIndex('email_1');
            console.log('✓ Dropped email_1 index');
        } catch (err) {
            console.log('email_1 index does not exist or already dropped');
        }

        // Recreate the index as sparse (allows multiple nulls)
        await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
        console.log('✓ Created sparse unique index on email');

        // Verify
        const newIndexes = await collection.indexes();
        console.log('New indexes:', JSON.stringify(newIndexes, null, 2));

        await mongoose.disconnect();
        console.log('✓ Fix complete!');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixEmailIndex();
