// server.js

const express = require('express');
const axios = require('axios'); // To make requests from the server
require('dotenv').config(); // Loads the .env file

const app = express();
const port = 3000;

// Middleware to parse JSON bodies from frontend requests
app.use(express.json());
// Serve static files (like your index.html) from the main directory
app.use(express.static('.'));

// Load your secret API key from the .env file
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in your .env file.");
    process.exit(1);
}

// Secure endpoint for generating the itinerary
app.post('/api/itinerary', async (req, res) => {
    const { location, days } = req.body;

    if (!location || !days) {
        return res.status(400).json({ error: 'Location and days are required.' });
    }

    const prompt = `Create a detailed travel itinerary for a ${days}-day trip to ${location}. Respond with ONLY a JSON object. The root object should have a key "introduction" (string), and "itinerary" (an array of day objects). Each day object needs "day" (string, e.g., "Day 1"), "title" (string), and "activities" (an array of activity objects). Each activity object needs "time" (string, e.g., "Morning (9:00 AM - 1:00 PM)") and "description" (string).`;

    try {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        
        const response = await axios.post(apiUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(response.data);

    } catch (error) {
        console.error("Error calling Google AI API:", error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to generate itinerary." });
    }
});

// Secure endpoint for generating the weather
app.post('/api/weather', async (req, res) => {
    const { location } = req.body;

    if (!location) {
        return res.status(400).json({ error: 'Location is required.' });
    }

    const prompt = `Get the current weather for ${location}. Respond with ONLY a JSON object with keys: "temp_celsius", "description", and "location_name".`;

    try {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        
        const response = await axios.post(apiUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(response.data);

    } catch (error) {
        console.error("Error calling Google AI API for weather:", error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to generate weather." });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
