const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://127.0.0.1:27017/hotel_db';

async function migrate() {
    try {
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        const Menu = mongoose.model('Menu', new mongoose.Schema({
            category: String
        }, { collection: 'menus' }));

        console.log('Searching for items to migrate...');
        const desserts = await Menu.find({ category: 'Desserts' });
        const beverages = await Menu.find({ category: 'Beverages' });

        console.log(`Found ${desserts.length} Desserts and ${beverages.length} Beverages.`);

        const result = await Menu.updateMany(
            { category: { $in: ['Desserts', 'Beverages'] } },
            { $set: { category: 'Desserts & Beverages' } }
        );

        console.log(`Migration result: Updated ${result.modifiedCount} items.`);

        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit(0);
    } catch (err) {
        console.error('MIGRATION ERROR:', err);
        process.exit(1);
    }
}
migrate();
