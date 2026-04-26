import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Download, Mail, AlertCircle } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, chatContent, docInfo }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);


  // Generate share link when modal opens
  useEffect(() => {
    if (isOpen && !hasGenerated) {
      generateShareLink();
      setHasGenerated(true);
    }
  }, [isOpen, hasGenerated]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Chat Conversation Export');
    const body = encodeURIComponent(`Here is my chat conversation:\n\n${chatContent}\n\nView online: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleDownload = () => {
    const blob = new Blob([chatContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateShareLink = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: chatContent,
          documentName: docInfo?.name,
          documentCategory: docInfo?.category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create shareable link');
      }

      const data = await response.json();
      setShareUrl(data.shareUrl);
    } catch (err) {
      console.error('Share error:', err);
      setError(err.message || 'Could not generate shareable link');
    } finally {
      setLoading(false);
    }
  };

  const shareReady = shareUrl && shareUrl.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            className="w-full max-w-lg rounded-[32px] border border-zinc-800 bg-gradient-to-b from-[#171717] to-[#0d0d0d] p-3 shadow-[0_28px_90px_rgba(0,0,0,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-[26px] border border-white/5 bg-[#101010]/95 p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
                    Share
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-zinc-100">Export This Chat</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Create a shareable link or download your conversation.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-700 bg-[#171717] text-zinc-400 transition hover:border-zinc-500 hover:bg-[#1d1d1d] hover:text-zinc-100"
                  aria-label="Close share modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                {/* Shareable Link Section */}
                <div className="rounded-[24px] border border-zinc-800 bg-[#121212] p-4">
                  <label className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                    Shareable Link
                  </label>
                  {loading ? (
                    <div className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-[#0d0d0d] px-4 py-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
                      <span className="text-sm text-zinc-400">Generating link...</span>
                    </div>
                  ) : error ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-900/50 bg-red-900/10 px-4 py-3">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-300">Could not generate link</p>
                        <p className="text-xs text-red-200/70">{error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-[#0d0d0d] px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition whitespace-nowrap ${copied
                            ? 'bg-emerald-500 text-black'
                            : 'bg-zinc-100 text-zinc-900 hover:bg-white'
                          }`}
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy Link
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  <p className="mt-3 text-xs leading-5 text-zinc-500">
                    Shareable link expires in 30 days. Anyone with the link can view this conversation.
                  </p>
                </div>

                {/* Export Options */}
                <div className="rounded-[24px] border border-zinc-800 bg-[#121212] p-4">
                  <label className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                    Export Options
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      onClick={handleEmail}
                      className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-700 bg-[#171717] px-4 py-3 text-sm text-zinc-200 transition hover:border-zinc-500 hover:bg-[#1d1d1d]"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Email Export</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-700 bg-[#171717] px-4 py-3 text-sm text-zinc-200 transition hover:border-zinc-500 hover:bg-[#1d1d1d]"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download File</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
