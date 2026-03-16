const express = require('express');
const path = require('path');

// Local imports
const db = require('./db/connectionPool');
const api_routes = require('./routes/apiRoutes');
const other_controllers = require('./controllers/others/otherControllers');

const PORT = 3000;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // This middleware is needed for dealing with JSON.

app.use('/api', api_routes);
app.get('/404', other_controllers.not_found);
app.get('/*splat', other_controllers.redirect_to_longUrl);

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