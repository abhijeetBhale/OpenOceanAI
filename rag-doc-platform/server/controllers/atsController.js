import groqClient from '../config/grokClient.js';

export const analyzeAtsScore = async (req, res) => {
    try {
        const { resumeText, jdText } = req.body;
        
        if (!resumeText) {
            return res.status(400).json({ error: 'Resume text is required' });
        }

        const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume analyst. Analyze the resume and provide a detailed ATS score analysis in JSON format.

Respond ONLY with valid JSON, no additional text. Use this exact structure:
{
  "score": <number 0-100>,
  "breakdown": {
    "formatting": { "score": <number>, "feedback": "<string>", "recommendations": [<string>] },
    "keywords": { "score": <number>, "feedback": "<string>", "recommendations": [<string>] },
    "experience": { "score": <number>, "feedback": "<string>", "recommendations": [<string>] },
    "skills": { "score": <number>, "feedback": "<string>", "recommendations": [<string>] },
    "education": { "score": <number>, "feedback": "<string>", "recommendations": [<string>] },
    "contact": { "score": <number>, "feedback": "<string>", "recommendations": [<string>] }
  },
  "overallFeedback": "<string>",
  "improvementPriority": [<string>]
}`;

        let userPrompt = `Analyze this resume for ATS compatibility:\n\n${resumeText}`;

        if (jdText) {
            userPrompt += `\n\nCompare against this job description:\n\n${jdText}\n\nProvide JD match analysis in "jdMatch" field with matched keywords, missing keywords, and match score.`;
        }

        const completion = await groqClient.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        res.json(result);

    } catch (error) {
        console.error('ATS Analysis Error:', error.message);
        res.status(500).json({ error: 'Failed to analyze resume: ' + error.message });
    }
};