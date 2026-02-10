const mongoose = require('mongoose');
const fs = require('fs');

async function checkDbs() {
    let report = { pointznest: {}, hotel_db: {} };

    try {
        // Check pointznest
        const conn1 = await mongoose.createConnection('mongodb://127.0.0.1:27017/pointznest').asPromise();
        report.pointznest.collections = (await conn1.db.listCollections().toArray()).map(c => c.name);
        report.pointznest.menuCount = await conn1.db.collection('menu').countDocuments();
        report.pointznest.menus = await conn1.db.collection('menu').find().limit(5).toArray();
        report.pointznest.feedbackCount = await conn1.db.collection('feedbacks').countDocuments();
        await conn1.close();

        // Check hotel_db (old one)
        const conn2 = await mongoose.createConnection('mongodb://127.0.0.1:27017/hotel_db').asPromise();
        report.hotel_db.collections = (await conn2.db.listCollections().toArray()).map(c => c.name);
        report.hotel_db.menuCount = await conn2.db.collection('menu').countDocuments();
        report.hotel_db.menus = await conn2.db.collection('menu').find().limit(5).toArray();
        await conn2.close();

        fs.writeFileSync('c:/Users/umama/Pointznest/backend/multi_db_report.json', JSON.stringify(report, null, 2));
        console.log('Report generated at multi_db_report.json');
    } catch (err) {
        fs.writeFileSync('c:/Users/umama/Pointznest/backend/multi_db_report.json', JSON.stringify({ error: err.message }, null, 2));
    }
}

checkDbs();
