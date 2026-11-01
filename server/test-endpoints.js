process.env.NODE_ENV = 'test';
import app from './src/server.js';
import axios from 'axios';

const PORT = 5099;
let server;
let authToken = '';

async function runTests() {
  console.log('🧪 Starting Automated API Test Suite for Local AI SaaS Platform...\n');

  // Start test server on port 5099
  server = app.listen(PORT, async () => {
    const baseURL = `http://localhost:${PORT}/api`;
    let passed = 0;
    let failed = 0;

    const test = async (name, fn) => {
      try {
        process.stdout.write(`  ▶ Testing: ${name}... `);
        await fn();
        console.log('✅ PASS');
        passed++;
      } catch (err) {
        console.log('❌ FAIL');
        console.error('    Error Details:', err.response?.data || err.message);
        failed++;
      }
    };

    try {
      // 1. Health check
      await test('Health Check Endpoint (GET /api/health)', async () => {
        const res = await axios.get(`${baseURL}/health`);
        if (res.status !== 200 || res.data.status !== 'healthy') throw new Error('Health check failed');
      });

      // 2. Auth Registration
      const testEmail = `tester_${Date.now()}@university.edu`;
      await test('User Registration (POST /api/auth/register)', async () => {
        const res = await axios.post(`${baseURL}/auth/register`, {
          name: 'Academic Test User',
          email: testEmail,
          password: 'Password@123',
        });
        if (!res.data.success || !res.data.data.token) throw new Error('Registration failed');
        authToken = res.data.data.token;
      });

      // 3. Auth Login
      await test('User Login (POST /api/auth/login)', async () => {
        const res = await axios.post(`${baseURL}/auth/login`, {
          email: testEmail,
          password: 'Password@123',
        });
        if (!res.data.success || !res.data.data.token) throw new Error('Login failed');
      });

      const authHeaders = { headers: { Authorization: `Bearer ${authToken}` } };

      // 4. Auth Me
      await test('Get Authenticated User Profile (GET /api/auth/me)', async () => {
        const res = await axios.get(`${baseURL}/auth/me`, authHeaders);
        if (!res.data.success || !res.data.data.user) throw new Error('Failed to fetch user profile');
      });

      // 5. Providers listing
      await test('List Local AI Providers (GET /api/ai/providers)', async () => {
        const res = await axios.get(`${baseURL}/ai/providers`, authHeaders);
        if (!res.data.success || !Array.isArray(res.data.data.providers)) throw new Error('Providers failed');
      });

      // 6. AI Status endpoint
      await test('Local AI Server Status Check (GET /api/ai/status)', async () => {
        const res = await axios.get(`${baseURL}/ai/status`, authHeaders);
        if (res.status !== 200) throw new Error('Status check failed');
      });

      // 7. Primary Standard AI Generation (POST /api/ai/generate)
      await test('Primary Local AI Generation (POST /api/ai/generate)', async () => {
        try {
          const res = await axios.post(
            `${baseURL}/ai/generate`,
            { prompt: 'Write an introduction about Generative AI' },
            authHeaders
          );
          if (!res.data.success || !res.data.data.result) throw new Error('Generation failed');
        } catch (err) {
          // If Ollama is offline in CI environment, 503 is the expected clean error response
          if (err.response?.status === 503 && err.response?.data?.message?.includes('Ollama')) {
            console.log('(Server offline 503 handled gracefully)');
            return;
          }
          throw err;
        }
      });

      // 8. Text Generation Endpoint
      await test('AI Text Generation Endpoint (POST /api/ai/generate-text)', async () => {
        try {
          const res = await axios.post(
            `${baseURL}/ai/generate-text`,
            { prompt: 'Explain three benefits of local AI inference.', provider: 'ollama' },
            authHeaders
          );
          if (!res.data.success || !res.data.data.result) throw new Error('Text generation failed');
        } catch (err) {
          if (err.response?.status === 503 && err.response?.data?.message?.includes('Ollama')) {
            console.log('(Server offline 503 handled gracefully)');
            return;
          }
          throw err;
        }
      });

      // 9. Image Generation Endpoint
      await test('Modular AI Image Synthesis (POST /api/ai/generate-image)', async () => {
        const res = await axios.post(
          `${baseURL}/ai/generate-image`,
          { prompt: 'A futuristic cybernetic laboratory', style: 'Photorealistic' },
          authHeaders
        );
        if (!res.data.success || !res.data.data.imageUrl) throw new Error('Image generation failed');
      });

      // 10. Article Generator
      await test('AI Article Generator (POST /api/ai/generate-article)', async () => {
        try {
          const res = await axios.post(
            `${baseURL}/ai/generate-article`,
            { topic: 'Local Generative AI Inference Layer', tone: 'Professional', length: 'Short (~500 words)' },
            authHeaders
          );
          if (!res.data.success || !res.data.data.article) throw new Error('Article generation failed');
        } catch (err) {
          if (err.response?.status === 503 && err.response?.data?.message?.includes('Ollama')) {
            console.log('(Server offline 503 handled gracefully)');
            return;
          }
          throw err;
        }
      });

      // 11. Title Generator
      await test('AI Title Generator (POST /api/ai/generate-titles)', async () => {
        try {
          const res = await axios.post(
            `${baseURL}/ai/generate-titles`,
            { topic: 'Local AI Architecture', contentType: 'Blog Post' },
            authHeaders
          );
          if (!res.data.success || !res.data.data.titles) throw new Error('Title generation failed');
        } catch (err) {
          if (err.response?.status === 503 && err.response?.data?.message?.includes('Ollama')) {
            console.log('(Server offline 503 handled gracefully)');
            return;
          }
          throw err;
        }
      });

      // 12. Dashboard Stats
      await test('Dashboard Metrics Calculation (GET /api/dashboard/stats)', async () => {
        const res = await axios.get(`${baseURL}/dashboard/stats`, authHeaders);
        if (!res.data.success || !res.data.data.metrics) throw new Error('Dashboard stats failed');
      });

      // 13. History Retrieval
      await test('History Retrieval (GET /api/history)', async () => {
        const res = await axios.get(`${baseURL}/history`, authHeaders);
        if (!res.data.success) throw new Error('History retrieval failed');
      });

      console.log(`\n========================================`);
      console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
      console.log(`========================================\n`);
    } catch (e) {
      console.error('Fatal test error:', e);
    } finally {
      server.close();
      process.exit(failed > 0 ? 1 : 0);
    }
  });
}

runTests();
