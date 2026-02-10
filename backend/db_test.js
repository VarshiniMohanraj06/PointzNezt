const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/hotel_db';

async function test() {
    try {
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected!');

        const testSchema = new mongoose.Schema({ name: String });
        const TestModel = mongoose.model('ConnectionTest', testSchema);

        console.log('Inserting test doc...');
        await new TestModel({ name: 'test_' + Date.now() }).save();
        console.log('Saved successfully!');

        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit(0);
    } catch (err) {
        console.error('DB ERROR:', err.message);
        process.exit(1);
    }
}
test();
