const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// IMPORT: Ensure this points to your updated service file
const { runChat } = require('./services/gemini-services'); 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// --- VIVA READY LOGS ---
console.log("------------------------------------");
console.log("🚀 AgriTrust Backend Initializing...");
console.log("API Status:", process.env.GROQ_API_KEY ? "✅ Groq Key Active" : "❌ Key Missing");
// We'll add a check to see if our JSON exists
const fs = require('fs');
const kbPath = './knowledge_base.json';
console.log("Knowledge Base:", fs.existsSync(kbPath) ? "✅ knowledge_base.json Loaded" : "⚠️ KB File Missing");
console.log("------------------------------------");

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "No message provided" });

        const aiReply = await runChat(message);
        res.json({ text: aiReply }); 
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ AgriTrust Chatbot Server running on http://localhost:${PORT}`);
});