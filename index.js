const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours

const app = express();

// Enable CORS
app.use(cors());

const urls = {
    divisions: 'https://raw.githubusercontent.com/nuhil/bangladesh-geocode/refs/heads/master/divisions/divisions.json',
    districts: 'https://raw.githubusercontent.com/nuhil/bangladesh-geocode/refs/heads/master/districts/districts.json',
    upazilas: 'https://raw.githubusercontent.com/nuhil/bangladesh-geocode/refs/heads/master/upazilas/upazilas.json',
    unions: 'https://raw.githubusercontent.com/nuhil/bangladesh-geocode/refs/heads/master/unions/unions.json'
};

app.get('/api/:type', async (req, res) => {
    const { type } = req.params;
    const url = urls[type];

    if (!url) {
        return res.status(404).json({ error: 'Invalid endpoint' });
    }

    try {
        // Check if data exists in cache
        const cachedData = cache.get(type);
        if (cachedData) {
            return res.json(cachedData);
        }

        // If not in cache, fetch from source
        const response = await axios.get(url);
        const data = response.data;

        const cleanData = data.flatMap(item => 
            item.data ? item.data.map(entry => {
                const { url, ...rest } = entry;
                return rest;
            }) : []
        );

        // Store in cache
        cache.set(type, cleanData);

        res.json(cleanData);
    } catch (error) {
        res.status(500).json({ 
            error: error.response?.data?.message || error.message 
        });
    }
});

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Invalid endpoint' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;