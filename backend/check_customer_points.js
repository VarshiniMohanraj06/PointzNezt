// Test script to check customer points in database
const mongoose = require('mongoose');

async function checkCustomerPoints() {
    try {
        await mongoose.connect('mongodb://localhost:27017/pointznest');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const customers = await db.collection('customers').find({}).toArray();

        console.log('\n=== CUSTOMER POINTS REPORT ===\n');
        console.log(`Total customers: ${customers.length}\n`);

        customers.forEach((customer, index) => {
            console.log(`${index + 1}. ${customer.username || 'N/A'}`);
            console.log(`   Email: ${customer.email || 'N/A'}`);
            console.log(`   Phone: ${customer.phone || 'N/A'}`);
            console.log(`   Points: ${customer.points || 0}`);
            console.log(`   Customer ID: ${customer.customer_id || 'N/A'}`);
            console.log('');
        });

        await mongoose.disconnect();
        console.log('✓ Check complete!');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkCustomerPoints();
