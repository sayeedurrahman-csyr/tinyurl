const db = require('../../db/connectionPool');
const path = require('path');  
const PORT = 3000;

exports.redirect_to_longUrl = async (req, res) => {
    const alias = req.params.splat[0];
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    try {
        const [rows] = await db.query('SELECT * FROM mapping WHERE alias = ?', [alias]);

        if (rows.length === 0) return res.redirect('/404');
        return res.redirect(308, rows[0].long_url);
    } catch (err) {
        console.error('Error retrieving long URL from database:', err);
        res.status(500).json({
            message: 'An error occurred while retrieving the long URL.',
            error: 'Internal Server Error'
        });
    }
};

exports.not_found = async (req, res) => {
    // public/NotFound.html
    res.sendFile(path.join(__dirname, '../../public', 'NotFound.html'));
};