import React, { useState, useEffect, useRef } from 'react';
import { uploadDocument, generateCareerRoadmap, validateFile } from '../services/api';

const STORAGE_KEY = 'rag-roadmap-doc';

const DIFFICULTY_COLORS = {
  easy: 'border-green-500 bg-green-50',
  medium: 'border-yellow-500 bg-yellow-50',
  hard: 'border-red-500 bg-red-50'
};

function loadRoadmapDoc() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveRoadmapDoc(docInfo) {
  try {
    if (docInfo) localStorage.setItem(STORAGE_KEY, JSON.stringify(docInfo));
    else localStorage.removeItem(STORAGE_KEY);
  } catch { }
}

function MilestoneNode({ milestone, isExpanded, onToggle }) {
  return (
    <div className={`relative border-l-2 ${DIFFICULTY_COLORS[milestone.difficulty] || 'border-gray-400'} pl-6 pb-6 last:pb-0`}>
      <button
        onClick={onToggle}
        className="text-left w-full"
      >
        <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-ivory border-2 border-current flex items-center justify-center">
          <span className="text-xs font-bold">{milestone.difficulty === 'easy' ? '✓' : milestone.difficulty === 'medium' ? '●' : '!'}</span>
        </div>
        <div className="bg-ivory border border-borderCream rounded-comfortable p-4 shadow-whisper hover:shadow-ring transition-shadow">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-midnight">{milestone.role}</h4>
            <span className="text-xs text-stone bg-sand px-2 py-1 rounded">{milestone.timeline}</span>
          </div>
          {milestone.salaryRange && (
            <div className="text-sm text-terracotta mt-1">{milestone.salaryRange}</div>
          )}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-borderCream">
              <div className="text-xs text-stone uppercase mb-2">Skills Needed</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {milestone.skillsNeeded?.map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-terracotta/10 text-terracotta text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
              {milestone.learningResources?.length > 0 && (
                <>
                  <div className="text-xs text-stone uppercase mb-2">Learning Resources</div>
                  <ul className="text-sm text-midnight space-y-1">
                    {milestone.learningResources.map((resource, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-terracotta">→</span>
                        {resource}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </button>
    </div>
  );
}

function CareerPath({ path, isExpanded, onToggle, isSelected, onSelect }) {
  const [expandedMilestones, setExpandedMilestones] = useState({});

  const toggleMilestone = (idx) => {
    setExpandedMilestones(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className={`rounded-generous border ${isSelected ? 'border-terracotta' : 'border-borderCream'} bg-ivory shadow-whisper overflow-hidden`}>
      <button
        onClick={onSelect}
        className="w-full p-4 text-left hover:bg-parchment transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg text-midnight">{path.title}</h3>
            <p className="text-sm text-stone mt-1">{path.description}</p>
          </div>
          <div className={`w-4 h-4 rounded-full border-2 ${isSelected ? 'bg-terracotta border-terracotta' : 'border-gray-300'}`}>
            {isSelected && <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>}
          </div>
        </div>
      </button>
      
      {isSelected && (
        <div className="border-t border-borderCream p-4 bg-parchment/50">
          <div className="space-y-0">
            {path.milestones?.map((milestone, idx) => (
              <MilestoneNode
                key={idx}
                milestone={milestone}
                isExpanded={expandedMilestones[idx]}
                onToggle={() => toggleMilestone(idx)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CareerRoadmap() {
  const [roadmapDoc, setRoadmapDoc] = useState(() => loadRoadmapDoc());
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedPath, setSelectedPath] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    saveRoadmapDoc(roadmapDoc);
  }, [roadmapDoc]);

  useEffect(() => {
    if (roadmapDoc?.text) {
      generateRoadmap();
    }
  }, [roadmapDoc]);

  const generateRoadmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateCareerRoadmap(roadmapDoc.text, roadmapDoc.category);
      setRoadmap(result);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    
    const validation = validateFile(file);
    if (!validation.valid) {
      setMessage(validation.error);
      return;
    }

    setUploading(true);
    setMessage('Uploading...');
    try {
      const res = await uploadDocument(file);
      setRoadmapDoc({
        name: res.documentName,
        text: res.documentText,
        uploadedAt: res.uploadedAt,
        category: res.category
      });
      setMessage('Upload complete');
    } catch (err) {
      setMessage(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setRoadmapDoc(null);
    setRoadmap(null);
    setMessage('');
    setError(null);
    setSelectedPath(0);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  if (!roadmapDoc) {
    return (
      <div className="mx-auto max-w-3xl">
        <div
          className={`rounded-generous border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
            dragActive 
            ? 'border-terracotta bg-ivory shadow-ring-terracotta' 
            : 'border-borderWarm bg-ivory hover:border-terracotta'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input 
            ref={inputRef} 
            type="file" 
            className="hidden" 
            accept=".pdf,image/*" 
            onChange={handleFileSelect}
          />
          <div className="text-4xl mb-3">📋</div>
          <div className="text-charcoal text-lg font-medium font-sans">
            <span className="text-terracotta mr-2">+</span>Upload your resume
          </div>
          <div className="mt-2 text-sm text-stone">PDF, PNG, JPG — or click to choose a file</div>
          {message && (
            <div className="mt-4 text-sm font-medium" style={{ color: message.includes('failed') ? '#b53333' : '#c96442' }}>
              {message}
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-stone text-sm">
          AI will analyze your resume and generate a career roadmap
        </p>
      </div>
    );
  }

  if (uploading) {
    return (
      <div className="rounded-generous border border-borderCream bg-ivory p-8 text-center shadow-whisper">
        <div className="flex justify-center gap-1 mb-3">
          <div className="w-3 h-3 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-stone">Uploading resume...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-generous border border-borderCream bg-ivory p-8 text-center shadow-whisper">
        <div className="flex justify-center gap-1 mb-3">
          <div className="w-3 h-3 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-stone">Analyzing resume and generating career paths...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-generous border border-red-300 bg-red-50 p-6 shadow-whisper">
        <h3 className="text-red-700 font-medium mb-2">Error</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <div className="mt-4 flex gap-3">
          <button 
            onClick={generateRoadmap}
            className="px-4 py-2 bg-terracotta text-ivory rounded-comfortable text-sm hover:bg-terracotta-dark"
          >
            Retry
          </button>
          <button 
            onClick={handleClear}
            className="px-4 py-2 border border-borderWarm text-charcoal rounded-comfortable text-sm hover:bg-ivory"
          >
            Upload Different Resume
          </button>
        </div>
      </div>
    );
  }

  if (!roadmap) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-terracotta/10 text-terracotta rounded-full text-sm font-medium">
            {roadmapDoc.name}
          </span>
          <span className="text-stone text-sm">Career Roadmap</span>
        </div>
        <button 
          onClick={handleClear}
          className="text-stone hover:text-terracotta text-sm"
        >
          Clear & Upload New
        </button>
      </div>

      {roadmap.currentProfile && (
        <div className="rounded-generous border border-borderCream bg-ivory p-6 shadow-whisper">
          <h2 className="text-xl font-serif text-midnight mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-stone text-xs uppercase">Current Role</div>
              <div className="text-midnight font-medium">{roadmap.currentProfile.title || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-stone text-xs uppercase">Experience</div>
              <div className="text-midnight font-medium">{roadmap.currentProfile.experience || 'Not specified'}</div>
            </div>
            <div>
              <div className="text-stone text-xs uppercase">Industry</div>
              <div className="text-midnight font-medium">{roadmap.currentProfile.industry || 'General'}</div>
            </div>
          </div>
          {roadmap.currentProfile.skills?.length > 0 && (
            <div className="mt-4">
              <div className="text-stone text-xs uppercase mb-2">Identified Skills</div>
              <div className="flex flex-wrap gap-2">
                {roadmap.currentProfile.skills.slice(0, 10).map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-sand text-charcoal text-sm rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-generous border border-borderCream bg-ivory p-6 shadow-whisper">
        <h2 className="text-xl font-serif text-midnight mb-4">Career Paths</h2>
        <p className="text-stone text-sm mb-4">Click to select a path and see milestone details</p>
        <div className="space-y-4">
          {roadmap.paths?.map((path, idx) => (
            <CareerPath
              key={idx}
              path={path}
              isSelected={selectedPath === idx}
              onSelect={() => setSelectedPath(idx)}
            />
          ))}
        </div>
      </div>

      {roadmap.overallAdvice && (
        <div className="rounded-generous border border-terracotta bg-terracotta/5 p-6">
          <h3 className="font-medium text-midnight mb-2">Overall Career Advice</h3>
          <p className="text-midnight">{roadmap.overallAdvice}</p>
        </div>
      )}
    </div>
  );
}