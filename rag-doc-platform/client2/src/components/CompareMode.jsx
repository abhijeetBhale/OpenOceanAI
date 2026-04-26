import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { compareDocument } from '../services/api';

export default function CompareMode({ doc1Name, doc1Text, onBack }) {
    const [doc2File, setDoc2File] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const handleDrop = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setDoc2File(file);
            setError('');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDoc2File(file);
            setError('');
        }
    };

    const handleCompare = async () => {
        if (!doc2File) {
            setError('Please select a document to compare');
            return;
        }

        if (!doc1Text) {
            setError('First document content is missing');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const compareResult = await compareDocument(doc2File, doc1Text, doc1Name);
            setResult(compareResult);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Comparison failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-y-auto px-6 py-6"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-col gap-4 rounded-[30px] border border-zinc-800 bg-gradient-to-b from-[#151515] to-[#0d0d0d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">Compare</p>
                        <h2 className="mt-2 text-3xl font-semibold text-zinc-100">Document Comparison</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                            Upload a second file to measure similarity, inspect overlap, and review a detailed analysis side by side.
                        </p>
                    </div>
                    <button
                        onClick={onBack}
                        className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-[#171717] px-5 py-3 text-sm text-zinc-300 transition hover:border-zinc-500 hover:bg-[#1d1d1d] hover:text-zinc-100"
                    >
                        Back to Chat
                    </button>
                </div>

                {!result ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="rounded-[28px] border border-zinc-800 bg-gradient-to-b from-[#151515] to-[#101010] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                            <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Source</p>
                            <h3 className="mt-2 text-xl font-semibold text-zinc-100">Document 1</h3>
                            <div className="mt-5 rounded-[24px] border border-zinc-800 bg-[#0f0f0f] p-5">
                                <span className="inline-flex rounded-xl bg-zinc-800 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                                    Already Uploaded
                                </span>
                                <p className="mt-4 text-lg font-medium text-zinc-200">{doc1Name || 'Document'}</p>
                                <p className="mt-2 text-sm leading-6 text-zinc-500">
                                    This file will be used as the baseline for the comparison result.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-zinc-800 bg-gradient-to-b from-[#151515] to-[#101010] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                            <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Candidate</p>
                            <h3 className="mt-2 text-xl font-semibold text-zinc-100">Document 2</h3>
                            <div
                                className={`mt-5 cursor-pointer rounded-[24px] border-2 border-dashed p-8 text-center transition ${doc2File
                                        ? 'border-zinc-600 bg-[#171717]'
                                        : 'border-zinc-800 bg-[#0f0f0f] hover:border-zinc-600 hover:bg-[#141414]'
                                    }`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => inputRef.current?.click()}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,image/*"
                                    onChange={handleFileChange}
                                />

                                {doc2File ? (
                                    <div>
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-zinc-700 bg-[#202020] text-sm font-semibold uppercase tracking-[0.22em] text-zinc-200">
                                            File
                                        </div>
                                        <p className="mt-4 break-all text-lg font-medium text-zinc-200">{doc2File.name}</p>
                                        <p className="mt-2 text-sm text-zinc-500">Click to replace this file</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-zinc-700 bg-[#1a1a1a] text-sm font-semibold uppercase tracking-[0.22em] text-zinc-200">
                                            Drop
                                        </div>
                                        <p className="mt-4 text-lg font-medium text-zinc-200">Upload the second document</p>
                                        <p className="mt-2 text-sm text-zinc-500">Click to browse or drag and drop a PDF or image</p>
                                        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-600">PDF, PNG, JPG</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            {error && (
                                <div className="mb-4 rounded-2xl border border-red-900/60 bg-[#1b1010] px-4 py-3 text-center text-sm text-red-200">
                                    {error}
                                </div>
                            )}
                            <div className="flex justify-center">
                                <button
                                    onClick={handleCompare}
                                    disabled={!doc2File || loading}
                                    className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-zinc-100 px-8 py-3 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
                                            Comparing...
                                        </span>
                                    ) : (
                                        'Compare Documents'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Summary Card */}
                        <div className="rounded-[30px] border border-zinc-800 bg-gradient-to-b from-[#151515] to-[#0d0d0d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Result</p>
                                    <h3 className="mt-2 text-2xl font-semibold text-zinc-100">Comparison Analysis</h3>
                                </div>
                                <button
                                    onClick={() => setResult(null)}
                                    className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-[#171717] px-5 py-3 text-sm text-zinc-300 transition hover:border-zinc-500 hover:bg-[#1d1d1d] hover:text-zinc-100"
                                >
                                    Compare Again
                                </button>
                            </div>

                            {/* Similarity Score */}
                            <div className="mt-6 rounded-[24px] border border-zinc-800 bg-[#101010] p-5">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-900">
                                        <div
                                            className={`h-full rounded-full transition ${result.isIdentical
                                                    ? 'bg-emerald-500'
                                                    : result.isVerySimilar
                                                        ? 'bg-blue-500'
                                                        : result.isVeryDifferent
                                                            ? 'bg-red-500'
                                                            : 'bg-amber-400'
                                                }`}
                                            style={{ width: `${result.similarityScore}%` }}
                                        />
                                    </div>
                                    <span
                                        className={`text-lg font-semibold whitespace-nowrap ${result.isIdentical
                                                ? 'text-emerald-400'
                                                : result.isVerySimilar
                                                    ? 'text-blue-400'
                                                    : result.isVeryDifferent
                                                        ? 'text-red-400'
                                                        : 'text-amber-300'
                                            }`}
                                    >
                                        {result.similarityScore}% Similar
                                    </span>
                                </div>

                                <div className="mt-5 rounded-2xl border border-zinc-800 bg-[#151515] p-4">
                                    <p className="text-sm leading-6 text-zinc-300">
                                        <strong className="text-zinc-100">{result.relationshipNote}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Document Information Cards */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {/* Document 1 Info */}
                            <div className="rounded-[28px] border border-zinc-800 bg-gradient-to-b from-[#151515] to-[#101010] p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Document 1</p>
                                    {result.isIdentical && (
                                        <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400">EXACT MATCH</span>
                                    )}
                                </div>
                                <h3 className="mt-2 text-xl font-semibold text-zinc-100">{result.doc1Info.name}</h3>

                                <div className="mt-5 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500">Words</p>
                                            <p className="text-lg font-semibold text-zinc-200">{result.doc1Info.wordCount.toLocaleString()}</p>
                                        </div>
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500">Characters</p>
                                            <p className="text-lg font-semibold text-zinc-200">{result.doc1Info.charCount.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Experience & Education */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500">Experience</p>
                                            <p className="text-lg font-semibold text-zinc-200">{result.doc1Info.experience ? result.doc1Info.experience + ' yrs' : '-'}</p>
                                        </div>
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500">Degrees</p>
                                            <p className="text-sm font-semibold text-zinc-200">{result.doc1Info.degrees.length > 0 ? result.doc1Info.degrees.join(', ') : '-'}</p>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    {result.doc1Info.emails.length > 0 && (
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500">Email</p>
                                            <p className="text-sm font-semibold text-zinc-200 truncate">{result.doc1Info.emails[0]}</p>
                                        </div>
                                    )}

                                    {/* Technical Skills */}
                                    {result.doc1Info.skills && result.doc1Info.skills.length > 0 && (
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500 mb-2">Technical Skills</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {result.doc1Info.skills.slice(0, 8).map((skill, i) => (
                                                    <span key={i} className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Job Titles */}
                                    {result.doc1Info.jobTitles && result.doc1Info.jobTitles.length > 0 && (
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500 mb-2">Job Titles</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {result.doc1Info.jobTitles.slice(0, 4).map((title, i) => (
                                                    <span key={i} className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-300">
                                                        {title}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Top Topics */}
                                    {result.doc1Info.topTopics && result.doc1Info.topTopics.length > 0 && (
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500 mb-2">Top Topics</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {result.doc1Info.topTopics.slice(0, 6).map((topic, i) => (
                                                    <span key={i} className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Document 2 Info */}
                            <div className="rounded-[28px] border border-zinc-800 bg-gradient-to-b from-[#151515] to-[#101010] p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Document 2</p>
                                    {result.isIdentical && (
                                        <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400">EXACT MATCH</span>
                                    )}
                                </div>
                                <h3 className="mt-2 text-xl font-semibold text-zinc-100">{result.doc2Info.name}</h3>

                                <div className="mt-5 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500">Words</p>
                                            <p className="text-lg font-semibold text-zinc-200">{result.doc2Info.wordCount.toLocaleString()}</p>
                                        </div>
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500">Characters</p>
                                            <p className="text-lg font-semibold text-zinc-200">{result.doc2Info.charCount.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Experience & Education */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500">Experience</p>
                                            <p className="text-lg font-semibold text-zinc-200">{result.doc2Info.experience ? result.doc2Info.experience + ' yrs' : '-'}</p>
                                        </div>
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500">Degrees</p>
                                            <p className="text-sm font-semibold text-zinc-200">{result.doc2Info.degrees.length > 0 ? result.doc2Info.degrees.join(', ') : '-'}</p>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    {result.doc2Info.emails.length > 0 && (
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500">Email</p>
                                            <p className="text-sm font-semibold text-zinc-200 truncate">{result.doc2Info.emails[0]}</p>
                                        </div>
                                    )}

                                    {/* Technical Skills */}
                                    {result.doc2Info.skills && result.doc2Info.skills.length > 0 && (
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500 mb-2">Technical Skills</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {result.doc2Info.skills.slice(0, 8).map((skill, i) => (
                                                    <span key={i} className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Job Titles */}
                                    {result.doc2Info.jobTitles && result.doc2Info.jobTitles.length > 0 && (
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500 mb-2">Job Titles</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {result.doc2Info.jobTitles.slice(0, 4).map((title, i) => (
                                                    <span key={i} className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-300">
                                                        {title}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Top Topics */}
                                    {result.doc2Info.topTopics && result.doc2Info.topTopics.length > 0 && (
                                        <div className="rounded-lg bg-[#0f0f0f] p-3">
                                            <p className="text-xs text-zinc-500 mb-2">Top Topics</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {result.doc2Info.topTopics.slice(0, 6).map((topic, i) => (
                                                    <span key={i} className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Overlap Analysis */}
                        {result.contentAnalysis && (
                            <div className="rounded-[28px] border border-zinc-800 bg-gradient-to-b from-[#151515] to-[#101010] p-6">
                                <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Content Overlap</p>

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {/* Common Words */}
                                    <div className="rounded-xl border border-emerald-900/50 bg-[#0a1610] p-4">
                                        <p className="text-xs text-emerald-400 mb-2">Common Terms ({result.contentAnalysis.commonWords?.length || 0})</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.contentAnalysis.commonWords?.slice(0, 10).map((word, i) => (
                                                <span key={i} className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Unique to Doc 1 */}
                                    <div className="rounded-xl border border-blue-900/50 bg-[#0a1219] p-4">
                                        <p className="text-xs text-blue-400 mb-2">Unique to Doc 1 ({result.contentAnalysis.uniqueToDoc1?.length || 0})</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.contentAnalysis.uniqueToDoc1?.slice(0, 8).map((word, i) => (
                                                <span key={i} className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Unique to Doc 2 */}
                                    <div className="rounded-xl border border-purple-900/50 bg-[#140a16] p-4">
                                        <p className="text-xs text-purple-400 mb-2">Unique to Doc 2 ({result.contentAnalysis.uniqueToDoc2?.length || 0})</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.contentAnalysis.uniqueToDoc2?.slice(0, 8).map((word, i) => (
                                                <span key={i} className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-300">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detailed Analysis */}
                        <div className="rounded-[30px] border border-zinc-800 bg-gradient-to-b from-[#151515] to-[#0d0d0d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                            <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Detailed Analysis</p>
                            <div className="prose prose-invert mt-4 max-w-none prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-zinc-100">
                                <ReactMarkdown
                                    components={{
                                        p: ({ node, ...props }) => <p className="mb-3 text-zinc-300" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="mb-3 list-disc pl-5 text-zinc-300" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="mb-3 list-decimal pl-5 text-zinc-300" {...props} />,
                                        li: ({ node, ...props }) => <li className="mb-1 text-zinc-300" {...props} />,
                                        strong: ({ node, ...props }) => <strong className="font-semibold text-zinc-100" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="mb-2 mt-4 text-xl font-bold text-zinc-200" {...props} />,
                                        h3: ({ node, ...props }) => <h3 className="mb-2 mt-3 text-lg font-semibold text-zinc-200" {...props} />,
                                        h4: ({ node, ...props }) => <h4 className="mb-2 mt-2 text-base font-semibold text-zinc-200" {...props} />,
                                    }}
                                >
                                    {result.analysis}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}