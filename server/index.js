import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
const app = express();
const port = Number(process.env.PORT || 3000);

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '32kb' }));
app.use('/api/', rateLimit({
  windowMs: 60000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get('/', (_req, res) => {
  res.json({ app: 'Lumina AI Server', status: 'running' });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    keyConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return res.status(503).json({
        error: 'Server par Gemini API Key set nahi hai.'
      });
    }

    const message = typeof req.body?.message === 'string'
      ? req.body.message.trim()
      : '';

    if (!message) {
      return res.status(400).json({ error: 'Apna sawal likhen.' });
    }

    if (message.length > 8000) {
      return res.status(413).json({
        error: 'Sawal 8000 characters se chhota rakhen.'
      });
    }

    const history = Array.isArray(req.body?.history)
      ? req.body.history.slice(-12)
      : [];

    const contents = [];

    for (const item of history) {
      if (
        item &&
        ['user', 'model'].includes(item.role) &&
        typeof item.text === 'string'
      ) {
        contents.push({
          role: item.role,
          parts: [{ text: item.text.slice(0, 4000) }]
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const ai = new GoogleGenAI({ apiKey: key });

    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction:
          'You are Lumina AI, a helpful and honest assistant. Reply in the language used by the user.'
      }
    });

    const answer = result.text?.trim();

    if (!answer) {
      return res.status(502).json({
        error: 'AI se khaali jawab mila. Dobara koshish karen.'
      });
    }

    return res.json({ answer });
  } catch (error) {
    console.error(
      'Gemini request failed:',
      error?.status || '',
      error?.message || 'Unknown error'
    );

    return res.status(502).json({
      error: 'AI jawab nahi de paya. Server settings check karen.'
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Lumina AI server listening on ${port}`);
});
