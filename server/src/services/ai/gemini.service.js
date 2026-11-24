import axios from 'axios';
import { logger } from '../../utils/logger.js';

export class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.defaultModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.endpoint = 'https://generativelanguage.googleapis.com/v1beta';
  }

  isConfigured() {
    const key = (process.env.GEMINI_API_KEY || this.apiKey || '').trim();
    return Boolean(key && key !== '' && key !== 'your_gemini_api_key_here');
  }

  getApiKey() {
    return (process.env.GEMINI_API_KEY || this.apiKey || '').trim();
  }

  getModel() {
    return process.env.GEMINI_MODEL || this.defaultModel;
  }

  /**
   * Primary Text Generation via Gemini API
   */
  async generateText({ prompt, systemPrompt = '', temperature = 0.7, maxTokens = 1500, model }) {
    if (!this.isConfigured()) {
      throw new Error('Google Gemini API key is not configured in server environment variables.');
    }

    const modelName = model || this.getModel();
    const apiKey = this.getApiKey();
    const url = `${this.endpoint}/models/${modelName}:generateContent?key=${apiKey}`;

    const contents = [];
    if (systemPrompt && systemPrompt.trim()) {
      contents.push({
        role: 'user',
        parts: [{ text: `[System Instruction]: ${systemPrompt.trim()}\n\n[User Request]: ${prompt}` }],
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });
    }

    try {
      logger.info(`Sending request to Google Gemini API (model: ${modelName})...`);
      const response = await axios.post(
        url,
        {
          contents,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 45000,
        }
      );

      const candidate = response.data?.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text || '';
      const usage = response.data?.usageMetadata || {};

      return {
        text,
        provider: 'gemini',
        model: modelName,
        usage: {
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0,
        },
        isLocal: false,
      };
    } catch (error) {
      const errMsg = error.response?.data?.error?.message || error.message;
      logger.error('Gemini text generation error:', errMsg);
      throw new Error(`Google Gemini Provider Error: ${errMsg}`);
    }
  }

  /**
   * Long-form Article Generation via Gemini API
   */
  async generateArticle({ topic, tone = 'Professional', length = 'Medium', keywords = [] }) {
    const kwStr = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    const prompt = `Write a comprehensive, publication-quality article on the topic: "${topic}".
Tone: ${tone}.
Target Length: ${length}.
Key topics/keywords to incorporate: ${kwStr || 'General industry best practices'}.

Format the response cleanly in GitHub-flavored Markdown with:
- Catchy main title (# Title)
- Engaging introduction
- 3 to 4 detailed sections with clear subheadings (## Section)
- Bullet points where helpful
- Insightful conclusion and future outlook`;

    const res = await this.generateText({
      prompt,
      systemPrompt: 'You are an expert technical and business writer producing publication-ready articles.',
      temperature: 0.7,
      maxTokens: 2500,
    });

    return {
      text: res.text,
      provider: 'gemini',
      model: res.model,
      metadata: { topic, tone, length, keywords },
      isLocal: false,
    };
  }

  /**
   * Catchy Headline / Title Generation via Gemini API
   */
  async generateTitles({ topic, description = '', contentType = 'Blog Post' }) {
    const prompt = `Generate 5 high-converting, engaging, and professional headlines/titles for:
Topic: "${topic}"
Content Type: ${contentType}
Context/Description: ${description || 'Not provided'}

Respond with EXACTLY 5 numbered titles, one per line (e.g. "1. Title here"). Do not include introductory or concluding banter.`;

    const res = await this.generateText({
      prompt,
      systemPrompt: 'You are a professional copywriter and headline specialist.',
      temperature: 0.8,
      maxTokens: 300,
    });

    const lines = res.text
      .split('\n')
      .map((l) => l.replace(/^\d+[\.\)\-]\s*/, '').trim())
      .filter((l) => l.length > 5);

    const titles = lines.length >= 5 ? lines.slice(0, 5) : [
      `Mastering ${topic}: An In-Depth Guide`,
      `The Complete Guide to ${topic}`,
      `Why ${topic} Matters in Today's Ecosystem`,
      `Top Best Practices for ${topic}`,
      `The Future of ${topic}: What You Need to Know`,
    ];

    return {
      text: titles.map((t, i) => `${i + 1}. ${t}`).join('\n'),
      titles,
      provider: 'gemini',
      model: res.model,
      isLocal: false,
    };
  }

  /**
   * Document Intelligence and Analysis via Gemini API
   */
  async analyzeDocument({ text, fileName = 'Document', mode = 'summarize' }) {
    const truncatedText = text.length > 25000 ? text.substring(0, 25000) + '... [truncated for context]' : text;

    const prompt = `You are an expert Document Analysis and Intelligence AI.
Analyze the following document text (File: "${fileName}", Mode: "${mode}"):

=== DOCUMENT TEXT START ===
${truncatedText}
=== DOCUMENT TEXT END ===

Respond with a VALID, PARSABLE JSON object matching this exact schema:
{
  "documentTitle": "Concise descriptive title of document",
  "category": "One of: Technology & Software Engineering, Academic Research & Science, Business & Product Strategy, Finance & Economics, Legal & Compliance, Medical & Healthcare, General",
  "categoryConfidence": 98.5,
  "summary": "A detailed 3-5 paragraph executive summary capturing the core objectives, methodology, and conclusions.",
  "keyPoints": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3",
    "Key takeaway point 4",
    "Key takeaway point 5"
  ],
  "actionableInsights": [
    "Practical recommendation or next step 1",
    "Practical recommendation or next step 2",
    "Practical recommendation or next step 3"
  ],
  "keywords": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  "wordCount": 500,
  "sentiment": "Positive / Neutral / Analytical"
}

IMPORTANT: Output ONLY the raw JSON object. Do not wrap in markdown \`\`\`json or add conversational text.`;

    const res = await this.generateText({
      prompt,
      systemPrompt: 'You are an automated document auditor that outputs strictly valid JSON.',
      temperature: 0.3,
      maxTokens: 2500,
    });

    let cleanJson = res.text.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(cleanJson);
      return {
        fileName,
        documentTitle: parsed.documentTitle || fileName,
        category: parsed.category || 'General',
        categoryConfidence: parsed.categoryConfidence || 95.0,
        summary: parsed.summary || 'Summary generated via Google Gemini.',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        actionableInsights: Array.isArray(parsed.actionableInsights) ? parsed.actionableInsights : [],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        wordCount: parsed.wordCount || text.split(/\s+/).filter(Boolean).length,
        sentiment: parsed.sentiment || 'Neutral',
        provider: 'gemini',
        model: res.model,
        isLocal: false,
      };
    } catch (parseErr) {
      logger.warn('Failed to parse Gemini JSON output for document analysis, using structured fallback:', parseErr.message);
      return {
        fileName,
        documentTitle: fileName,
        category: 'General Technical Document',
        categoryConfidence: 90.0,
        summary: res.text,
        keyPoints: [
          'High-density technical information extracted by Google Gemini.',
          'Document contains structured domain concepts.',
        ],
        actionableInsights: ['Review primary findings in executive summary.'],
        keywords: ['document', 'analysis', 'gemini'],
        wordCount: text.split(/\s+/).filter(Boolean).length,
        sentiment: 'Analytical',
        provider: 'gemini',
        model: res.model,
        isLocal: false,
      };
    }
  }
}

export const geminiService = new GeminiService();
export default geminiService;
