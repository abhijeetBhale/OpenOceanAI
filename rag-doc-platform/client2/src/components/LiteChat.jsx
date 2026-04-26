import React, { useState, useRef, useEffect } from 'react';
import { askQuestion } from '../services/api';

function formatMessage(text) {
    if (!text) return [];
    
    const lines = text.split('\n');
    const formatted = [];
    let i = 0;
    
    while (i < lines.length) {
        const line = lines[i].trim();
        const nextLine = lines[i + 1]?.trim();
        
        if (!line) {
            formatted.push({ type: 'break' });
            i++;
            continue;
        }
        
        // Check for header: lines ending with colon that are followed by content
        // Examples: "Summary:", "Key Points:", "Recommendation:"
        if (line.match(/^[A-Za-z\s]+:$/) && !line.match(/^(https?:|\d+\.)/i) && (nextLine || i === 0)) {
            const headerText = line.replace(/:$/, '').trim();
            if (headerText.length > 0 && headerText.length < 50) {
                formatted.push({ type: 'section-header', text: headerText });
                i++;
                continue;
            }
        }
        
        // Check for numbered lists: "1." "2." "10." etc.
        const numberedMatch = line.match(/^(\d+)[.)]\s+(.+)/);
        if (numberedMatch) {
            formatted.push({ 
                type: 'numbered', 
                num: numberedMatch[1], 
                text: numberedMatch[2] 
            });
            i++;
            continue;
        }
        
        // Check for bullet points: "-", "•", "*" at start
        const bulletMatch = line.match(/^[-•*]\s+(.+)/);
        if (bulletMatch) {
            formatted.push({ type: 'bullet', text: bulletMatch[1] });
            i++;
            continue;
        }
        
        // Check for key-value patterns: "Key: Value"
        const kvMatch = line.match(/^([^:]+):\s*(.+)$/);
        if (kvMatch && kvMatch[1].length < 30) {
            formatted.push({ 
                type: 'key-value', 
                key: kvMatch[1].trim(), 
                value: kvMatch[2].trim() 
            });
            i++;
            continue;
        }
        
        // Check for sub-headers with multiple words (all caps or title case)
        if (line.match(/^[A-Z][A-Za-z\s]+$/) && line.length < 60 && line.length > 3 && (nextLine || i === 0)) {
            formatted.push({ type: 'sub-header', text: line });
            i++;
            continue;
        }
        
        // Default: regular paragraph text
        if (line) {
            formatted.push({ type: 'text', text: line });
        }
        i++;
    }
    
    return formatted;
}

function MessageContent({ content, role }) {
    const formatted = formatMessage(content);
    
    if (role === 'user') {
        return <p className="text-ivory whitespace-pre-wrap">{content}</p>;
    }
    
    return (
        <div className="space-y-1">
            {formatted.map((item, idx) => {
                switch (item.type) {
                    case 'break':
                        return <div key={idx} className="h-3" />;
                    
                    case 'section-header':
                        return (
                            <div key={idx} className="mt-3 first:mt-0">
                                <span className="text-base font-serif font-medium text-midnight">
                                    {item.text}
                                </span>
                            </div>
                        );
                    
                    case 'sub-header':
                        return (
                            <div key={idx} className="mt-4 first:mt-0 mb-1">
                                <span className="text-sm font-medium text-midnight uppercase tracking-wide">
                                    {item.text}
                                </span>
                            </div>
                        );
                    
                    case 'bullet':
                        return (
                            <div key={idx} className="flex items-start gap-3 ml-2">
                                <span className="text-terracotta mt-1.5 flex-shrink-0">•</span>
                                <span className="text-midnight">{item.text}</span>
                            </div>
                        );
                    
                    case 'numbered':
                        return (
                            <div key={idx} className="flex items-start gap-3 ml-2">
                                <span className="text-terracotta font-medium flex-shrink-0 min-w-[20px] mt-0.5">
                                    {item.num}.
                                </span>
                                <span className="text-midnight">{item.text}</span>
                            </div>
                        );
                    
                    case 'key-value':
                        return (
                            <div key={idx} className="flex flex-wrap gap-x-2 ml-2">
                                <span className="text-charcoal font-medium">{item.key}:</span>
                                <span className="text-midnight">{item.value}</span>
                            </div>
                        );
                    
                    case 'text':
                        return (
                            <p key={idx} className="text-midnight leading-relaxed">
                                {item.text}
                            </p>
                        );
                    
                    default:
                        return <p key={idx} className="text-midnight">{item.text}</p>;
                }
            })}
        </div>
    );
}

export default function LiteChat({ docInfo, initialMessages = [], onNewMessage }) {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async (text) => {
        const question = text || input;
        if (!question.trim()) return;
        setInput('');
        const userMsg = { role: 'user', content: question };
        setMessages((m) => [...m, userMsg]);
        onNewMessage?.(userMsg);
        setLoading(true);
        try {
            const resp = await askQuestion(question);
            const aiContent = resp.answer || JSON.stringify(resp, null, 2);
            const aiMsg = { role: 'assistant', content: aiContent };
            setMessages((m) => [...m, aiMsg]);
            onNewMessage?.(aiMsg);
        } catch (err) {
            const aiMsg = { role: 'assistant', content: err.response?.data?.error || err.message || 'Error getting response' };
            setMessages((m) => [...m, aiMsg]);
            onNewMessage?.(aiMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto w-full">
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-serif text-midnight mb-2">Chat with your document</h2>
                        <p className="text-stone">Ask questions about {docInfo?.name || 'the uploaded document'}</p>
                    </div>
                )}
                
                {messages.map((m, i) => (
                    <div 
                        key={i} 
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] rounded-generous p-5 ${
                            m.role === 'user' 
                            ? 'bg-terracotta text-ivory' 
                            : 'bg-ivory border border-borderCream shadow-whisper'
                        }`}>
                            <MessageContent content={m.content} role={m.role} />
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-ivory border border-borderCream rounded-generous p-4">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={endRef} />
            </div>

            <div className="sticky bottom-0 bg-parchment border-t border-borderCream p-4">
                <div className="max-w-4xl mx-auto flex gap-3">
                    <textarea
                        className="flex-1 bg-ivory border border-borderWarm rounded-comfortable px-4 py-3 text-midnight font-sans resize-none focus:outline-none focus:border-terracotta transition-colors"
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={loading ? 'Thinking...' : 'Ask a question about your document...'}
                        disabled={loading}
                    />
                    <button 
                        className="px-6 py-3 bg-terracotta text-ivory rounded-comfortable font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => send()} 
                        disabled={loading || !input.trim()}
                    >
                        {loading ? '...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}