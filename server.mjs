import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { OpenRouter } from "@openrouter/sdk";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Set the port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;


// Initialize OpenRouter client with API key from environment variable
const client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });


// Read the system prompt from the prompts/SYSTEM.md file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const systemPrompt = fs.readFileSync(
    path.join(__dirname, "prompts", "SYSTEM.md"), 
    "utf-8"
);
const SYSTEM = {
    role: "system",
    content: systemPrompt
};

// Function to create a user message with the resume and job description
const USER = (resume, jobDescription) => ({
    role: "user",
    content: `
## Job Description
${jobDescription}

## Resume
${resume}

## Output
Return ONLY valid JSON following SYSTEM instructions.
`
});


// Function to create a chat request with the system prompt and user messages
const chatRequest = (messages) => ({
    model: "openrouter/free",
    messages: [SYSTEM, ...messages]
});

// Endpoint to test connection to OpenRouter
app.get("/", async (req, res) => {
    try {
        const response = await client.chat.send({
            chatRequest: chatRequest([{
                    role: "user",
                    content: "Only say: Connected!"
            }]),
        });
        res.send(response.choices[0].message.content);
    } catch (error) {
        res.status(500).json({ 
            error: "Failed to connect to OpenRouter", 
            details: error });
    }
});

// Endpoint to analyze resume and job description
app.post("/analyze", async (req, res) => {
    try {
        // Extract resume and job description from request body
        const { resume, jobDescription } = req.body;

        // Validate input
        if (!resume || !jobDescription) {
            return res.status(400).json({ error: "Resume and job description are required" });
        }

        // Send chat request to OpenRouter with the resume and job description
        const response = await client.chat.send({chatRequest: chatRequest([USER(resume, jobDescription)])});
        
        // Extract the raw content from the response and attempt to parse it as JSON
        const raw = response.choices[0].message.content;
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (err) {
            return res.status(500).json({
                error: "Model did not return valid JSON",
                raw_output: raw
            });
        }

        // Return the parsed analysis as JSON response
        res.json({ analysis: parsed });

    } catch (error) {
        res.status(500).json({ 
            error: "Failed to connect to OpenRouter", 
            details: error });
    }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
