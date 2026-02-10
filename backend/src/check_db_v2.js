const mongoose = require('mongoose');
const fs = require('fs');

async function checkDb() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/pointznest');
        log('Connected to pointznest database');

        const collections = await mongoose.connection.db.listCollections().toArray();
        log('Collections: ' + collections.map(c => c.name).join(', '));

        const menuCount = await mongoose.connection.db.collection('menu').countDocuments();
        log('Menu items count: ' + menuCount);

        const feedbacks = await mongoose.connection.db.collection('feedbacks').find().toArray();
        log('Feedbacks count (feedbacks): ' + feedbacks.length);

        const menus = await mongoose.connection.db.collection('menu').find().toArray();
        log('Recent 3 Menus:\n' + JSON.stringify(menus.slice(0, 3), null, 2));

        if (feedbacks.length > 0) {
            log('Recent 1 Feedback:\n' + JSON.stringify(feedbacks[0], null, 2));
        }

        await mongoose.disconnect();
    } catch (err) {
        log('Error: ' + err.message);
    } finally {
        fs.writeFileSync('c:/Users/umama/Pointznest/backend/db_report.json', output);
    }
}

checkDb();
