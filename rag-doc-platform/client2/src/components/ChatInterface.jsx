import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Share2 } from 'lucide-react';
import { askQuestion, getSuggestedQuestions } from '../services/api';

const ChatInterface = forwardRef(function ChatInterface({
    messages: propMessages,
    setMessages: propSetMessages,
    docInfo,
    onNewDocument,
    onShare,
}, ref) {
    const messages = propMessages || [];
    const setMessages = propSetMessages || (() => { });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useImperativeHandle(ref, () => ({ getMessages: () => messages }));

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (messages.length === 0) {
            loadSuggestedQuestions();
        }
    }, [docInfo]);

    useEffect(() => {
        if (!textareaRef.current) return;

        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }, [input]);

    const loadSuggestedQuestions = async () => {
        setLoadingSuggestions(true);
        try {
            const category = docInfo?.category || 'general';
            const documentText = docInfo?.text || '';
            const result = await getSuggestedQuestions(category, documentText);
            setSuggestedQuestions(result.questions || []);
        } catch (error) {
            console.error('Error loading suggestions:', error);
            setSuggestedQuestions([
                'What is this document about?',
                'Who is the author?',
                'What are the main points?',
            ]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleSend = async (question = null) => {
        const questionToSend = question || input;
        if (!questionToSend.trim() || loading) return;

        setInput('');
        setLoading(true);
        setMessages((prev) => [...prev, { role: 'user', content: questionToSend }]);
        setMessages((prev) => [...prev, { role: 'assistant', content: '', isLoading: true }]);
        setSuggestedQuestions([]);

        try {
            const result = await askQuestion(questionToSend);
            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: result.answer,
                    isLoading: false,
                };
                return newMessages;
            });
        } catch (error) {
            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: error.response?.data?.error || 'Error: ' + error.message,
                    isLoading: false,
                    isError: true,
                };
                return newMessages;
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const hasMessages = messages.length > 0;

    return (
        <div className="relative flex-1 flex flex-col overflow-hidden">
            {/* Share button in top right */}
            {hasMessages && onShare && (
                <div className="absolute right-4 top-4 z-10">
                    <button
                        onClick={onShare}
                        className="inline-flex items-center justify-center p-2 text-zinc-400 transition hover:text-zinc-200"
                        title="Share chat"
                    >
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-transparent px-4 py-5">
                <div className="max-w-[52rem] mx-auto space-y-6">
                    {!hasMessages ? (
                        <div className="py-6">
                            <div className="rounded-[26px] border border-zinc-800 bg-gradient-to-b from-[#151515] to-[#0d0d0d] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[22px] border border-zinc-700 bg-[#1a1a1a] text-xs font-semibold uppercase tracking-[0.24em] text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                    Ask
                                </div>
                                <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
                                    Document Chat
                                </p>
                                <h2 className="mt-2.5 text-xl font-semibold text-zinc-100">
                                    Ask sharper questions about your file
                                </h2>
                                <p className="mx-auto mt-2.5 max-w-2xl text-sm leading-6 text-zinc-400">
                                    Summarize, extract details, compare sections, or ask for action items in a conversational format.
                                </p>

                                {docInfo?.name && (
                                    <div className="mx-auto mt-5 inline-flex max-w-full items-center gap-2 rounded-[18px] border border-zinc-700 bg-[#121212] px-4 py-2.5 text-left text-sm text-zinc-300">
                                        <span className="rounded-xl bg-zinc-800 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                                            Active
                                        </span>
                                        <span className="truncate">{docInfo.name}</span>
                                    </div>
                                )}

                                {loadingSuggestions ? (
                                    <div className="mt-6 flex justify-center">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
                                    </div>
                                ) : (
                                    <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                                        {suggestedQuestions.map((q, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSend(q)}
                                                disabled={loading}
                                                className="rounded-[18px] border border-zinc-700 bg-[#161616] px-3.5 py-2.5 text-sm text-zinc-300 transition hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-[#1b1b1b] hover:text-zinc-100 disabled:opacity-50"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div
                                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[18px] border text-[10px] font-semibold uppercase tracking-[0.16em] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${msg.role === 'user'
                                                ? 'border-zinc-600 bg-zinc-200 text-zinc-900'
                                                : 'border-zinc-700 bg-[#171717] text-zinc-200'
                                            }`}
                                    >
                                        {msg.role === 'user' ? 'You' : 'AI'}
                                    </div>

                                    <div className={`flex-1 max-w-[42rem] ${msg.role === 'user' ? 'text-right' : ''}`}>
                                        <div
                                            className={`inline-block rounded-[22px] border px-4 py-3.5 text-left shadow-[0_16px_40px_rgba(0,0,0,0.14)] ${msg.role === 'user'
                                                    ? 'border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-100'
                                                    : msg.isError
                                                        ? 'border-red-900/60 bg-gradient-to-b from-[#1b1010] to-[#130c0c] text-red-100'
                                                        : 'border-zinc-800 bg-gradient-to-b from-[#151515] to-[#101010] text-zinc-200'
                                                }`}
                                        >
                                            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                                                {msg.role === 'user' ? 'Question' : msg.isError ? 'Error' : 'Answer'}
                                            </div>
                                            {msg.isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
                                                    <span className="text-sm text-zinc-400">Thinking...</span>
                                                </div>
                                            ) : (
                                                <div className="prose prose-sm max-w-none prose-invert prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-zinc-100">
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="mb-2 list-disc pl-4" {...props} />,
                                                            ol: ({ node, ...props }) => <ol className="mb-2 list-decimal pl-4" {...props} />,
                                                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                            strong: ({ node, ...props }) => <strong className="font-semibold text-zinc-100" {...props} />,
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="px-4 py-4">
                <div className="max-w-[52rem] mx-auto">
                    <motion.div
                        initial={{ opacity: 0.85 }}
                        animate={{
                            opacity: [0.82, 1, 0.82],
                            boxShadow: [
                                '0 0 0 1px rgba(244,244,245,0.05), 0 0 24px rgba(255,255,255,0.04), 0 18px 40px rgba(0,0,0,0.24)',
                                '0 0 0 1px rgba(244,244,245,0.08), 0 0 38px rgba(255,255,255,0.08), 0 22px 48px rgba(0,0,0,0.28)',
                                '0 0 0 1px rgba(244,244,245,0.05), 0 0 24px rgba(255,255,255,0.04), 0 18px 40px rgba(0,0,0,0.24)',
                            ],
                        }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative rounded-[26px] p-[1px]"
                    >
                        <motion.div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 rounded-[26px] opacity-80"
                            animate={{
                                background: [
                                    'linear-gradient(120deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03), rgba(120,120,120,0.14), rgba(255,255,255,0.1))',
                                    'linear-gradient(220deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04), rgba(120,120,120,0.18), rgba(255,255,255,0.08))',
                                    'linear-gradient(320deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03), rgba(120,120,120,0.14), rgba(255,255,255,0.1))',
                                ],
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                        />
                        <div className="relative rounded-[24px] border border-zinc-800/80 bg-gradient-to-b from-[#161616]/95 to-[#0d0d0d]/95 p-1.5 backdrop-blur-xl">
                            <div className="flex items-end gap-2.5 rounded-[18px] bg-[#101010]/80 px-3 py-2.5 ring-1 ring-inset ring-white/5">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Ask about this document..."
                                    className="min-h-[46px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] leading-6 text-zinc-100 placeholder-zinc-500 focus:outline-none"
                                    rows={1}
                                    disabled={loading}
                                    style={{ maxHeight: '200px' }}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || loading}
                                    className="mb-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[16px] bg-zinc-100 text-zinc-900 transition hover:scale-[1.02] hover:bg-white disabled:scale-100 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                                    aria-label="Send message"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-3.5 w-3.5"
                                    >
                                        <path d="M22 2 11 13" />
                                        <path d="m22 2-7 20-4-9-9-4Z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex items-center justify-between px-3 pt-2.5 text-[11px] text-zinc-500">
                                <p>Enter to send, Shift + Enter for a new line</p>
                                <p>{loading ? 'Thinking...' : 'AI responses may contain mistakes'}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modals */}
        </div>
    );
});

export default ChatInterface;
