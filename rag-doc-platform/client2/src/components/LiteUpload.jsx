import React, { useRef, useState } from 'react';
import { uploadDocument } from '../services/api';

export default function LiteUpload({ onUploadSuccess, setIsLoading }) {
    const inputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [message, setMessage] = useState('');

    const handleFile = async (file) => {
        if (!file) return;
        const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setMessage('Please upload a PDF or image file');
            return;
        }

        setMessage('Uploading...');
        setIsLoading?.(true);
        try {
            const res = await uploadDocument(file);
            setMessage('Upload complete');
            onUploadSuccess(res.documentName, res.documentText, res.uploadedAt, res.category);
        } catch (err) {
            setMessage(err.response?.data?.error || err.message || 'Upload failed');
        } finally {
            setIsLoading?.(false);
        }
    };

    const onDrop = async (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="mx-auto max-w-3xl">
            <div
                className={`rounded-generous border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                    dragActive 
                    ? 'border-terracotta bg-ivory shadow-ring-terracotta' 
                    : 'border-borderWarm bg-ivory hover:border-terracotta'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input ref={inputRef} type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFile(e.target.files[0])} />
                <div className="text-charcoal text-lg font-medium font-sans">
                    <span className="text-terracotta mr-2">+</span>Drop a document here
                </div>
                <div className="mt-2 text-sm text-stone">PDF, PNG, JPG — or click to choose a file</div>
                {message && (
                    <div className="mt-4 text-sm font-medium" style={{ color: message.includes('failed') ? '#b53333' : '#c96442' }}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}