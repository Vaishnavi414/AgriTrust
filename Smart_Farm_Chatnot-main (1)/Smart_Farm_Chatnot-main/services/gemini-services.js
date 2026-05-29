const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load the knowledge base from the JSON file
const knowledgeBasePath = path.join(__dirname, '../knowledge_base.json');
const knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf8'));

// Format the JSON data into a string the AI can understand
const formattedKnowledge = knowledgeBase.map(item => 
    `Questions: ${item.questions.join(', ')} | Answer: ${item.answer}`
).join('\n');

async function runChat(userPrompt) {
    const apiKey = process.env.GROQ_API_KEY;
    const url = "https://api.groq.com/openai/v1/chat/completions";
    
    if (!apiKey) {
        return "Error: GROQ_API_KEY not configured. Please add your Groq API key to the .env file.";
    }

    try {
        const response = await axios.post(url, {
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are the AgriTrust AI Assistant. 

                        STRICT RESPONSE RULES:
                        1. START with a direct, 1-sentence answer.
                        2. USE BULLETS for details (maximum 3 points).
                        3. NO PARAGRAPHS: Keep every point under 15 words.
                        4. BOLD key terms to make them scannable.
                        5. NO INTRODUCTIONS: Don't say "Certainly!" or "In summary." Just answer.

                        KNOWLEDGE BASE:
                    ${formattedKnowledge}`
                },
                { role: "user", content: userPrompt }
            ]
        }, {
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        return "AI Error: " + (error.response ? error.response.data.error.message : error.message);
    }
}

module.exports = { runChat };