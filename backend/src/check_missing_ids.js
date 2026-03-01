const mongoose = require('mongoose');

async function checkIds() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/pointznest');
        const customers = await mongoose.connection.db.collection('customers').find({
            $or: [
                { customer_id: null },
                { customer_id: { $exists: false } }
            ]
        }).toArray();

        console.log(`Found ${customers.length} customers with missing customer_id`);
        customers.slice(0, 5).forEach(c => {
            console.log(`- ID: ${c._id}, Name: ${c.username}, Phone: ${c.phone}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkIds();
