import groqService from './src/services/ai/groq.service.js';
import geminiService from './src/services/ai/gemini.service.js';

async function testBothProviders() {
  console.log('--- 1. Testing Live Groq Cloud Service ---');
  try {
    const groqRes = await groqService.generateText({
      prompt: 'Hello from Kunwar Kantikeya Gautam. Reply in 5 words.',
    });
    console.log('✅ GROQ SUCCESS:', {
      model: groqRes.model,
      output: groqRes.text.trim(),
      tokens: groqRes.usage.totalTokens,
    });
  } catch (err) {
    console.error('❌ GROQ ERROR:', err.message);
  }

  console.log('\n--- 2. Testing Live Google Gemini Service ---');
  try {
    const geminiRes = await geminiService.generateText({
      prompt: 'Hello from Kunwar Kantikeya Gautam. Reply in 5 words.',
    });
    console.log('✅ GEMINI SUCCESS:', {
      model: geminiRes.model,
      output: geminiRes.text.trim(),
      tokens: geminiRes.usage.totalTokens,
    });
  } catch (err) {
    console.error('❌ GEMINI ERROR:', err.message);
  }
}

testBothProviders();
