const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://127.0.0.1:27017/hotel_db';

async function verify() {
    try {
        await mongoose.connect(MONGO_URI);
        const Menu = mongoose.model('Menu', new mongoose.Schema({ category: String }, { collection: 'menus' }));

        const counts = {
            desserts: await Menu.countDocuments({ category: 'Desserts' }),
            beverages: await Menu.countDocuments({ category: 'Beverages' }),
            combined: await Menu.countDocuments({ category: 'Desserts & Beverages' })
        };

        console.log('CATEGORY COUNTS:', JSON.stringify(counts));
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
verify();
