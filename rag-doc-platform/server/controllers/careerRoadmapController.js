import { generateCareerRoadmap } from '../services/careerRoadmapService.js';

export const generateRoadmap = async (req, res) => {
  try {
    const { documentText, category } = req.body;

    if (!documentText || typeof documentText !== 'string') {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const result = await generateCareerRoadmap(documentText);

    res.json(result);
  } catch (error) {
    console.error('Career roadmap error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate roadmap' });
  }
};

export default { generateRoadmap };