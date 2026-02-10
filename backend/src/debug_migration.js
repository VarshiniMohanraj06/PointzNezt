const mongoose = require('mongoose');
const fs = require('fs');

async function debugData() {
    try {
        const hotelDbUri = "mongodb://127.0.0.1:27017/hotel_db";
        const hotelConn = await mongoose.createConnection(hotelDbUri).asPromise();

        const menu = await hotelConn.db.collection("menu").find().toArray();
        const menus = await hotelConn.db.collection("menus").find().toArray();
        const hotels = await hotelConn.db.collection("hotels").find().toArray();

        const report = {
            menu_count: menu.length,
            menus_count: menus.length,
            hotels_count: hotels.length,
            sample_menu: menu.slice(0, 2),
            sample_hotels: hotels.slice(0, 2)
        };

        fs.writeFileSync('c:/Users/umama/Pointznest/backend/migration_debug.json', JSON.stringify(report, null, 2));
        console.log('Report generated at migration_debug.json');
        await hotelConn.close();
    } catch (err) {
        fs.writeFileSync('c:/Users/umama/Pointznest/backend/migration_debug.json', JSON.stringify({ error: err.message }, null, 2));
    }
}

debugData();
