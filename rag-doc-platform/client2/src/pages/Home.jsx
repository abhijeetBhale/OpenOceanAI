import React, { useEffect, useState } from 'react';
import LiteNavbar from '../components/LiteNavbar';
import LiteUpload from '../components/LiteUpload';
import LiteChat from '../components/LiteChat';
import QuickSummary from '../components/QuickSummary';
import AtsScore from '../components/AtsScore';

const STORAGE_KEY = 'rag-chat-messages';
const DOC_INFO_KEY = 'rag-document-info';

function loadMessages() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

function loadDocInfo() {
    try {
        const saved = localStorage.getItem(DOC_INFO_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
}

function saveMessages(messages) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { }
}

function saveDocInfo(docInfo) {
    try {
        if (docInfo) localStorage.setItem(DOC_INFO_KEY, JSON.stringify(docInfo));
        else localStorage.removeItem(DOC_INFO_KEY);
    } catch { }
}

export default function Home() {
    const [mode, setMode] = useState('upload');
    const [docInfo, setDocInfo] = useState(() => loadDocInfo());
    const [messages, setMessages] = useState(() => loadMessages());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => saveMessages(messages), [messages]);
    useEffect(() => saveDocInfo(docInfo), [docInfo]);

    const handleUploadSuccess = (name, text, uploadedAt, category) => {
        const info = { name, text, uploadedAt, category };
        setDocInfo(info);
        setMessages([]);
        setMode('chat');
    };

    const handleNewMessage = (msg) => {
        setMessages((m) => [...m, msg]);
    };

    const handleClear = () => {
        setDocInfo(null);
        setMessages([]);
        setMode('upload');
    };

    return (
        <div className="min-h-screen bg-parchment">
            <LiteNavbar mode={mode} setMode={setMode} hasDocument={!!docInfo} />

            <main className={`mx-auto py-8 ${mode === 'chat' ? 'px-0' : 'px-4 sm:px-6 lg:px-8'}`}>
                {mode === 'chat' ? (
                    <LiteChat docInfo={docInfo} initialMessages={messages} onNewMessage={handleNewMessage} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl">
                        <div className="md:col-span-2">
                            {mode === 'upload' && (
                                <LiteUpload onUploadSuccess={handleUploadSuccess} setIsLoading={setIsLoading} />
                            )}

                            {mode === 'summary' && (
                                <div className="rounded-generous border border-borderCream bg-ivory p-6 shadow-whisper">
                                    <h2 className="text-feature-title font-serif text-midnight">Quick Summary</h2>
                                    <p className="mt-2 text-sm text-olive">{docInfo?.text?.slice(0, 500) || 'No document uploaded'}</p>
                                </div>
                            )}

                            {mode === 'ats' && (
                                <AtsScore docInfo={docInfo} />
                            )}
                        </div>

                        <aside className="md:col-span-1">
                            <QuickSummary docInfo={docInfo} onClear={handleClear} />
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}