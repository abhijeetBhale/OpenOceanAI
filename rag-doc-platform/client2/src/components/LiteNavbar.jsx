import React from 'react';

export default function LiteNavbar({ mode, setMode, hasDocument }) {
    return (
        <header className="w-full bg-ivory border-b border-borderCream">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-2xl font-serif font-medium text-midnight">
                            <span className="text-terracotta">Auto</span>Docs
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-sm text-olive">
                            <span className="px-2 py-0.5 rounded-subtle-round bg-sand text-charcoal">RAG</span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-2">
                        <button
                            onClick={() => setMode('chat')}
                            className={`px-3 py-1.5 rounded-comfortable text-sm font-medium transition-all ${
                                mode === 'chat' 
                                ? 'bg-terracotta text-ivory' 
                                : 'text-charcoal hover:bg-sand'
                            }`}
                        >
                            Chat
                        </button>
                        <button
                            onClick={() => setMode('upload')}
                            className={`px-3 py-1.5 rounded-comfortable text-sm font-medium transition-all ${
                                mode === 'upload' 
                                ? 'bg-terracotta text-ivory' 
                                : 'text-charcoal hover:bg-sand'
                            }`}
                        >
                            Upload
                        </button>
                        <button
                            onClick={() => setMode('summary')}
                            className={`px-3 py-1.5 rounded-comfortable text-sm font-medium transition-all ${
                                mode === 'summary' 
                                ? 'bg-terracotta text-ivory' 
                                : 'text-charcoal hover:bg-sand'
                            }`}
                        >
                            Summary
                        </button>
                        <button
                            onClick={() => setMode('ats')}
                            className={`px-3 py-1.5 rounded-comfortable text-sm font-medium transition-all ${
                                mode === 'ats' 
                                ? 'bg-terracotta text-ivory' 
                                : 'text-charcoal hover:bg-sand'
                            }`}
                        >
                            ATS
                        </button>
                    </nav>

                    <div className="flex items-center gap-3">
                        {hasDocument ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-sm font-medium text-charcoal">
                                <span className="w-2 h-2 rounded-full bg-terracotta"></span>
                                Document Loaded
                            </span>
                        ) : (
                            <span className="text-sm text-stone">No document</span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}