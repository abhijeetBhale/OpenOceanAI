import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

export default function PreviewModal({ isOpen, onClose, docInfo, highlight }) {
  const [copied, setCopied] = useState(false);
  const highlightRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const categoryColors = CATEGORY_COLORS[docInfo?.category] || CATEGORY_COLORS.general;
  const fullText = docInfo?.text || '';
  const previewText = fullText.slice(0, 3000) || 'No document text available';

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function findHighlight(text, h) {
    if (!h || !text) return { index: -1, length: 0 };

    // direct exact match
    let idx = text.indexOf(h);
    if (idx >= 0) return { index: idx, length: h.length };

    // try case-insensitive exact
    idx = text.toLowerCase().indexOf(h.toLowerCase());
    if (idx >= 0) return { index: idx, length: h.length };

    // normalize whitespace and try a regex on the original text to find a loose match
    const norm = h.replace(/\s+/g, ' ').trim();
    const short = norm.slice(0, 200);
    if (!short) return { index: -1, length: 0 };

    const pattern = escapeRegExp(short).replace(/\s+/g, '\\s+');
    try {
      const regex = new RegExp(pattern, 'i');
      const m = regex.exec(text);
      if (m) return { index: m.index, length: m[0].length };
    } catch (e) {
      // fallback
    }

    return { index: -1, length: 0 };
  }

  const { index: highlightIndex, length: highlightLength } = findHighlight(fullText, highlight);
  const hasHighlight = highlight && highlightIndex >= 0;

  useEffect(() => {
    if (!isOpen) return;
    if (hasHighlight && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOpen, highlightIndex, hasHighlight]);
  useEffect(() => {
    if (!isOpen) return;
    try {
      console.log('PreviewModal opened', { hasHighlight, highlightIndex, highlightLength });
    } catch (e) { }
  }, [isOpen, hasHighlight, highlightIndex, highlightLength]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(docInfo?.text || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSummarize = async () => {
    try {
      const resp = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: docInfo?.text || '' }),
      });
      if (!resp.ok) throw new Error('Could not summarize');
      const data = await resp.json();
      // open simple modal with summaries (use alert for minimal change)
      alert('Short:\n' + (data.short || '') + '\n\nMedium:\n' + (data.medium || '') + '\n\nLong:\n' + (data.long || ''));
    } catch (e) {
      console.error('Summarize failed', e);
      alert('Summary failed: ' + e.message);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          {/* Centering wrapper ensures modal is centered regardless of layout transforms */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-3xl overflow-hidden rounded-3xl border border-zinc-800 bg-[#0f0f0f] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 bg-[#151515] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-[#1a1a1a]">
                    <FileText className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-100">{docInfo?.name || 'Document'}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {docInfo?.uploadedAt && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(docInfo.uploadedAt).toLocaleString()}
                        </span>
                      )}
                      {docInfo?.category && (
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
              <div className="max-h-[70vh] overflow-y-auto p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-400">Document Preview</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSummarize}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#1a1a1a] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-500 hover:bg-[#252525] hover:text-zinc-100"
                    >
                      <span>Summarize</span>
                    </button>
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
                </div>
                <div className="rounded-xl border border-zinc-800 bg-[#0a0a0a] p-4">
                  <div className="text-sm leading-relaxed text-zinc-300 font-sans">
                    {hasHighlight ? (
                      <pre className="whitespace-pre-wrap">
                        {fullText.slice(0, highlightIndex)}
                        <mark ref={highlightRef} className="bg-amber-400/30 text-amber-100">{fullText.slice(highlightIndex, highlightIndex + highlightLength)}</mark>
                        {fullText.slice(highlightIndex + highlightLength)}
                      </pre>
                    ) : (
                      <>
                        <pre className="whitespace-pre-wrap">{previewText}</pre>
                        <div className="mt-4 rounded-md border border-zinc-800 bg-[#0b0b0b] p-3">
                          <p className="text-xs text-zinc-400 mb-2">Source snippet (could not locate exact position in document)</p>
                          <pre className="whitespace-pre-wrap text-sm text-zinc-300">{(highlight || '').slice(0, 2000)}</pre>
                        </div>
                      </>
                    )}

                    {fullText.length > 3000 && (
                      <p className="mt-4 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
                        ... Document truncated. Full text ({fullText.length.toLocaleString()} characters) available in conversation.
                      </p>
                    )}
                  </div>
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
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}