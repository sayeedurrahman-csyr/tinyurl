const db = require('../../db/connectionPool');
const PORT = 3000;

exports.shorten_url = async (req, res) => {
    let { alias, long_url } = req.body;

    if (!long_url) {
        return res.status(400).json({
            message: 'Alias and long_url are required fields.',
            error: 'Bad Request'
        });
    }

    const forbiddenUrls = ['/', '/api', '/api/shorten-url', '/404'];
    if (forbiddenUrls.includes(long_url)) {
        return res.status(400).json({
            message: 'Forbidden long url input',
            error: 'Bad Request'
        });
    }

    if (alias?.includes('/')) {
        return res.status(400).json({
            message: "Alias cannot contain subroutes with '/'",
            error: 'Bad Request'
        });
    }

    if (!alias) {
        alias = Math.random().toString(36).substring(2, 8);
    }

    long_url = long_url.trim().toLowerCase();
    alias = alias.trim().toLowerCase();

    if (!(long_url.startsWith('http://') || long_url.startsWith('https://'))) {
        let protocol = 'https://';
        let response;

        try {
            response = await fetch(protocol + long_url, { method: 'HEAD' });
            if (!response.ok) throw new Error('Fallback to HTTP');
        } catch {
            try {
                protocol = 'http://';
                response = await fetch(protocol + long_url, { method: 'HEAD' });
            } catch {
                return res.status(400).json({
                    message: 'The provided long_url is not reachable...',
                    error: 'Network Error'
                });
            }
        }

        if (!response?.ok) {
            return res.status(400).json({
                message: 'The provided long_url is not valid.',
                error: 'Bad Request'
            });
        }

        long_url = protocol + long_url;
    }

    try {
        await db.query('INSERT INTO mapping (alias, long_url) VALUES (?, ?)', [alias, long_url]);
        res.status(200).json({
            message: `URL creation successful for ${long_url}`,
            short_url: `http://localhost:${PORT}/${alias}`
        });
    } catch (err) {
        const message = err.code === 'ER_DUP_ENTRY'
            ? 'The provided alias already exists. Please choose a different alias.'
            : 'An error occurred while shortening the URL.';

        if (err.code !== 'ER_DUP_ENTRY') console.error('Unexpected error shortening URL:', err);

        res.status(500).json({ message, error: 'Internal Server Error' });
    }
};