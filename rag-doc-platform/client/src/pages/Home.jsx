import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PanelLeftClose,
  PanelLeftOpen,
  FilePlus2,
  GitCompare,
  BriefcaseBusiness,
  Trash2,
  FileText,
  EyeOff,
  Badge,
  Menu,
  X,
} from 'lucide-react';
import DocumentUpload from '../components/DocumentUpload';
import ChatInterface from '../components/ChatInterface';
import CompareMode from '../components/CompareMode';
import JobsMode from '../components/JobsMode';
import ShareModal from '../components/ShareModal';
import ConfirmModal from '../components/ConfirmModal';
import PreviewModal from '../components/PreviewModal';
import { saveChatSession, loadChatSession } from '../services/api';

const STORAGE_KEY = 'rag-chat-messages';
const DOC_INFO_KEY = 'rag-document-info';

const CATEGORY_COLORS = {
  resume: { bg: 'bg-blue-900/30', text: 'text-blue-300', border: 'border-blue-700' },
  medical: { bg: 'bg-red-900/30', text: 'text-red-300', border: 'border-red-700' },
  financial: { bg: 'bg-green-900/30', text: 'text-green-300', border: 'border-green-700' },
  educational: { bg: 'bg-purple-900/30', text: 'text-purple-300', border: 'border-purple-700' },
  legal: { bg: 'bg-yellow-900/30', text: 'text-yellow-300', border: 'border-yellow-700' },
  general: { bg: 'bg-gray-900/30', text: 'text-gray-300', border: 'border-gray-700' },
};

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
  const [hasDocument, setHasDocument] = useState(() => loadDocInfo() !== null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('chat');
  const [docInfo, setDocInfo] = useState(() => loadDocInfo());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState(() => loadMessages());
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHighlight, setPreviewHighlight] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Persist messages to server when we have a session key
  useEffect(() => {
    const saveToServer = async () => {
      if (!docInfo) return;
      const key = docInfo.serverSessionKey;
      try {
        if (key) {
          await saveChatSession(key, docInfo, messages);
        }
      } catch (e) {
        console.error('Failed to save chat session to server:', e.message || e);
      }
    };

    saveToServer();
  }, [messages]);

  const handleUploadSuccess = (docName, docText, uploadedAt, category, fileUrl) => {
    const info = { name: docName, text: docText, uploadedAt, category, fileUrl };
    setDocInfo(info);
    saveDocInfo(info);
    setHasDocument(true);
    // Create a server-side chat session for this document (best-effort)
    try {
      saveChatSession(null, info, []).then((resp) => {
        if (resp?.sessionKey) {
          const updated = { ...info, serverSessionKey: resp.sessionKey };
          setDocInfo(updated);
          saveDocInfo(updated);
        }
      }).catch((e) => console.error('create session failed', e));
    } catch (e) {
      console.error('create session error', e);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const generateShareContent = () => {
    let content = `# Chat Conversation\n\nDate: ${new Date().toLocaleString()}\n\n`;
    if (docInfo) {
      content += `Document: ${docInfo.name}\nCategory: ${docInfo.category}\nDocument Preview: ${docInfo.text?.slice(0, 300)}...\n\n---\n\n`;
    }
    messages.forEach((msg) => {
      content += `${msg.role === 'user' ? '**User**' : '**Assistant**'}:\n${msg.content}\n\n`;
    });
    return content;
  };

  const handleShare = () => {
    if (messages.length === 0) return;
    setShareModalOpen(true);
  };

  const openPreview = (highlight) => {
    console.log('openPreview called (Home)', { len: (highlight || '').length });
    setPreviewHighlight(highlight || '');
    setShowPreviewModal(true);
  };

  // Load server-side messages if a session exists
  useEffect(() => {
    if (!docInfo?.serverSessionKey) return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await loadChatSession(docInfo.serverSessionKey);
        if (cancelled) return;
        if (resp?.messages && resp.messages.length > 0) {
          setMessages(resp.messages);
        }
        if (resp?.docInfo) {
          const merged = { ...docInfo, ...resp.docInfo };
          setDocInfo(merged);
          saveDocInfo(merged);
        }
      } catch (e) {
        console.error('Failed to load chat session:', e.message || e);
      }
    })();
    return () => { cancelled = true; };
  }, [docInfo?.serverSessionKey]);

  const showConfirmModalWithAction = (action) => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const handleNewDocument = () => {
    if (hasDocument) {
      showConfirmModalWithAction('new');
    }
  };

  const confirmNewDocument = () => {
    setHasDocument(false);
    setDocInfo(null);
    saveDocInfo(null);
    handleClearChat();
    setShowConfirmModal(false);
    setMode('chat');
  };

  const sidebarActionClass = (isActive = false, tone = 'default', compact = false) => {
    const toneClasses = {
      default: isActive
        ? 'border-zinc-600 bg-zinc-100 text-zinc-900 shadow-[0_10px_30px_rgba(255,255,255,0.08)]'
        : 'border-zinc-800 bg-[#151515] text-zinc-300 hover:border-zinc-600 hover:bg-[#1b1b1b] hover:text-zinc-100',
      primary: 'border-zinc-600 bg-zinc-100 text-zinc-900 hover:bg-white',
      danger: 'border-red-900/60 bg-[#1b1010] text-red-200 hover:border-red-700 hover:bg-[#241313]',
    };

    const sizeClasses = compact
      ? 'h-11 w-11 rounded-2xl px-0 py-0'
      : 'w-full rounded-2xl px-4 py-3';

    return `inline-flex items-center border text-sm font-medium transition ${sizeClasses} ${toneClasses[tone]}`;
  };

  const sidebarActions = [
    {
      key: 'new',
      label: 'New',
      icon: FilePlus2,
      onClick: handleNewDocument,
      tone: 'default',
      disabled: false,
      active: false,
    },
    {
      key: 'compare',
      label: 'Compare',
      icon: GitCompare,
      onClick: () => setMode('compare'),
      tone: 'default',
      disabled: false,
      active: mode === 'compare',
    },
    {
      key: 'jobs',
      label: 'Jobs',
      icon: BriefcaseBusiness,
      onClick: () => setMode('jobs'),
      tone: 'default',
      disabled: false,
      active: mode === 'jobs',
    },
    {
      key: 'clear',
      label: 'Clear',
      icon: Trash2,
      onClick: () => showConfirmModalWithAction('clear'),
      tone: 'danger',
      disabled: false,
      active: false,
    },
  ];

  const categoryColors = CATEGORY_COLORS[docInfo?.category] || CATEGORY_COLORS.general;

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a]">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 296 : 88 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="flex flex-col overflow-hidden border-r border-zinc-800 bg-[#111]"
        >
          {/* Toggle Button */}
          <div className={`flex items-center border-b border-zinc-800 ${sidebarOpen ? 'justify-between p-3' : 'justify-center p-3'}`}>
            {sidebarOpen && (
              <h1 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                RAG Scanner
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-[#171717] text-zinc-400 transition hover:border-zinc-500 hover:bg-[#1d1d1d] hover:text-zinc-100"
              title={sidebarOpen ? 'Collapse' : 'Expand'}
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
          </div>

          {/* Document Info - Clickable for Preview */}
          {hasDocument && (
            <div
              className={`cursor-pointer border-b border-zinc-800 ${sidebarOpen ? 'p-4' : 'px-3 py-4'} hover:bg-[#1a1a1a] transition`}
              onClick={() => setShowPreviewModal(true)}
              title="Click to preview document"
            >
              <div className={`flex ${sidebarOpen ? 'items-start justify-between gap-3' : 'flex-col items-center gap-3'}`}>
                <div
                  className={`inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-[#1a1a1a] ${sidebarOpen ? 'h-14 w-14' : 'h-11 w-11'
                    }`}
                >
                  <FileText className={`${sidebarOpen ? 'h-6 w-6' : 'h-5 w-5'} text-zinc-300`} />
                </div>
                {sidebarOpen ? (
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-zinc-200">{docInfo?.name}</h2>
                    {docInfo?.uploadedAt && (
                      <p className="mt-1 text-xs text-zinc-500">{new Date(docInfo.uploadedAt).toLocaleDateString()}</p>
                    )}
                    {docInfo?.category && (
                      <div className={`mt-2 inline-flex rounded-full px-2.5 py-1 border ${categoryColors.border} ${categoryColors.bg}`}>
                        <span className={`text-[10px] font-medium uppercase tracking-[0.16em] ${categoryColors.text}`}>
                          {docInfo.category}
                        </span>
                      </div>
                    )}
                    <p className="mt-2 text-xs text-zinc-600">Click to preview</p>
                  </div>
                ) : (
                  <p className="mt-2 text-[10px] text-zinc-600">Preview</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {hasDocument && (
            <div className={`border-b border-zinc-800 ${sidebarOpen ? 'p-4' : 'px-3 py-4'}`}>
              <div className={`space-y-2 ${sidebarOpen ? '' : 'flex flex-col items-center'}`}>
                {sidebarActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.key}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      title={!sidebarOpen ? action.label : undefined}
                      className={`${sidebarActionClass(action.active, action.tone, !sidebarOpen)} ${action.disabled ? 'cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-600 hover:border-zinc-800 hover:bg-zinc-900 hover:text-zinc-600' : ''
                        } ${sidebarOpen ? 'gap-3 justify-start' : 'justify-center'}`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {sidebarOpen ? <span>{action.label}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preview Section */}
          <div className={`flex-1 overflow-y-auto ${sidebarOpen ? 'p-4' : 'px-3 py-4'}`}>
            {hasDocument && sidebarOpen ? (
              <>
                {docInfo?.text && (
                  <div className="rounded-2xl border border-zinc-800 bg-[#151515] p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">Preview</p>
                    <p className="line-clamp-6 text-sm leading-6 text-zinc-400">{docInfo.text}...</p>
                  </div>
                )}
              </>
            ) : hasDocument ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-px w-8 bg-zinc-800" />
                <p className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500">
                  Document
                </p>
              </div>
            ) : sidebarOpen ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                <FileText className="h-12 w-12 text-zinc-600" />
                <p className="text-sm text-zinc-400">Upload a document to get started</p>
              </div>
            ) : null}
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {!hasDocument ? (
            <div className="flex flex-1 items-center justify-center">
              <DocumentUpload
                onUploadSuccess={(docName, docText, uploadedAt, category, fileUrl) => handleUploadSuccess(docName, docText, uploadedAt, category, fileUrl)}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>
          ) : mode === 'compare' ? (
            <CompareMode doc1Name={docInfo?.name} doc1Text={docInfo?.text} onBack={() => setMode('chat')} />
          ) : mode === 'jobs' ? (
            <JobsMode docInfo={docInfo} onBack={() => setMode('chat')} />
          ) : (
            <ChatInterface
              ref={chatRef}
              messages={messages}
              setMessages={setMessages}
              docInfo={docInfo}
              onNewDocument={handleNewDocument}
              onShare={handleShare}
              openPreview={openPreview}
            />
          )}
        </main>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        chatContent={generateShareContent()}
        docInfo={docInfo}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          if (confirmAction === 'new') {
            confirmNewDocument();
          } else if (confirmAction === 'clear') {
            handleClearChat();
          }
          setConfirmAction(null);
        }}
        title={confirmAction === 'new' ? 'Start New Document?' : 'Clear Chat?'}
        message={confirmAction === 'new' ? 'This will clear your current document and chat history. This action cannot be undone.' : 'This will delete all messages. This action cannot be undone.'}
        confirmText={confirmAction === 'new' ? 'Start Fresh' : 'Clear Chat'}
      />

      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => { setShowPreviewModal(false); setPreviewHighlight(''); }}
        docInfo={docInfo}
        highlight={previewHighlight}
      />

    </div>
  );
}
