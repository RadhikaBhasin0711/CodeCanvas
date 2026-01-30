const express = require("express");
const app = express();
const path = require("path");
const fetch = require('node-fetch');

require('dotenv').config(); 

const port = 8080;

// Static files
app.use(express.static(path.join(__dirname, "public/css")));
app.use(express.static(path.join(__dirname, "public/js")));
app.use(express.static(path.join(__dirname, "public/media")));
app.use(express.static("public"));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/learn", (req, res) => {
    res.render("mainlearn.ejs");
});

app.get("/learn/:type", (req, res) => {
    let { type } = req.params;
    const learnData = require("./data.json");
    const data = learnData[type];
    res.render("learn.ejs", { data });
});

app.get("/practice", (req, res) => {
    res.render("mainquiz.ejs");
});

// Dynamic practice page (one template for all topics)
app.get('/practice/:topic', (req, res) => {
    const topic = req.params.topic;
    res.render('practice', { 
        topic: topic.charAt(0).toUpperCase() + topic.slice(1) 
    });
});

// API route to generate questions 
app.get('/api/questions/:topic', async (req, res) => {
    const topic = req.params.topic;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in .env");
        return res.status(500).json({ error: 'API key not configured' });
    }

    console.log("Requested topic:", topic);
    console.log("API Key loaded:", apiKey ? "YES" : "NO");

    const prompt = `Generate 5 multiple choice questions on ${topic} in Data Structures and Algorithms. 
    Each question must have:
    - Clear question text
    - Exactly 4 options (A, B, C, D)
    - Only one correct answer
    Return ONLY clean JSON array, no extra text. Format:
    [
      {
        "question": "...",
        "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "correct": "A"
      },
      ...
    ]`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API failed:', response.status, errorText);
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json|```/g, '').trim();

        const questions = JSON.parse(text);
        console.log("Questions generated successfully:", questions.length);
        res.json(questions);
    } catch (error) {
        console.error('Server error in /api/questions:', error.message);
        res.status(500).json({ error: 'Failed to generate questions: ' + error.message });
    }
});

app.get('/api/generate-question', async (req, res) => {
    const { topic, level } = req.query;

    if (!topic || !level) {
        return res.status(400).json({ error: 'Topic and level are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY missing');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const prompt = `Generate ONE detailed coding problem (NOT multiple choice) on topic "${topic}" with difficulty "${level}" in Data Structures and Algorithms.
Return ONLY valid JSON object with exactly these keys. Do NOT add any extra text, markdown, comments, or explanations outside the JSON.
Escape all quotes and special characters properly inside string values.
{
  "problem_statement": "Full problem description...",
  "input_format": "Input format explanation...",
  "output_format": "Output format explanation...",
  "constraints": "Constraints list...",
  "sample_input": "Sample input...",
  "sample_output": "Sample output...",
  "explanation": "Brief explanation of approach (optional)"
}`;

    try {
        console.log(`Generating ${level} question for ${topic}`);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1,          // Very low = strict format following
                        topP: 0.95,
                        maxOutputTokens: 2048
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', response.status, errorText);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        let rawText = data.candidates[0].content.parts[0].text || '';

        rawText = rawText
            .replace(/```json|```/g, '')               
            .replace(/[-\u001F\u007F]/g, '')     
            .replace(/\\"/g, '"')                      
            .trim();

        // Extract only the JSON part (in case extra text)
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
            rawText = rawText.substring(jsonStart, jsonEnd);
        }

        console.log("Raw cleaned text (first 300 chars):", rawText.substring(0, 300) + (rawText.length > 300 ? '...' : ''));

        let questionData;
        try {
            questionData = JSON.parse(rawText);
        } catch (parseError) {
            console.error('JSON parse failed:', parseError.message);
            console.log('Full raw text for debug:', rawText);
            return res.status(500).json({ 
                error: 'Failed to parse generated question',
                rawText: rawText.substring(0, 500) + '...' // partial for debug
            });
        }

        console.log("Parsed successfully");
        res.json(questionData);
    } catch (error) {
        console.error('Generate question error:', error.message);
        res.status(500).json({ error: 'Failed to generate question: ' + error.message });
    }
});

app.get("/test", (req, res) => {
    res.render("randomques.ejs");
});

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});