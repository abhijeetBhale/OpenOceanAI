const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

export function chunkText(text) {
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  
  if (cleanedText.length <= CHUNK_SIZE) {
    return [cleanedText];
  }

  const chunks = [];
  let start = 0;

  while (start < cleanedText.length) {
    let end = start + CHUNK_SIZE;
    
    if (end < cleanedText.length) {
      const lastSpace = cleanedText.lastIndexOf(' ', end);
      const lastNewline = cleanedText.lastIndexOf('\n', end);
      const splitAt = Math.max(lastSpace, lastNewline);
      
      if (splitAt > start) {
        end = splitAt;
      }
    }

    const chunk = cleanedText.substring(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    start = end - CHUNK_OVERLAP;
    if (start >= cleanedText.length) break;
    
    while (start < cleanedText.length && cleanedText[start] === ' ') {
      start++;
    }
  }

  return chunks;
}

export default { chunkText };