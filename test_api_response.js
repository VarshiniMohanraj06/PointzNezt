// Test API response for customer points
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 7000,
    path: '/api/customer/all',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const customers = JSON.parse(data);
            console.log('\n=== API RESPONSE TEST ===\n');
            console.log(`Total customers returned: ${customers.length}\n`);

            console.log('First 5 customers with points field:');
            customers.slice(0, 5).forEach((customer, index) => {
                console.log(`\n${index + 1}. ${customer.username || 'N/A'}`);
                console.log(`   _id: ${customer._id}`);
                console.log(`   customer_id: ${customer.customer_id || 'N/A'}`);
                console.log(`   email: ${customer.email || 'N/A'}`);
                console.log(`   phone: ${customer.phone || 'N/A'}`);
                console.log(`   points: ${customer.points}`);
                console.log(`   points type: ${typeof customer.points}`);
            });

            // Check if points field exists in all customers
            const customersWithPoints = customers.filter(c => c.points !== undefined);
            const customersWithoutPoints = customers.filter(c => c.points === undefined);

            console.log(`\n\nCustomers WITH points field: ${customersWithPoints.length}`);
            console.log(`Customers WITHOUT points field: ${customersWithoutPoints.length}`);

            if (customersWithoutPoints.length > 0) {
                console.log('\nCustomers missing points field:');
                customersWithoutPoints.forEach(c => {
                    console.log(`  - ${c.username} (${c._id})`);
                });
            }

        } catch (err) {
            console.error('Error parsing JSON:', err);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('Error making request:', error);
});

req.end();
