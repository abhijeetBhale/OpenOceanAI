import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { uploadDocument } from '../services/api';

export default function DocumentUpload({ onUploadSuccess, isLoading, setIsLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setMessage('Invalid file type. Please upload PDF or image files.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await uploadDocument(file);
      setMessage(`Success! ${result.chunksCreated} chunks created. Document detected as: ${result.category}`);
      onUploadSuccess(result.documentName, result.documentText, result.uploadedAt, result.category, result.fileUrl);
    } catch (error) {
      setMessage(error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-2xl"
    >
      <div className="rounded-[32px] border border-zinc-800 bg-gradient-to-b from-[#151515] to-[#0d0d0d] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div
          className={`rounded-[28px] border border-dashed p-10 text-center transition-all ${dragActive
              ? 'border-zinc-500 bg-[#171717]'
              : 'border-zinc-800 bg-[#111] hover:border-zinc-600 hover:bg-[#151515]'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,image/*"
            onChange={handleChange}
            disabled={isLoading}
          />

          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="loading-spinner h-10 w-10"></div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Processing</p>
              <p className="text-zinc-300">Reading and chunking your document...</p>
            </div>
          ) : (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-zinc-700 bg-[#1a1a1a] text-sm font-semibold uppercase tracking-[0.24em] text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                Upload
              </div>
              <p className="mt-6 text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
                Document Intake
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-zinc-100">Drop your document here</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                Upload a PDF or image to generate searchable chunks and start asking questions immediately.
              </p>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-zinc-600">
                Supports PDF, PNG, JPG, JPEG
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={onButtonClick}
                  className="rounded-2xl bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-white"
                >
                  Select File
                </button>
                <div className="rounded-2xl border border-zinc-800 bg-[#151515] px-4 py-3 text-sm text-zinc-500">
                  or drag and drop anywhere inside this panel
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-4 rounded-2xl border px-4 py-3 text-center text-sm ${message.includes('Success')
              ? 'border-emerald-900/60 bg-[#0f1712] text-emerald-300'
              : 'border-red-900/60 bg-[#1b1010] text-red-300'
            }`}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}
