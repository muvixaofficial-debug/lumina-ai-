import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
const app = express();

/* Lumina AI request timing diagnostics */
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    console.log(
      '[REQUEST_TIMING]',
      JSON.stringify({
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Date.now() - startedAt
      })
    );
  });
  next();
});

const port = Number(process.env.PORT || 3000);

let quotaCooldownUntil = 0;

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '8mb' }));
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

    const mode = ['chat', 'coding', 'study'].includes(req.body?.mode)
      ? req.body.mode
      : 'chat';

    if (mode === 'chat') {
      const normalized = message.toLowerCase().replace(/[?!.,।]+$/g, '').trim();
      const quickAnswers = new Map([
        ['tumhara naam kya hai', 'Mera naam Lumina AI hai. Main aapka AI assistant hoon.'],
        ['tumhara naam', 'Mera naam Lumina AI hai.'],
        ['what is your name', 'My name is Lumina AI. I am your AI assistant.'],
        ['what is your name?', 'My name is Lumina AI. I am your AI assistant.'],
        ['hello', 'Hello! Main Lumina AI hoon. Aapki kya madad karun?'],
        ['hi', 'Hi! Main Lumina AI hoon. Aapki kya madad karun?'],
        ['namaste', 'Namaste! Main Lumina AI hoon. Bataiye, main kya madad karun?']
      ]);
      if (quickAnswers.has(normalized)) {
        return res.json({ answer: quickAnswers.get(normalized) });
      }
    }

    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return res.status(503).json({
        error: 'Server par Gemini API Key set nahi hai.'
      });
    }

    const modeInstructions = {
      chat: 'You are Lumina AI, a helpful and honest assistant. Reply in the language used by the user.',
      coding: 'You are Lumina Coding AI. Help write, explain, debug, and improve code. Give runnable examples when useful, explain errors clearly, and never claim code was tested unless it was actually run. Reply in the user’s language.',
      study: 'You are Lumina Study AI, a friendly and patient tutor who teaches like a knowledgeable friend. Reply in the language the student uses, using simple words first and correct textbook terminology where needed. For every subject, including Physics, Chemistry, Biology, Mathematics, Hindi, English, history and other school subjects, explain concepts step by step. Start with a clear definition when appropriate, explain why and how it works, and give a simple example. For numerical problems, show the given values, formula, substitutions, calculations and final answer with units. For derivations, show each meaningful step and explain the reason. Render mathematical expressions in LaTeX using $...$ for inline maths and $$...$$ for displayed equations. Define symbols and difficult words. Include exam-important points or a short practice question when useful. Match the student’s class and level if provided; ask if the level matters and is unclear. Do not invent facts, formulas, citations or syllabus requirements. If uncertain, say so honestly. Do not skip important steps just to make the answer short.'
    };

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

    const ai = new GoogleGenAI({ apiKey: key, httpOptions: { timeout: 25000 } });

    let result;
    let lastError;
    for (let attempt = 1; attempt <= 1; attempt++) {
      try {
        result = await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents,
          config: {
            systemInstruction: modeInstructions[mode]
          }
        });
        break;
      } catch (error) {
        lastError = error;
        const status = Number(error?.status || error?.code || 0);
        const text = String(error?.message || '').toUpperCase();
        const retryable =
          [500, 502, 503, 504].includes(status) ||
          text.includes('UNAVAILABLE') ||
          text.includes('INTERNAL') ||
          text.includes('HIGH DEMAND');
        if (!retryable || attempt === 2) throw error;
        const delay = attempt * 500;
        console.warn(`Gemini temporary error; retry ${attempt + 1}/2 after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    if (!result && lastError) throw lastError;

    const answer = result.text?.trim();

    if (!answer) {
      return res.status(502).json({
        error: 'AI se khaali jawab mila. Dobara koshish karen.'
      });
    }

    return res.json({ answer });
  } catch (error) {
    const status = Number(error?.status || error?.code || 0);
    const message = String(error?.message || 'Unknown error');
    const retryInfo = error?.errorDetails || error?.details || error?.response?.headers?.get?.('retry-after') || '';
    console.error('Gemini request failed:', status, message);
    if (status === 429 || /RESOURCE_EXHAUSTED|QUOTA|RATE LIMIT/i.test(message)) {
      console.error('Gemini quota retry info:', JSON.stringify(retryInfo).slice(0, 1000));
    }

    if (status === 429 || /RESOURCE_EXHAUSTED|QUOTA|RATE LIMIT/i.test(message)) {
      quotaCooldownUntil = Date.now() + 60_000;
      return res.status(429).json({
        error: 'AI ki request limit ya quota poora ho gaya hai. Kuch der baad dobara koshish karen.'
      });
    }

    if (status === 401 || status === 403 || /API KEY|PERMISSION_DENIED|UNAUTHENTICATED/i.test(message)) {
      return res.status(502).json({
        error: 'AI service ki authentication ya permission setting mein dikkat hai.'
      });
    }

    if ([500, 502, 503, 504].includes(status) || /UNAVAILABLE|HIGH DEMAND|INTERNAL/i.test(message)) {
      return res.status(503).json({
        error: 'AI service abhi busy hai. Kuch der baad dobara koshish karen.'
      });
    }

    return res.status(502).json({
      error: 'AI service se jawab nahi mila. Server logs mein asli error check karen.'
    });
  }
});


app.post('/api/image', async (req, res) => {
  try {
    const prompt = typeof req.body?.prompt === 'string'
      ? req.body.prompt.trim()
      : '';

    if (!prompt) {
      return res.status(400).json({ error: 'Tasveer ka prompt likhen.' });
    }

    if (prompt.length > 2000) {
      return res.status(413).json({ error: 'Prompt 2000 characters se chhota rakhen.' });
    }

    const uploadedImage = typeof req.body?.image === 'string' ? req.body.image : '';
    if (uploadedImage && !/^data:image\/(png|jpeg|webp);base64,/i.test(uploadedImage)) {
      return res.status(400).json({ error: 'PNG, JPG या WebP फोटो चुनें।' });
    }
    if (uploadedImage.length > 7 * 1024 * 1024) {
      return res.status(413).json({ error: 'फोटो छोटी चुनें। अधिकतम 5 MB की फोटो इस्तेमाल करें।' });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !token) {
      return res.status(503).json({ error: 'Cloudflare AI credentials server par set nahi hain.' });
    }

    const model = uploadedImage
      ? '@cf/black-forest-labs/flux-2-klein-4b'
      : (process.env.CLOUDFLARE_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell');

    let requestOptions;
    if (uploadedImage) {
      const match = uploadedImage.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/i);
      if (!match) {
        return res.status(400).json({ error: 'Photo format valid nahi hai. PNG, JPEG ya WebP upload karein.' });
      }
      const mime = match[1].toLowerCase() === 'jpg' ? 'image/jpeg' : `image/${match[1].toLowerCase()}`;
      const form = new FormData();
      form.append('prompt',
        `Carefully edit the supplied reference photo according to the user's request: ${prompt}

Preserve the original person's identity, face, hairstyle, body proportions, pose, clothing, and all important objects unless the user explicitly asks to change them. Pay special attention to hands and arms: keep the exact number of arms, hands, and fingers; preserve the original hand placement and contact points, including a hand resting on or near the neck; do not move hands to a table or another location; do not crop, erase, hide, or replace any part of a hand or arm. Keep the original composition and framing. Apply only requested changes. Do not add cinematic styling unless requested. Maintain realistic anatomy, natural lighting, and consistent shadows.`
      );
      form.append('input_image_0', new Blob([Buffer.from(match[2], 'base64')], { type: mime }), 'reference-image');
      requestOptions = {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      };
    } else {
      requestOptions = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      };
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
      requestOptions
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('Cloudflare image generation failed:', response.status, JSON.stringify(result.errors || []));
      return res.status(502).json({ error: 'Cloudflare se tasveer nahi ban saki. Credentials, model access ya usage limit check karen.' });
    }

    const imageData = result.result?.image || result.result?.data;
    if (!imageData) {
      return res.status(502).json({ error: 'Cloudflare ne image data nahi bheja.' });
    }

    const base64 = typeof imageData === 'string'
      ? imageData
      : Buffer.from(imageData).toString('base64');

    return res.json({ image: `data:image/png;base64,${base64}` });
  } catch (error) {
    console.error('Cloudflare image generation error:', String(error?.message || error));
    return res.status(502).json({ error: 'Image generation mein dikkat aayi. Thodi der baad dobara koshish karen.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Lumina AI server listening on ${port}`);
});
