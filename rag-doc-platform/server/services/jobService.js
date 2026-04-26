import groqClient from '../config/grokClient.js';
import { getDocument } from './documentStore.js';

const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY || '';
const JOOBLE_API_URL = 'https://jooble.org/api';

const SAMPLE_JOBS = [
  {
    title: 'Full Stack Developer',
    company: 'Tech Innovators Pvt Ltd',
    location: 'Bangalore, Karnataka',
    salary: '₹8,00,000 - ₹15,00,000 PA',
    type: 'Full-time',
    link: 'https://www.naukri.com/jobs/full-stack-developer-jobs',
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
    posted: '2 days ago',
  },
  {
    title: 'Frontend Developer',
    company: 'WebSolutions India',
    location: 'Hyderabad, Telangana',
    salary: '₹5,00,000 - ₹10,00,000 PA',
    type: 'Full-time',
    link: 'https://www.naukri.com/jobs/frontend-developer-jobs',
    skills: ['React', 'CSS', 'JavaScript', 'HTML'],
    posted: '3 days ago',
  },
  {
    title: 'Backend Developer',
    company: 'CloudTech Systems',
    location: 'Pune, Maharashtra',
    salary: '₹7,00,000 - ₹12,00,000 PA',
    type: 'Full-time',
    link: 'https://www.naukri.com/jobs/backend-developer-jobs',
    skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
    posted: '1 week ago',
  },
  {
    title: 'Software Engineer',
    company: 'Digital Ventures',
    location: 'Chennai, Tamil Nadu',
    salary: '₹6,00,000 - ₹11,00,000 PA',
    type: 'Full-time',
    link: 'https://www.naukri.com/jobs/software-engineer-jobs',
    skills: ['Java', 'Spring Boot', 'Microservices'],
    posted: '5 days ago',
  },
  {
    title: 'DevOps Engineer',
    company: 'ScaleUp Tech',
    location: 'Gurgaon, Haryana',
    salary: '₹9,00,000 - ₹18,00,000 PA',
    type: 'Full-time',
    link: 'https://www.naukri.com/jobs/devops-engineer-jobs',
    skills: ['Docker', 'Kubernetes', 'Jenkins', 'AWS'],
    posted: '3 days ago',
  },
  {
    title: 'Data Analyst',
    company: 'Analytics Pro',
    location: 'Mumbai, Maharashtra',
    salary: '₹5,00,000 - ₹9,00,000 PA',
    type: 'Full-time',
    link: 'https://www.naukri.com/jobs/data-analyst-jobs',
    skills: ['Python', 'SQL', 'Tableau', 'Excel'],
    posted: '1 day ago',
  },
  {
    title: 'Machine Learning Engineer',
    company: 'AI Solutions',
    location: 'Bangalore, Karnataka',
    salary: '₹10,00,000 - ₹20,00,000 PA',
    type: 'Full-time',
    link: 'https://www.naukri.com/jobs/machine-learning-engineer-jobs',
    skills: ['Python', 'TensorFlow', 'ML', 'Deep Learning'],
    posted: '4 days ago',
  },
  {
    title: 'UI/UX Designer',
    company: 'Creative Digital',
    location: 'Delhi NCR',
    salary: '₹4,00,000 - ₹8,00,000 PA',
    type: 'Full-time',
    link: 'https://www.naukri.com/jobs/ui-ux-designer-jobs',
    skills: ['Figma', 'Adobe XD', 'UI Design', 'Prototyping'],
    posted: '6 days ago',
  },
];

async function extractSkillsFromDocument(docText) {
  const prompt = `Extract the key skills from this document/resume. Focus on:
- Technical skills (programming languages, frameworks, tools)
- Professional skills
- Domain expertise

Document:
${docText.slice(0, 3000)}

Return a JSON array of 5-10 most relevant skills, one per line. Just list skills, nothing else.`;

  try {
    const response = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'Extract skills from document and return as a simple list.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const skillsText = response.choices?.[0]?.message?.content || '';
    const skills = skillsText
      .split('\n')
      .map(s => s.replace(/^[0-9]+[\.\)}\s]*/, '').trim())
      .filter(s => s.length > 0 && s.length < 50)
      .slice(0, 10);

    return skills.length > 0 ? skills : ['Developer', 'Engineer'];
  } catch (error) {
    console.error('Skill extraction error:', error);
    return ['Developer', 'Engineer'];
  }
}

async function searchJoobleJobs(keywords, location = '') {
  if (!JOOBLE_API_KEY) {
    return { jobs: SAMPLE_JOBS, isSample: true };
  }

  try {
    const response = await fetch(`${JOOBLE_API_URL}/${JOOBLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keywords: keywords.join(', '),
        location: location || 'India',
        radius: 50,
        page: 1,
      }),
    });

    if (!response.ok) {
      throw new Error('Jooble API request failed');
    }

    const data = await response.json();
    
    if (!data.jobs || data.jobs.length === 0) {
      return { jobs: SAMPLE_JOBS, isSample: true };
    }

    const jobs = data.jobs.slice(0, 10).map((job, index) => ({
      title: job.title || 'Job Position',
      company: job.company || 'Company',
      location: job.location || 'India',
      salary: job.salary || 'Not disclosed',
      type: job.type || 'Full-time',
      link: job.link || '#',
      skills: keywords.slice(0, 5),
      posted: job.updated || 'Recent',
    }));

    return { jobs, isSample: false };
  } catch (error) {
    console.error('Jooble API error:', error);
    return { jobs: SAMPLE_JOBS, isSample: true };
  }
}

export async function findRelatedJobs() {
  const doc = getDocument();
  
  if (!doc.text || doc.text.trim().length < 50) {
    return {
      skills: [],
      jobs: SAMPLE_JOBS,
      isSample: true,
      message: 'Please upload a document to find related jobs.',
    };
  }

  const skills = await extractSkillsFromDocument(doc.text);
  
  const { jobs, isSample } = await searchJoobleJobs(skills, '');

  let disclaimer = '';
  if (isSample) {
    disclaimer = 'Note: The jobs below are sample jobs for demonstration purposes. The job search API encountered an issue, but these represent typical positions that match your skills.';
  }

  return {
    skills,
    jobs,
    isSample,
    disclaimer,
    documentName: doc.name,
  };
}

export async function findJobsBySearch(searchQuery, location = '') {
  const keywords = searchQuery.split(/[,\s]+/).filter(k => k.length > 1);
  
  const { jobs, isSample } = await searchJoobleJobs(keywords, location);

  let disclaimer = '';
  if (isSample) {
    disclaimer = 'Note: The jobs below are sample jobs for demonstration purposes. The job search API encountered an issue, but these represent typical positions that match your search.';
  }

  return {
    keywords: keywords.join(', '),
    jobs,
    isSample,
    disclaimer,
  };
}

export default { findRelatedJobs, findJobsBySearch };