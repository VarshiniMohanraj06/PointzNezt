const mongoose = require('mongoose');

async function checkDbs() {
    try {
        const conn1 = await mongoose.createConnection('mongodb://127.0.0.1:27017/pointznest').asPromise();
        console.log('--- POINTZNEST ---');
        console.log('Collections:', (await conn1.db.listCollections().toArray()).map(c => c.name).join(', '));
        const menus1 = await conn1.db.collection('menu').find().limit(5).toArray();
        console.log('Menu Count:', await conn1.db.collection('menu').countDocuments());
        console.log('Sample Menus:', JSON.stringify(menus1.map(m => m.name)));

        const feedbacks = await conn1.db.collection('feedbacks').find().limit(5).toArray();
        console.log('Feedback Count:', await conn1.db.collection('feedbacks').countDocuments());
        console.log('Sample Feedbacks:', JSON.stringify(feedbacks.map(f => f.comment)));
        await conn1.close();

        const conn2 = await mongoose.createConnection('mongodb://127.0.0.1:27017/hotel_db').asPromise();
        console.log('\n--- HOTEL_DB ---');
        console.log('Collections:', (await conn2.db.listCollections().toArray()).map(c => c.name).join(', '));
        const menus2 = await conn2.db.collection('menu').find().limit(5).toArray();
        console.log('Menu Count:', await conn2.db.collection('menu').countDocuments());
        console.log('Sample Menus:', JSON.stringify(menus2.map(m => m.name)));
        await conn2.close();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkDbs();
