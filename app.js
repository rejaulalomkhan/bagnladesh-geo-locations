const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

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
        const response = await fetch(url);
        const data = await response.json();

        const cleanData = data.flatMap(item => 
            item.data ? item.data.map(entry => {
                const { url, ...rest } = entry;
                return rest;
            }) : []
        );

        res.json(cleanData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: 'Invalid endpoint' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
