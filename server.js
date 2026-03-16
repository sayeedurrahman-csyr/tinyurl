const express = require('express');
const path = require('path');
const db = require('./db/connectionPool');

const PORT = 3000;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // This middleware is needed for dealing with JSON.

app.post('/api/shorten-url', async (req, res) => {
    let { alias, long_url } = req.body;

    if (!long_url) {
        return res.status(400).json({ 
            'message': 'Alias and long_url are required fields.',
            'error': 'Bad Request' 
        });
    }

    if (long_url == '/' || long_url == '/api' || long_url == '/api/shorten-url' || long_url == '/404') {
        return res.status(400).json({
            'message': 'Forbidden long url input',
            'error': 'Bad Reqeust'
        })
    }

    if (alias && alias.includes('/')) {
        return res.status(400).json({
            'message': "Alias cannot contain subroutes with '/'",
            'error': 'Bad Request'
        })
    }

    if (!alias) {
        // Generate random alphaneumeric string of length
        length = 6;
        alias = Math.random().toString(36).substring(2, 2 + length);
    }

    long_url = long_url.trim().toLowerCase();
    alias = alias.trim().toLowerCase();

    if (!(long_url.startsWith('http://') || long_url.startsWith('https://'))) {
        let protocol = 'https://';
        let response;

        try {
            response = await fetch(protocol + long_url, { method: 'HEAD' });
            
            if (!response.ok) {
                throw new Error('Fallback to HTTP'); 
            }
        } catch (e) {
            try {
                protocol = 'http://';
                response = await fetch(protocol + long_url, { method: 'HEAD' });
            } catch (innerError) {
                return res.status(400).json({ 
                    'message': 'The provided long_url is not reachable. This may happen if the URL is invalid or if the server hosting the URL does not support HEAD requests. If you believe this is not right, please specify the exact protocol you want to use (http://example.com or https://example.com).',
                    'error': 'Network Error' 
                });
            }
        }

        if (!response || !response.ok) {
            return res.status(400).json({ 
                'message': 'The provided long_url is not valid.',
                'error': 'Bad Request' 
            });
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

app.get('/404', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public', 'NotFound.html'));
});

app.get('/*splat', async (req, res, next) => {
    const alias = req.params.splat[0];
    // For development
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    // For production
    // res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    try {
        const [rows] = await db.query("SELECT * FROM mapping WHERE alias = ?", [alias]);
        
        if (rows.length == 0) {
            return res.redirect('/404');
        } else {
            return res.redirect(308, rows[0].long_url);
        }
    } catch(err) {
        console.error('Error retrieving long URL from database:', err);
        return res.status(500).json({ 
            'message': 'An error occurred while retrieving the long URL.',
            'error': 'Internal Server Error' 
        });
    };
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