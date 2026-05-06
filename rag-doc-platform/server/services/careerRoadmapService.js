import groqClient from '../config/grokClient.js';

const SYSTEM_PROMPT = `You are a career advisor AI. Analyze the resume provided and create a detailed career roadmap.
Respond ONLY with valid JSON in the exact format specified. No additional text or explanation.

JSON format:
{
  "currentProfile": {
    "title": "Current job title or 'Unknown'",
    "experience": "Years of experience summary",
    "skills": ["skill1", "skill2", "skill3"],
    "industry": "Industry or 'General'"
  },
  "paths": [
    {
      "title": "Career path name (e.g., 'Tech Lead Path')",
      "description": "Why this path is suitable",
      "milestones": [
        {
          "role": "Role title",
          "timeline": "Expected timeline (e.g., '6-12 months')",
          "skillsNeeded": ["skill1", "skill2"],
          "learningResources": ["resource1", "resource2"],
          "salaryRange": "e.g., '$90k-$120k'",
          "difficulty": "easy/medium/hard"
        }
      ]
    }
  ],
  "overallAdvice": "2-3 sentences of overall career advice"
}`;

export async function generateCareerRoadmap(resumeText) {
  if (!resumeText || resumeText.length < 100) {
    throw new Error('Resume text is too short for analysis');
  }

  try {
    const response = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Here is the resume to analyze:\n\n${resumeText}` }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);
    
    return {
      currentProfile: parsed.currentProfile || {},
      paths: parsed.paths || [],
      overallAdvice: parsed.overallAdvice || '',
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Career roadmap generation error:', error);
    throw new Error(error.message || 'Failed to generate career roadmap');
  }
}

export default { generateCareerRoadmap };