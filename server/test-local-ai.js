import localAIService from './src/services/ai/localAIService.js';
import documentAIService from './src/services/ai/documentAIService.js';
import imageAIService from './src/services/ai/imageAIService.js';

async function testLocalAIArchitecture() {
  console.log('================================================================');
  console.log('🧪 TESTING THREE-TIER LOCAL AI ARCHITECTURE (OLLAMA + NODE.JS)');
  console.log('================================================================\n');

  console.log('1. Checking Local Ollama Server Status...');
  const health = await localAIService.checkHealth();
  console.log('📡 Health Result:', health);

  if (!health.online) {
    console.log('\n⚠️  Ollama server is not currently running on http://localhost:11434.');
    console.log('   (To start Ollama, run `ollama serve` and `ollama pull gpt-oss:20b` in your terminal.)');
    console.log('   Testing error handling behavior...');

    try {
      await localAIService.generateText({ prompt: 'Hello local AI' });
      console.log('❌ Unexpected success when Ollama is offline');
    } catch (err) {
      console.log('✅ Error handling verified:', err.message);
      if (err.statusCode === 503 || err.isOllamaUnavailable) {
        console.log('✅ Correct 503 Status Code & Clean Error Message returned.');
      }
    }
  } else {
    console.log('✅ Ollama is running online!');
    console.log('   Testing inference with model:', health.configuredModel);
    try {
      const res = await localAIService.generateText({
        prompt: 'Explain what an API is in 10 words.',
      });
      console.log('✅ Inference Success:', res);
    } catch (err) {
      console.log('ℹ️ Local generation error:', err.message);
    }
  }

  console.log('\n2. Testing Modular Image Synthesis Pipeline...');
  try {
    const imgRes = await imageAIService.generateImage({
      prompt: 'A futuristic cybernetic laboratory with neural networks',
      style: 'Photorealistic',
    });
    console.log('✅ Image Pipeline Result:', {
      provider: imgRes.provider,
      model: imgRes.model,
      imageUrl: imgRes.imageUrl ? 'Image URL generated' : 'None',
      note: imgRes.architectureNote,
    });
  } catch (imgErr) {
    console.error('❌ Image error:', imgErr.message);
  }

  console.log('\n================================================================');
  console.log('✅ LOCAL AI ARCHITECTURE VALIDATION COMPLETE');
  console.log('================================================================\n');
}

testLocalAIArchitecture();
