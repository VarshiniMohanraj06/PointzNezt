const routes = [
    './auth',
    './hotelAuth',
    './customer',
    './feedback',
    './hotel',
    './bill',
    './reports',
    './menu'
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
