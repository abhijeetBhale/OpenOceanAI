import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BriefcaseBusiness, ArrowLeft, MapPin, ExternalLink } from 'lucide-react';

export default function JobsMode({ onBack, docInfo }) {
    const [jobs, setJobs] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadJobs();
    }, [docInfo]);

    const loadJobs = async () => {
        setLoading(true);
        setError('');
        try {
            if (!docInfo?.text) {
                setError('No document content available for job search');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: docInfo.text,
                    category: docInfo.category || 'general',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await response.json();
            setJobs(data.jobs || []);
            setKeywords(data.keywords || []);
            setSearchQuery(data.searchQuery || '');
        } catch (err) {
            console.error('Error loading jobs:', err);
            setError(err.message || 'Failed to load job listings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchWithLocation = async (location) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: docInfo.text,
                    category: docInfo.category || 'general',
                    location,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await response.json();
            setJobs(data.jobs || []);
            setKeywords(data.keywords || []);
        } catch (err) {
            console.error('Error loading jobs:', err);
            setError('Failed to load job listings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-y-auto px-6 py-6"
        >
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-zinc-100">Job Opportunities</h2>
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Chat
                    </button>
                </div>

                {/* Keywords Section */}
                {keywords.length > 0 && (
                    <div className="mb-6 bg-[#111] border border-zinc-800 rounded-lg p-4">
                        <p className="text-sm text-zinc-500 mb-3">Relevant keywords extracted:</p>
                        <div className="flex flex-wrap gap-2">
                            {keywords.map((keyword, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm font-medium capitalize"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                        {searchQuery && (
                            <p className="text-xs text-zinc-500 mt-3">
                                Searching for: <span className="text-zinc-400 font-medium">{searchQuery}</span>
                            </p>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                            <p className="text-zinc-500">Searching for jobs matching your profile...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
                        <p className="text-red-300 mb-4">{error}</p>
                        <button
                            onClick={loadJobs}
                            className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <BriefcaseBusiness className="h-16 w-16 text-zinc-700 mb-4" />
                        <h3 className="text-xl font-semibold text-zinc-300 mb-2">No jobs found</h3>
                        <p className="text-zinc-500 max-w-md text-center">
                            No matching job listings found with the current search. Try uploading a document with different skills or keywords.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {jobs.map((job, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-[#111] rounded-lg border border-zinc-800 p-5 hover:border-zinc-700 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-3 gap-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-zinc-100">{job.title}</h3>
                                        <p className="text-zinc-400 text-sm">{job.company}</p>
                                    </div>
                                    <span className="text-xs text-zinc-600 whitespace-nowrap">{job.posted}</span>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-zinc-500 mb-3">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-1">{job.type}</span>
                                </div>

                                {job.snippet && <p className="text-sm text-zinc-400 mb-4 line-clamp-3">{job.snippet}</p>}

                                <a
                                    href={job.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-200 transition-colors text-sm font-medium"
                                >
                                    View Job
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </motion.div>
                        ))}
                    </div>
                )}

                {jobs.length > 0 && (
                    <p className="text-center text-sm text-zinc-600 mt-8">Showing {jobs.length} job opportunities</p>
                )}
            </div>
        </motion.div>
    );
}
