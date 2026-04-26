import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#1a1a1a] border border-zinc-700 rounded-xl shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
            </div>
          </div>

          <p className="text-zinc-400 mb-6">{message}</p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              {cancelText || 'Cancel'}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              {confirmText || 'Continue'}
            </button>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}