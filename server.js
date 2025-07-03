require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

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

  const systemPrompt = PERSONALITIES[personality] || PERSONALITIES.friend;

  const messagesForAI = [
    { role: "system", content: systemPrompt },
    { role: "user", content: message }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messagesForAI
    });
    const aiReply = completion.choices[0].message.content;
    res.json({ reply: aiReply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
}); 
