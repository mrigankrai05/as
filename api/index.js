// api/index.js

const express = require('express');
const axios = require('axios');

// Load environment variables. Vercel handles this automatically in production.
// For local development, you might use dotenv.
// require('dotenv').config({ path: '../.env' });

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;

// Itinerary endpoint
app.post('/api/itinerary', async (req, res) => {
    if (!API_KEY) {
        return res.status(500).json({ error: "Server configuration error: API key not found." });
    }
    
    const { location, days } = req.body;
    const prompt = `Create a detailed travel itinerary for a ${days}-day trip to ${location}. Respond with ONLY a JSON object. The root object should have a key "introduction" (string), and "itinerary" (an array of day objects). Each day object needs "day" (string, e.g., "Day 1"), "title" (string), and "activities" (an array of activity objects). Each activity object needs "time" (string, e.g., "Morning (9:00 AM - 1:00 PM)") and "description" (string).`;
    
    try {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        const response = await axios.post(apiUrl, payload);
        res.json(response.data);
    } catch (error) {
        console.error("Itinerary Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to generate itinerary." });
    }
});

// Weather endpoint
app.post('/api/weather', async (req, res) => {
    if (!API_KEY) {
        return res.status(500).json({ error: "Server configuration error: API key not found." });
    }

    const { location } = req.body;
    const prompt = `Get the current weather for ${location}. Respond with ONLY a JSON object with keys: "temp_celsius", "description", and "location_name".`;

    try {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        const response = await axios.post(apiUrl, payload);
        res.json(response.data);
    } catch (error) {
        console.error("Weather Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to generate weather." });
    }
});

// Export the app for Vercel
module.exports = app;
