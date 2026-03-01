const mongoose = require('mongoose');

async function listCollections() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/pointznest');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

listCollections();
