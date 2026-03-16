const express = require('express');
const path = require('path');
const db = require('./db/connectionPool');

const PORT = 3000;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/', (req, res) => {
    res.send(`<h1>Hi, World!</h1>`)
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
    db.query('SELECT 1')
        .then(() =>{
            console.log('Database connection successful!');
        })
        .catch((err) => {
            console.error('Database connection failed:', err);
        });
});