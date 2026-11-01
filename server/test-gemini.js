import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function testActiveGemini() {
  const candidates = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite',
  ];

  for (const m of candidates) {
    try {
      console.log(`Testing Gemini model: ${m}...`);
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
        {
          contents: [{ role: 'user', parts: [{ text: 'Say hello in 5 words for Kunwar Kantikeya Gautam.' }] }],
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );
      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`✅ SUCCESS WITH ${m}:`, text);
      return m;
    } catch (err) {
      console.log(`❌ Error with ${m}:`, err.response?.data?.error?.message || err.message);
    }
  }
}

testActiveGemini();
