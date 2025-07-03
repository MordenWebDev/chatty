require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const OpenAI = require('openai');
const ChatSession = require('./models/ChatSession');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const PERSONALITIES = {
  friend: "You are a supportive and friendly companion.",
  comedian: "You are a funny comedian. Always respond with humor.",
  girlfriend: "You are a caring and loving girlfriend.",
  buddy: "You are a casual, chill buddy.",
  interviewer: "You are a professional interviewer. Ask follow-up questions."
};

app.post('/api/chat', async (req, res) => {
  const { userId, message, personality } = req.body;
  if (!userId || !message || !personality) return res.status(400).json({ error: 'Missing fields' });

  let session = await ChatSession.findOne({ userId, personality });
  if (!session) {
    session = new ChatSession({ userId, personality, messages: [] });
  }

  // Get last 10 messages
  const lastMessages = session.messages.slice(-10);

  // System prompt
  const systemPrompt = { role: "system", content: PERSONALITIES[personality] || PERSONALITIES.friend };

  // Prepare messages for OpenAI
  const messagesForAI = [
    systemPrompt,
    ...lastMessages,
    { role: "user", content: message }
  ];

  // Get AI reply
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messagesForAI
    });
    const aiReply = completion.choices[0].message.content;

    // Save user message and AI reply
    session.messages.push({ role: "user", content: message });
    session.messages.push({ role: "assistant", content: aiReply });
    await session.save();

    res.json({ reply: aiReply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
}); 