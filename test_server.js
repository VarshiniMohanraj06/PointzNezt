const express = require('express');
const app = express();
app.get('/test', (req, res) => res.send('OK_9999'));
app.listen(9999, () => console.log('Server started on 9999'));
