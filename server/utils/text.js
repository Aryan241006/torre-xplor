/**
 * Capitalize the first letter of each sentence.
 */
export const capitalizeText = (text) => {
  if (!text || typeof text !== 'string') return text || null;

  return text
    .split('. ')
    .map((sentence) => {
      const trimmed = sentence.trim();
      return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : trimmed;
    })
    .join('. ');
};

const HTML_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/**
 * Torre returns some text HTML-escaped (e.g. "I&#x27;m"); turn it back into plain text.
 */
export const decodeHtmlEntities = (text) => {
  if (!text || typeof text !== 'string') return text || null;
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const value = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isNaN(value) ? match : String.fromCodePoint(value);
    }
    return HTML_ENTITIES[code.toLowerCase()] ?? match;
  });
};
