const mongoose = require('mongoose');

async function checkDuplicates() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/pointznest');
        console.log('Connected to database');

        const customers = await mongoose.connection.db.collection('customers').find({
            $or: [
                { username: 'arun' },
                { phone: '6543217890' }
            ]
        }).toArray();

        console.log(`Found ${customers.length} customers matching 'arun' or '6543217890':`);
        customers.forEach(c => {
            console.log(`- ID: ${c.customer_id}, Name: ${c.username}, Phone: ${c.phone}, Points: ${c.points}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkDuplicates();
