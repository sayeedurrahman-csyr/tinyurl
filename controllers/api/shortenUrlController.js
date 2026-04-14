const db = require('../../db/connectionPool');
const PORT = 3000;

exports.shorten_url = async (req, res) => {
    let { alias, long_url } = req.body;

    if (!long_url) {
        return res.status(400).json({ 
            'message': 'Alias and long_url are required fields.',
            'error': 'Bad Request' 
        });
    }

    let forbidden_paths = ['/', '/api', '/api/shorten-url', '/404'];
    if (forbidden_paths.includes(long_url.trim())) {
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
                    'message': 'The provided Long URL is not reachable. This may happen if the URL is invalid or if the server hosting the URL does not support HEAD requests. If you believe this is not right, please specify the exact protocol you want to use (http://example.com or https://example.com).',
                    'error': 'Network Error' 
                });
            }
        }

        if (!response || !response.ok) {
            return res.status(400).json({ 
                'message': 'The provided Long URL is not valid.',
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
            'short_url': `${alias}` 
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
};