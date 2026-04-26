const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY || '78a33259-da82-483c-8079-986961a19305';
const JOOBLE_API_URL = 'https://in.jooble.org/api';

function extractKeywordsFromText(text, category) {
  const lowerText = text.toLowerCase();
  const keywords = [];

  // Extract common skills and keywords based on category
  const skillPatterns = {
    resume: [
      'javascript', 'python', 'java', 'c++', 'c#', 'typescript', 'ruby', 'php', 'go', 'rust',
      'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'fastapi',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'mongodb', 'postgresql', 'mysql',
      'developer', 'engineer', 'frontend', 'backend', 'fullstack', 'devops', 'data'
    ],
    medical: [
      'doctor', 'nurse', 'physician', 'surgeon', 'therapist', 'radiologist',
      'cardiologist', 'dermatologist', 'pediatrician', 'psychiatrist', 'dentist',
      'clinical', 'healthcare', 'medical', 'hospital', 'pharmacy'
    ],
    financial: [
      'accountant', 'auditor', 'analyst', 'finance', 'accounting', 'investment',
      'banking', 'economics', 'cpa', 'chartered', 'taxation'
    ],
    educational: [
      'teacher', 'professor', 'instructor', 'educator', 'tutor', 'academic',
      'curriculum', 'education', 'training', 'course'
    ],
    legal: [
      'lawyer', 'attorney', 'legal', 'counsel', 'litigation', 'contract',
      'compliance', 'paralegal', 'advocate'
    ],
  };

  const relevantPatterns = skillPatterns[category] || skillPatterns.resume;
  
  for (const pattern of relevantPatterns) {
    if (lowerText.includes(pattern)) {
      keywords.push(pattern);
    }
  }

  return [...new Set(keywords)].slice(0, 5);
}

export async function findJobs(req, res) {
  try {
    const { text, category = 'general', keywords = '', location = '' } = req.body;

    if (!text && !keywords) {
      return res.status(400).json({ error: 'Document text or keywords are required' });
    }

    // Extract keywords from text if not provided
    let searchKeywords = keywords;
    if (!searchKeywords && text) {
      const extractedKeywords = extractKeywordsFromText(text, category);
      searchKeywords = extractedKeywords.join(' ');
    }

    if (!searchKeywords) {
      return res.status(400).json({ error: 'Could not extract relevant keywords from document' });
    }

    // Search for jobs using Jooble API
    const joobleRequest = {
      keywords: searchKeywords,
      ...(location && { location }),
    };

    const response = await fetch(`${JOOBLE_API_URL}/${JOOBLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(joobleRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jooble API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const jobs = data.jobs || [];
    const extractedKeywords = extractKeywordsFromText(text, category);

    res.json({
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location || 'Location not specified',
        snippet: job.snippet,
        link: job.link,
        type: job.type || 'Full-time',
        salary: job.salary || '',
        posted: job.updated || 'Recently posted',
      })),
      keywords: extractedKeywords,
      searchQuery: searchKeywords,
      totalResults: data.totalCount || jobs.length,
    });
  } catch (error) {
    console.error('Jobs search error:', error.message);
    res.status(500).json({
      error: 'Could not search for jobs',
      details: error.message,
    });
  }
}

export default { findJobs };
