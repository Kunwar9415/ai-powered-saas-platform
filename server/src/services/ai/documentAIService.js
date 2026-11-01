import localAIService from './localAIService.js';
import mockAIService from './mockAI.service.js';
import { logger } from '../../utils/logger.js';

export class DocumentAIService {
  /**
   * Analyze uploaded document text locally via Ollama / gpt-oss:20b
   * 
   * @param {Object} options
   * @param {string} options.text - Extracted plain text of the document
   * @param {string} [options.fileName='Document'] - Name of original file
   * @param {string} [options.mode='summarize'] - Analysis mode ('summarize', 'keypoints', 'keywords', 'comprehensive')
   * @param {string} [options.provider='ollama'] - AI provider
   */
  async analyzeDocument({ text, fileName = 'Document', mode = 'summarize', provider = 'ollama' }) {
    const wordCount = (text || '').split(/\s+/).filter(Boolean).length;
    const truncatedText = (text || '').substring(0, 10000);

    const prompt = `You are an expert document analyst and intelligence engine. Analyze the following document text from file "${fileName}" in analysis mode: "${mode}".

Document Content (Word Count: ${wordCount}):
"""
${truncatedText}
"""

Instructions:
1. Provide a comprehensive executive summary.
2. Extract 4 to 6 concise key takeaways / bullet points.
3. Identify 5 to 8 important keywords/entities.
4. Provide 3 actionable insights or next steps.
5. Provide a sentiment/tone assessment.
6. Return STRICTLY valid JSON with no conversational preamble or markdown backticks if possible, conforming to this JSON schema:
{
  "summary": "Detailed executive summary...",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "keywords": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "actionableInsights": ["Action 1", "Action 2", "Action 3"],
  "sentiment": "Professional, informative, and analytical",
  "wordCount": ${wordCount}
}`;

    const systemPrompt = `You are a document intelligence system. Output only valid JSON without markdown wrapping.`;

    try {
      logger.info(`📄 DocumentAIService: Analyzing "${fileName}" via local AI engine`);
      const aiRes = await localAIService.generateText({
        prompt,
        systemPrompt,
        temperature: 0.3,
        maxTokens: 2500,
      });

      // Parse JSON from model output
      let parsed = null;
      try {
        const cleaned = aiRes.text
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        logger.warn('Could not parse strict JSON from local AI output, extracting via regex fallback...');
        const jsonMatch = aiRes.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (innerErr) {
            logger.warn('Regex JSON extraction failed, creating structured fallback wrapper.');
          }
        }
      }

      if (parsed && parsed.summary) {
        return {
          ...parsed,
          provider: aiRes.provider || 'ollama',
          model: aiRes.model || 'gpt-oss:20b',
          isLocal: true,
        };
      }

      // If response text was received but was not JSON, structure it
      return {
        summary: aiRes.text,
        keyPoints: [
          'Document analysis generated successfully via local AI model',
          `Analyzed ${wordCount} words from ${fileName}`,
        ],
        keywords: [fileName.replace(/\.[^/.]+$/, ''), 'document-analysis', 'local-ai'],
        actionableInsights: ['Review full executive summary above for detailed recommendations.'],
        sentiment: 'Analytical',
        wordCount,
        provider: aiRes.provider || 'ollama',
        model: aiRes.model || 'gpt-oss:20b',
        isLocal: true,
      };
    } catch (error) {
      logger.warn(`Local AI document analysis error (${error.message}). Checking offline fallback...`);
      if (error.isOllamaUnavailable) {
        throw error;
      }
      return await mockAIService.analyzeDocument({ text, fileName, mode });
    }
  }

  /**
   * Analyze candidate resume locally via Ollama / gpt-oss:20b
   * 
   * @param {Object} options
   * @param {string} options.text - Extracted resume plain text
   * @param {string} [options.fileName='Resume'] - Resume filename
   * @param {string} [options.targetRole] - Optional target job role
   */
  async analyzeResume({ text, fileName = 'Resume', targetRole = '', provider = 'ollama' }) {
    const truncatedText = (text || '').substring(0, 10000);

    const prompt = `You are a Senior Technical Recruiter and ATS Resume Optimization Specialist.
Analyze the following candidate resume text from "${fileName}".
${targetRole ? `Target Role to evaluate against: "${targetRole}"` : ''}

Resume Text:
"""
${truncatedText}
"""

Perform a thorough ATS evaluation and return STRICTLY valid JSON conforming to this schema:
{
  "candidateOverview": {
    "documentName": "${fileName}",
    "detectedRole": "${targetRole || 'Detected primary technical/professional title'}",
    "experienceLevel": "Entry / Mid-Level / Senior / Lead"
  },
  "skillsIdentified": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"],
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "missingOrRecommendedSkills": ["Recommended Skill 1", "Recommended Skill 2", "Recommended Skill 3"],
  "atsObservations": {
    "formattingQuality": "Clear section hierarchy and clean parseability",
    "keywordDensity": "Match score analysis for target technical competencies",
    "actionVerbsUsage": "Impact-driven bullet points evaluation",
    "disclaimer": "ATS observations are heuristic guidelines and do not guarantee recruiting outcomes."
  },
  "recommendations": [
    "Quantify key accomplishments with metrics and business impact",
    "Tailor top summary section to highlight relevant technical stacks",
    "Include certifications and open-source project links"
  ]
}`;

    const systemPrompt = `You are an ATS resume evaluator. Output strictly valid JSON conforming to the requested schema.`;

    try {
      logger.info(`📋 DocumentAIService: Analyzing resume "${fileName}" via local AI engine`);
      const aiRes = await localAIService.generateText({
        prompt,
        systemPrompt,
        temperature: 0.3,
        maxTokens: 2500,
      });

      let parsed = null;
      try {
        const cleaned = aiRes.text
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        const jsonMatch = aiRes.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (innerErr) {}
        }
      }

      if (parsed && (parsed.skillsIdentified || parsed.candidateOverview)) {
        return {
          ...parsed,
          provider: aiRes.provider || 'ollama',
          model: aiRes.model || 'gpt-oss:20b',
          isLocal: true,
        };
      }

      return await mockAIService.analyzeResume({ text, fileName });
    } catch (error) {
      logger.warn(`Local AI resume analysis error (${error.message}).`);
      if (error.isOllamaUnavailable) {
        throw error;
      }
      return await mockAIService.analyzeResume({ text, fileName });
    }
  }
}

export const documentAIService = new DocumentAIService();
export default documentAIService;
