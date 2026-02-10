const mongoose = require('mongoose');

async function checkDb() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/pointznest');
        console.log('Connected to pointznest database');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const menuCount = await mongoose.connection.db.collection('menu').countDocuments();
        console.log('Menu items count:', menuCount);

        const feedbackCount = await mongoose.connection.db.collection('feedbacks').countDocuments() || await mongoose.connection.db.collection('Feedback').countDocuments();
        console.log('Feedback items count:', feedbackCount);

        const menus = await mongoose.connection.db.collection('menu').find().toArray();
        console.log('Recent 3 Menus:', JSON.stringify(menus.slice(0, 3), null, 2));

        const feedbacks = await mongoose.connection.db.collection('feedbacks').find().toArray();
        console.log('Recent 3 Feedbacks:', JSON.stringify(feedbacks.slice(0, 3), null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkDb();
