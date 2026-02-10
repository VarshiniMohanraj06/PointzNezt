const http = require('http');

function get(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: body }));
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function runTest() {
    try {
        console.log("--- Testing GET /api/feedback/all ---");
        const res = await get('/api/feedback/all');
        console.log("Status:", res.status);
        console.log("Body:", res.body);
    } catch (error) {
        console.error("Test failed:", error);
    }
}

runTest();
