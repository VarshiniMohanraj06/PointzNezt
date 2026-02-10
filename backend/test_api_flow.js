const http = require('http');

function post(path, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: body }));
        });

        req.on('error', (e) => reject(e));
        req.write(payload);
        req.end();
    });
}

async function runTest() {
    try {
        console.log("--- 1. Testing Add Customer ---");
        const customerData = {
            name: "Test User " + Date.now(),
            email: "test" + Date.now() + "@example.com",
            phone: "1234567890",
            points: 100
        };
        const customerRes = await post('/api/customer/add', customerData);
        console.log("Status:", customerRes.status);
        console.log("Body:", customerRes.body);

        const customerJson = JSON.parse(customerRes.body);
        if (!customerJson.customer || !customerJson.customer.customer_id) {
            console.error("FAILED to get customer_id from response!");
            return;
        }

        const customerId = customerJson.customer.customer_id;
        console.log("Got Customer ID:", customerId);

        console.log("\n--- 2. Testing Create Bill ---");
        const billData = {
            customer_id: customerId,
            // hotel_id is purposely omitted to test fallback
            bill_details: {
                food: 50,
                services: 10,
                tax: 5,
                total: 65
            },
            points_earned: 10
        };

        const billRes = await post('/api/bill/create', billData);
        console.log("Status:", billRes.status);
        console.log("Body:", billRes.body);

    } catch (error) {
        console.error("Test failed:", error);
    }
}

runTest();
