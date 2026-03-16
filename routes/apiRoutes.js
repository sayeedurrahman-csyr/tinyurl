const express = require('express');
const router = express.Router();
const { shorten_url } = require('../controllers/api/shortenUrlController');

router.post('/shorten-url', shorten_url);
module.exports = router;