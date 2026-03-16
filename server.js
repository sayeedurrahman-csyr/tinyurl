const express = require('express');
const path = require('path');
const db = require('./db/connectionPool');

const PORT = 3000;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // This middleware is needed for dealing with JSON.

app.post('/api/shorten-url', async (req, res) => {
    let { alias, long_url } = req.body;

    if (!alias || !long_url) {
        return res.status(400).json({ 
            'message': 'Alias and long_url are required fields.',
            'error': 'Bad Request' 
        });
    }

    long_url = long_url.trim().toLowerCase();
    alias = alias.trim().toLowerCase();

    // If the user input did not include protocol
    if (!(long_url.startsWith('http') || long_url.startsWith('https'))) {
        // Check with https first
        let protocol = 'https://';
        let response = await fetch(protocol + long_url, { method: 'HEAD' });
        if (!response.ok) {
            // If https fails, try with http
            protocol = 'http://';
            response = await fetch(protocol + long_url, { method: 'HEAD' });
            // If both fail, then return error
            if (!response.ok) {
                return res.status(400).json({ 
                    'message': 'The provided long_url is not valid or reachable.',
                    'error': 'Bad Request' 
                });
            }
        }

        long_url = protocol + long_url;
    }

    
    // Store into database
    try {
        let _ = await db.query('INSERT INTO mapping (alias, long_url) VALUES (?, ?)', [alias, long_url]);
        res.status(200).json({ 
            'message': `URL creation successful for ${long_url}`,
            'short_url': `http://localhost:${PORT}/${alias}` 
        });
    }
    catch (err) {
        let message = 'An error occurred while shortening the URL.';
        
        if (err.code === 'ER_DUP_ENTRY') {
            message = 'The provided alias already exists. Please choose a different alias.';
        } else {
            console.error('Unexpected error shortening URL:', err);
        }

        res.status(500).json({ 
            'message': message,
            'error': 'Internal Server Error' 
        });
    }
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