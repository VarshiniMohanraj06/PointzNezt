const routes = [
    './routes/auth',
    './routes/hotelAuth',
    './routes/customer',
    './routes/feedback',
    './routes/hotel',
    './routes/bill',
    './routes/reports',
    './routes/menu'
];

async function test() {
    for (const r of routes) {
        try {
            console.log(`Testing import of ${r}...`);
            require(r);
            console.log(`SUCCESS: ${r} imported.`);
        } catch (err) {
            console.error(`FAILED: ${r} - ${err.message}`);
        }
    }
}
test();
