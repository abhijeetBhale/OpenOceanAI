import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, FileText, Calendar, Tag } from 'lucide-react';

const CATEGORY_COLORS = {
    resume: { bg: 'bg-blue-900/30', text: 'text-blue-300', border: 'border-blue-700' },
    medical: { bg: 'bg-red-900/30', text: 'text-red-300', border: 'border-red-700' },
    financial: { bg: 'bg-green-900/30', text: 'text-green-300', border: 'border-green-700' },
    educational: { bg: 'bg-purple-900/30', text: 'text-purple-300', border: 'border-purple-700' },
    legal: { bg: 'bg-yellow-900/30', text: 'text-yellow-300', border: 'border-yellow-700' },
    general: { bg: 'bg-gray-900/30', text: 'text-gray-300', border: 'border-gray-700' },
};

export default function PreviewModal({ isOpen, onClose, docInfo }) {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !docInfo) return null;

    const categoryColors = CATEGORY_COLORS[docInfo.category] || CATEGORY_COLORS.general;
    const previewText = docInfo.text?.slice(0, 3000) || 'No document text available';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(docInfo.text || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                        onKeyDown={handleKeyDown}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-zinc-800 bg-[#0f0f0f] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                        onKeyDown={handleKeyDown}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-800 bg-[#151515] px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-[#1a1a1a]">
                                    <FileText className="h-5 w-5 text-zinc-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-zinc-100">{docInfo.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        {docInfo.uploadedAt && (
                                            <span className="flex items-center gap-1 text-xs text-zinc-500">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(docInfo.uploadedAt).toLocaleString()}
                                            </span>
                                        )}
                                        {docInfo.category && (
                                            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] uppercase tracking-wider ${categoryColors.bg} ${categoryColors.border} ${categoryColors.text}`}>
                                                <Tag className="h-3 w-3" />
                                                {docInfo.category}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-[#1a1a1a] text-zinc-400 transition hover:border-zinc-500 hover:bg-[#252525] hover:text-zinc-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[60vh] overflow-y-auto p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-medium text-zinc-400">Document Preview</h3>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#1a1a1a] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-500 hover:bg-[#252525] hover:text-zinc-100"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3 w-3 text-emerald-400" />
                                            <span className="text-emerald-400">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3 w-3" />
                                            <span>Copy Text</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-[#0a0a0a] p-4">
                                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 font-sans">
                                    {previewText}
                                </pre>
                                {docInfo.text?.length > 3000 && (
                                    <p className="mt-4 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
                                        ... Document truncated. Full text ({docInfo.text.length.toLocaleString()} characters) available in conversation.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 bg-[#151515] px-6 py-4">
                            <button
                                onClick={onClose}
                                className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-[#252525] hover:text-zinc-100"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
