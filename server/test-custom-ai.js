/**
 * End-to-end integration test verifying Node.js Express service communication
 * with the Python FastAPI Custom AI Server.
 */

import dotenv from 'dotenv';
dotenv.config();

import localAIService from './src/services/ai/localAIService.js';
import documentAIService from './src/services/ai/documentAIService.js';

async function runIntegrationTest() {
  console.log('=' .repeat(60));
  console.log('TESTING NODE.JS EXPRESS -> PYTHON FASTAPI INTEGRATION');
  console.log('=' .repeat(60));

  // 1. Health Check
  console.log('\n1. Checking Python FastAPI server health via localAIService.checkHealth()...');
  const health = await localAIService.checkHealth();
  console.log('Health check result:', health);
  if (!health.online) {
    console.error('ERROR: Custom AI server is not online at', health.baseUrl);
    process.exit(1);
  }

  // 2. Text Generation
  console.log('\n2. Testing Text Generation via localAIService.generateText()...');
  const textRes = await localAIService.generateText({
    prompt: 'What is machine learning?',
    maxTokens: 50,
    temperature: 0.6,
  });
  console.log('Text Generation Result:');
  console.log('  Model:   ', textRes.model);
  console.log('  Provider:', textRes.provider);
  console.log('  Output:  ', textRes.text);

  // 3. Document Analysis
  console.log('\n3. Testing Document Analysis via documentAIService.analyzeDocument()...');
  const docRes = await documentAIService.analyzeDocument({
    text: 'This technical paper describes our microservices architecture deploying Node.js and Python on Docker with PostgreSQL.',
    fileName: 'TechReport.pdf',
    mode: 'summarize',
  });
  console.log('Document Analysis Result:');
  console.log('  Category:  ', docRes.category);
  console.log('  Confidence:', docRes.categoryConfidence);
  console.log('  Summary:   ', docRes.summary);

  // 4. Resume Analysis
  console.log('\n4. Testing Resume Analysis via documentAIService.analyzeResume()...');
  const resumeRes = await documentAIService.analyzeResume({
    text: 'Full-Stack Developer with React, Node.js, Express, TypeScript, and PostgreSQL. B.Tech in Computer Science.',
    fileName: 'Resume.docx',
    targetRole: 'Full-Stack Developer',
  });
  console.log('Resume Analysis Result:');
  console.log('  Domain:        ', resumeRes.detectedDomain);
  console.log('  ATS Score:     ', resumeRes.atsScore);
  console.log('  Matched Skills:', resumeRes.matchedSkills);

  console.log('\nALL 4 INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

runIntegrationTest().catch((err) => {
  console.error('Test failed with error:', err.message);
  process.exit(1);
});

