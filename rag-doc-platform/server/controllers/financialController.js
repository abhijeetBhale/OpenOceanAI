import { analyzeFinancialDocument } from '../services/financialAnalysisService.js';

export const analyzeFinancial = async (req, res) => {
  try {
    const { documentText, category } = req.body;

    if (!documentText || typeof documentText !== 'string') {
      return res.status(400).json({ error: 'Document text is required' });
    }

    const result = analyzeFinancialDocument(documentText);

    res.json(result);
  } catch (error) {
    console.error('Financial analysis error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
};

export default { analyzeFinancial };