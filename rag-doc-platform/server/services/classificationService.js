const CATEGORIES = {
  RESUME: 'resume',
  MEDICAL: 'medical',
  FINANCIAL: 'financial',
  EDUCATIONAL: 'educational',
  LEGAL: 'legal',
  GENERAL: 'general',
};

const CATEGORY_KEYWORDS = {
  [CATEGORIES.RESUME]: [
    'resume', 'cv', 'curriculum vitae', 'work experience', 'employment history',
    'job title', 'professional experience', 'skills', 'education', 'degree',
    'university', 'college', 'company', 'position', 'salary', 'hire', 'employed',
    'career', 'objective', 'summary', 'qualifications', 'projects', 'internship',
    'lead', 'manager', 'director', 'executive', 'junior', 'senior', 'full stack',
    'frontend', 'backend', 'developer', 'engineer', 'analyst', 'consultant'
  ],
  [CATEGORIES.MEDICAL]: [
    'patient', 'diagnosis', 'treatment', 'medication', 'prescription', 'doctor',
    'nurse', 'hospital', 'clinic', 'medical', 'health', 'symptoms', 'disease',
    'illness', 'condition', 'therapy', 'surgery', 'blood', 'pressure', 'heart',
    'diabetes', 'cancer', 'chronic', 'acute', 'clinical', 'physician', 'specialist',
    'healthcare', 'medical record', 'chart', 'vital signs', 'test results', 'lab',
    'mri', 'ct scan', 'x-ray', 'biopsy', 'prescribed', 'dosage', 'pharmacy'
  ],
  [CATEGORIES.FINANCIAL]: [
    'revenue', 'profit', 'loss', 'income', 'expense', 'balance sheet', 'income statement',
    'cash flow', 'financial', 'budget', 'investment', 'stock', 'bond', 'equity',
    'asset', 'liability', 'equity', 'capital', 'dividend', 'interest', 'loan',
    'mortgage', 'credit', 'debt', 'tax', 'audit', 'accounting', 'accounts payable',
    'accounts receivable', 'depreciation', 'amortization', 'gross', 'net', 'ebitda',
    'financial statement', 'annual report', 'quarterly', 'fiscal', 'bank', 'invoice',
    'transaction', 'payment', 'billing', 'pricing', 'cost', 'pricing'
  ],
  [CATEGORIES.EDUCATIONAL]: [
    'course', 'student', 'teacher', 'professor', 'lecture', 'tutorial', 'college',
    'university', 'school', 'education', 'learning', 'study', 'exam', 'test',
    'grade', 'gpa', 'credits', 'syllabus', 'assignment', 'homework', 'quiz',
    'midterm', 'final', 'semester', 'quarter', 'academic', 'curriculum',
    'textbook', 'chapter', 'lesson', 'module', 'objective', 'learning outcome',
    'enroll', 'matriculate', 'degree', 'bachelor', 'master', 'phd', 'certificate'
  ],
  [CATEGORIES.LEGAL]: [
    'contract', 'agreement', 'legal', 'law', 'court', 'lawyer', 'attorney', 'judge',
    'plaintiff', 'defendant', 'litigation', 'sue', 'lawsuit', 'settlement',
    'clause', 'term', 'condition', 'whereas', 'hereby', 'jurisdiction', 'arbitration',
    'liability', 'indemnity', 'warranty', 'representation', 'covenant', 'breach',
    'enforce', 'statute', 'regulation', 'compliance', 'legal notice', 'affidavit',
    'deposition', 'testimony', 'evidence', 'verdict', 'ruling', 'order', 'decree'
  ],
};

function countKeywordMatches(text, keywords) {
  const lowerText = text.toLowerCase();
  let count = 0;
  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      count += matches.length;
    }
  }
  return count;
}

function ruleBasedClassify(text) {
  if (!text || text.length < 50) {
    return { category: CATEGORIES.GENERAL, confidence: 0 };
  }

  const scores = {};
  let maxScore = 0;
  let bestCategory = CATEGORIES.GENERAL;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = countKeywordMatches(text, keywords);
    if (scores[category] > maxScore) {
      maxScore = scores[category];
      bestCategory = category;
    }
  }

  if (maxScore < 2) {
    return { category: CATEGORIES.GENERAL, confidence: 0 };
  }

  return { category: bestCategory, confidence: Math.min(maxScore / 10, 1) };
}

export async function classifyDocument(text) {
  const ruleResult = ruleBasedClassify(text);
  
  if (ruleResult.category !== CATEGORIES.GENERAL && ruleResult.confidence >= 0.2) {
    return {
      category: ruleResult.category,
      method: 'rule-based',
      confidence: ruleResult.confidence,
    };
  }

  return {
    category: ruleResult.category,
    method: 'rule-based',
    confidence: ruleResult.confidence,
  };
}

export { CATEGORIES };
export default { classifyDocument, CATEGORIES };