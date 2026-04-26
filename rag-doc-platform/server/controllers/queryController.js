import { askQuestion } from '../services/ragService.js';

export async function askQuery(req, res) {
  try {
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await askQuestion(question);

    res.json({
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: error.message });
  }
}

export default { askQuery };