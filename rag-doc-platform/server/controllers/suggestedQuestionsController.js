import groqClient from '../config/grokClient.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { searchSimilar } from '../services/vectorService.js';

const RESUME_SKILLS = [
  'javascript', 'python', 'java', 'c++', 'c#', 'typescript', 'ruby', 'php', 'go', 'rust',
  'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'fastapi', 'spring',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'mongodb', 'postgresql', 'mysql',
  'git', 'jenkins', 'gitlab', 'github', 'cicd', 'devops', 'linux', 'windows',
  'html', 'css', 'sql', 'rest', 'api', 'graphql', 'microservices', 'monolith'
];

const MEDICAL_SKILLS = [
  'diagnosis', 'treatment', 'patient care', 'clinical', 'pharmacy', 'surgery',
  'nursing', 'radiology', 'cardiology', 'neurology', 'pediatrics', 'psychiatry',
  'laboratory', 'pathology', 'oncology', 'orthopedics', 'emergency', 'icu'
];

const FINANCIAL_SKILLS = [
  'accounting', 'audit', 'taxation', 'investment', 'finance', 'budgeting',
  'forecasting', 'reporting', 'analysis', 'compliance', 'risk', 'valuation',
  'equity', 'debt', 'derivatives', 'portfolio', 'asset management', 'banking'
];

function extractSkillsFromText(text, category) {
  const lowerText = text.toLowerCase();
  let skillList = [];

  if (category === 'resume') {
    skillList = RESUME_SKILLS;
  } else if (category === 'medical') {
    skillList = MEDICAL_SKILLS;
  } else if (category === 'financial') {
    skillList = FINANCIAL_SKILLS;
  }

  const foundSkills = [];
  for (const skill of skillList) {
    if (lowerText.includes(skill)) {
      foundSkills.push(skill);
    }
  }

  return [...new Set(foundSkills)].slice(0, 8);
}

async function generateDynamicQuestions(category, documentText) {
  const fallbackQuestions = {
    resume: [
      'What are the key technical skills mentioned in this resume?',
      'What is the professional experience highlighted?',
      'What roles and companies have been worked at?',
      'What is the educational background?',
      'What are the major achievements and projects?',
      'How many years of experience does this person have?',
    ],
    medical: [
      'What is the primary diagnosis mentioned?',
      'What treatment options are recommended?',
      'What are the patient symptoms?',
      'What tests or procedures were performed?',
      'What medications are prescribed?',
      'What are the follow-up recommendations?',
    ],
    financial: [
      'What are the key financial metrics?',
      'What is the revenue trend?',
      'What are the expense categories?',
      'What is the profit margin?',
      'What are the assets and liabilities?',
      'What is the cash flow situation?',
    ],
    educational: [
      'What are the main topics covered?',
      'What learning outcomes are defined?',
      'What assignments or projects are included?',
      'What is the course structure?',
      'What prerequisites are required?',
      'What assessment methods are used?',
    ],
    legal: [
      'What are the key terms and conditions?',
      'What are the rights and obligations?',
      'What are the liabilities mentioned?',
      'What is the scope of the agreement?',
      'What are the termination clauses?',
      'What dispute resolution methods are specified?',
    ],
  };

  let contextDocs = [];
  let hasStoredDocs = false;

  if (documentText && documentText.length > 50) {
    try {
      const queryEmbedding = await generateEmbedding(documentText.substring(0, 5000));
      const searchResults = await searchSimilar(queryEmbedding, 3);
      if (searchResults.documents && searchResults.documents.length > 0) {
        contextDocs = searchResults.documents;
        hasStoredDocs = true;
      }
    } catch (e) {
      console.log('Could not search vector store:', e.message);
    }
  }

  const categoryLabels = {
    resume: 'resume/CV',
    medical: 'medical document',
    financial: 'financial document',
    educational: 'educational material',
    legal: 'legal document',
    general: 'document'
  };

  const docType = categoryLabels[category] || 'document';

  if (hasStoredDocs && contextDocs.length > 0) {
    const context = contextDocs.map((doc, i) => `[Doc ${i + 1}]: ${doc.substring(0, 800)}`).join('\n\n');

    const prompt = `Based on the following document content and similar stored documents, generate 5-6 relevant questions that a user would want to ask about this ${docType}.

Document Content:
${documentText.substring(0, 2000)}

Similar Stored Documents:
${context}

Generate 6 questions that are SPECIFIC to this document's content. Make them detailed and based on actual information in the document.
Return ONLY a JSON array of strings, nothing else. Example: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?", "Question 6?"]`;

    try {
      const response = await groqClient.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = response.choices?.[0]?.message?.content || '';
      const questions = JSON.parse(content);
      if (Array.isArray(questions) && questions.length > 0) {
        return { questions, isDynamic: true };
      }
    } catch (e) {
      console.log('LLM question generation failed:', e.message);
    }
  }

  const docContentPreview = documentText ? `\n\nUser's document excerpt:\n${documentText.substring(0, 1500)}` : '';
  const specificPrompt = `Generate 6 questions specific to this ${docType}.${docContentPreview}

Return ONLY a JSON array of strings. Make questions specific to the actual content provided.
Example: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?", "Question 6?"]`;

  try {
    const response = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: specificPrompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices?.[0]?.message?.content || '';
    const questions = JSON.parse(content);
    if (Array.isArray(questions) && questions.length > 0) {
      return { questions, isDynamic: true };
    }
  } catch (e) {
    console.log('LLM fallback failed:', e.message);
  }

  return { questions: fallbackQuestions[category] || fallbackQuestions.general, isDynamic: false };
}

export async function getSuggestedQuestions(req, res) {
  try {
    const { category = 'general', documentText = '' } = req.query;

    const { questions, isDynamic } = await generateDynamicQuestions(category, documentText);
    const skills = category === 'resume' ? extractSkillsFromText(documentText, category) : [];

    res.json({
      questions,
      skills,
      category,
      isDynamic,
    });
  } catch (error) {
    console.error('Suggested questions error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function extractSkills(req, res) {
  try {
    const { text, category = 'general' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const skills = extractSkillsFromText(text, category);

    res.json({
      skills,
      category,
      count: skills.length,
    });
  } catch (error) {
    console.error('Skill extraction error:', error);
    res.status(500).json({ error: error.message });
  }
}

export default { getSuggestedQuestions, extractSkills };
