let currentDocument = {
  text: null,
  name: null,
  uploadedAt: null,
  category: null,
  fileUrl: null,
};

export function storeDocument(text, name, category = null, fileUrl = null) {
  currentDocument = {
    text,
    name,
    uploadedAt: new Date(),
    category,
    fileUrl,
  };
}

export function getDocument() {
  return currentDocument;
}

export function clearDocument() {
  currentDocument = {
    text: null,
    name: null,
    uploadedAt: null,
    category: null,
    fileUrl: null,
  };
}

export default { storeDocument, getDocument, clearDocument };
