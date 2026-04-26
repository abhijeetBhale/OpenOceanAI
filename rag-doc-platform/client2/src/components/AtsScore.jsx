import React, { useState, useEffect } from 'react';
import { analyzeAtsScore } from '../services/api';

const CATEGORIES = {
    formatting: { name: 'Formatting & Structure', weight: 20, color: '#c96442' },
    keywords: { name: 'Keywords & Optimization', weight: 25, color: '#d97757' },
    experience: { name: 'Experience Section', weight: 20, color: '#5e5d59' },
    skills: { name: 'Skills Section', weight: 15, color: '#4d4c48' },
    education: { name: 'Education', weight: 10, color: '#87867f' },
    contact: { name: 'Contact Information', weight: 10, color: '#b0aea5' },
};

function getScoreColor(score) {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
}

function getScoreLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
}

export default function AtsScore({ docInfo }) {
    const [jdInput, setJdInput] = useState('');
    const [showJdInput, setShowJdInput] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        if (!docInfo?.text) {
            setAnalysis(null);
            return;
        }
        
        const fetchAnalysis = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await analyzeAtsScore(docInfo.text, jdInput || '');
                setAnalysis(result);
            } catch (err) {
                console.error('ATS Analysis Error:', err);
                setError(err.message || 'Failed to analyze resume');
            } finally {
                setLoading(false);
            }
        };
        
        fetchAnalysis();
    }, [docInfo?.text]);
    
    if (!docInfo) {
        return (
            <div className="rounded-generous border border-borderCream bg-ivory p-6 shadow-whisper text-center">
                <p className="text-stone font-sans">Upload a resume to see ATS score analysis.</p>
            </div>
        );
    }
    
    if (loading) {
        return (
            <div className="rounded-generous border border-borderCream bg-ivory p-6 shadow-whisper text-center">
                <div className="loading-spinner mx-auto mb-2"></div>
                <p className="text-stone font-sans">Analyzing resume...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="rounded-generous border border-borderCream bg-ivory p-6 shadow-whisper text-center">
                <p className="text-red-500 font-sans">Error: {error}</p>
            </div>
        );
    }
    
    if (!analysis) {
        return (
            <div className="rounded-generous border border-borderCream bg-ivory p-6 shadow-whisper text-center">
                <p className="text-stone font-sans">No analysis available.</p>
            </div>
        );
    }
    
    const score = analysis.score || analysis.totalScore;
    const breakdown = analysis.breakdown || analysis.scores || {};
    
    return (
        <div className="rounded-generous border border-borderCream bg-ivory p-4 shadow-whisper">
            <h2 className="text-feature-title font-serif text-midnight mb-4">ATS Score Analysis</h2>
            
            <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="#e8e6dc" strokeWidth="8" fill="none" />
                        <circle 
                            cx="64" cy="64" r="56" 
                            stroke={getScoreColor(score)} 
                            strokeWidth="8" 
                            fill="none"
                            strokeDasharray={351.86}
                            strokeDashoffset={351.86 - (351.86 * score) / 100}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-midnight">{score}</span>
                        <span className="text-xs text-stone">/ 100</span>
                    </div>
                </div>
            </div>
            
            <div className="text-center mb-4">
                <span 
                    className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: getScoreColor(score) + '20', color: getScoreColor(score) }}
                >
                    {getScoreLabel(score)}
                </span>
            </div>
            
            <div className="space-y-3 mb-4">
                {Object.entries(breakdown).map(([key, data]) => {
                    if (!data) return null;
                    const catScore = data.score || 0;
                    return (
                        <div key={key} className="border-b border-borderWarm pb-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-charcoal font-sans">{CATEGORIES[key]?.name || key}</span>
                                <span className="text-sm font-medium" style={{ color: getScoreColor(catScore) }}>
                                    {catScore}%
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-sand overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${catScore}%`, backgroundColor: CATEGORIES[key]?.color || '#c96442' }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {analysis.overallFeedback && (
                <div className="border-t border-borderWarm pt-3 mb-3">
                    <p className="text-sm text-olive font-sans">{analysis.overallFeedback}</p>
                </div>
            )}
            
            <div className="border-t border-borderWarm pt-3">
                <button
                    onClick={() => setShowJdInput(!showJdInput)}
                    className="text-sm text-terracotta hover:underline font-sans"
                >
                    {showJdInput ? 'Hide' : 'Compare with Job Description'}
                </button>
                
                {showJdInput && (
                    <div className="mt-2">
                        <textarea
                            className="w-full p-2 border border-borderWarm rounded-comfortable text-sm font-sans"
                            rows={4}
                            placeholder="Paste job description here..."
                            value={jdInput}
                            onChange={(e) => setJdInput(e.target.value)}
                        />
                        <p className="text-xs text-stone mt-1">
                            Compare your resume keywords with the job requirements.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}