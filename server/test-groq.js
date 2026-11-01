import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function testRichCompletion() {
  const apiKey = process.env.GROQ_API_KEY;
  for (const model of ['openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-120b']) {
    try {
      console.log(`\n--- Testing ${model} ---`);
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: 'Explain what a Smart Grid is in 2 sentences.' }],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          }
        }
      );
      console.log(`Response from ${model}:`, res.data?.choices?.[0]?.message?.content);
    } catch (err) {
      console.error(`Error on ${model}:`, err.response?.data?.error?.message || err.message);
    }
  }
}

testRichCompletion();
