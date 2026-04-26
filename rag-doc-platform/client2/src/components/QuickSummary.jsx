import React from 'react';

export default function QuickSummary({ docInfo, onClear }) {
    if (!docInfo) {
        return (
            <div className="rounded-generous border border-borderCream bg-ivory p-4 shadow-whisper">
                <p className="text-sm text-stone font-sans">Upload a document to see a quick summary here.</p>
            </div>
        );
    }

    const text = docInfo.text || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.length;

    return (
        <div className="rounded-generous border border-borderCream bg-ivory p-4 shadow-whisper">
            <h3 className="text-feature-title font-serif text-midnight">Document Summary</h3>
            <p className="text-sm text-olive mt-2 break-words font-sans">{docInfo.name}</p>
            <div className="mt-3 grid gap-2">
                <div className="flex items-center justify-between text-sm text-olive font-sans">
                    <span>Category</span>
                    <span className="font-medium text-charcoal">{docInfo.category || 'general'}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-olive font-sans">
                    <span>Words</span>
                    <span className="font-medium text-charcoal">{words.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-olive font-sans">
                    <span>Characters</span>
                    <span className="font-medium text-charcoal">{chars.toLocaleString()}</span>
                </div>
            </div>

            <div className="mt-4">
                <button 
                    onClick={onClear} 
                    className="w-full rounded-comfortable bg-terracotta text-ivory px-3 py-2 text-sm font-medium font-sans hover:bg-terracotta-dark transition-colors"
                >
                    Start New
                </button>
            </div>
        </div>
    );
}