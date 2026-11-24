/**
 * Integration test for Hybrid AI Architecture:
 * - Resume Detection & ATS Analysis: 100% In-House PyTorch Model (ResumeDomainClassifierNet-v1)
 * - Text Generation & Document Intelligence: Google Gemini API (with Local Fallback)
 */

import dotenv from 'dotenv';
dotenv.config();

import geminiService from './src/services/ai/gemini.service.js';
import localAIService from './src/services/ai/localAIService.js';
import documentAIService from './src/services/ai/documentAIService.js';
import aiRouter from './src/services/ai/aiRouter.service.js';

async function runHybridTest() {
  console.log('='.repeat(70));
  console.log('TESTING HYBRID AI ARCHITECTURE (GEMINI API + IN-HOUSE PYTORCH)');
  console.log('='.repeat(70));

  // 1. Verify Architecture Configuration
  console.log('\n[1] Configuration Audit:');
  const isGeminiReady = geminiService.isConfigured();
  console.log('  Google Gemini API Status:  ', isGeminiReady ? 'Configured (Active)' : 'Standby / Fallback Mode (Set GEMINI_API_KEY to activate)');
  console.log('  Gemini Target Model:       ', geminiService.getModel());
  
  const health = await localAIService.checkHealth();
  console.log('  Local PyTorch Server (:8000):', health.online ? 'Online (Active)' : 'Offline');

  // 2. Test Resume Detection (MUST BE 100% IN-HOUSE MODEL)
  console.log('\n[2] Testing Resume Detection (In-House PyTorch Model - Strict Privacy):');
  const resumeSample = 'Full-Stack Software Engineer with React, Node.js, Express, TypeScript, Docker, and PostgreSQL. B.Tech in IT.';
  try {
    const resumeRes = await documentAIService.analyzeResume({
      text: resumeSample,
      fileName: 'Kunwar_Resume.pdf',
      targetRole: 'Full-Stack Developer',
    });
    console.log('  Resume Analysis Success:');
    console.log('    Detected Domain: ', resumeRes.detectedDomain);
    console.log('    Model Name:      ', resumeRes.model);
    console.log('    Provider:        ', resumeRes.provider);
    console.log('    ATS Score:       ', resumeRes.atsScore + '/100');
    console.log('    Data Privacy:    ', resumeRes.isLocal ? '100% On-Premise Local (Zero Cloud Leakage)' : 'External');
  } catch (err) {
    console.error('  Resume Test Error:', err.message);
  }

  // 3. Test Text Generation (Gemini with Local Fallback)
  console.log('\n[3] Testing Text Generation (Hybrid AI Router):');
  try {
    const textRes = await aiRouter.generateText({
      prompt: 'Explain what is Cloud Computing in two sentences.',
      temperature: 0.7,
      maxTokens: 100,
    });
    console.log('  Text Generation Success:');
    console.log('    Provider Active: ', textRes.provider);
    console.log('    Model Name:      ', textRes.model);
    console.log('    Output Sample:   ', textRes.text.substring(0, 150) + '...');
  } catch (err) {
    console.error('  Text Generation Error:', err.message);
  }

  // 4. Test Document Analysis (Gemini with Local Fallback)
  console.log('\n[4] Testing Document Intelligence (Hybrid AI Router):');
  const docSample = 'This technical whitepaper details the microservices architecture using Docker, Kubernetes, and PostgreSQL for high-scale enterprise applications.';
  try {
    const docRes = await documentAIService.analyzeDocument({
      text: docSample,
      fileName: 'SystemArchitecture.pdf',
      mode: 'summarize',
    });
    console.log('  Document Intelligence Success:');
    console.log('    Provider Active: ', docRes.provider);
    console.log('    Model Name:      ', docRes.model);
    console.log('    Category:        ', docRes.category);
    console.log('    Summary Sample:  ', docRes.summary.substring(0, 150) + '...');
  } catch (err) {
    console.error('  Document Analysis Error:', err.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('HYBRID AI ARCHITECTURE VERIFICATION COMPLETE');
  console.log('='.repeat(70));
}

runHybridTest().catch(console.error);
