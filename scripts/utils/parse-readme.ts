/**
 * Extract the first paragraph from README content
 * Returns text until first blank line or 500 characters, whichever comes first
 */
export function extractFirstParagraph(readme: string): string {
  if (!readme || readme.trim().length === 0) {
    return '';
  }

  // Split into lines
  const lines = readme.split('\n');

  let paragraph = '';
  let foundContent = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines at the start
    if (!foundContent && trimmed.length === 0) {
      continue;
    }

    // Skip markdown headers
    if (trimmed.startsWith('#')) {
      continue;
    }

    // Skip horizontal rules
    if (/^[-*_]{3,}$/.test(trimmed)) {
      continue;
    }

    // If we hit an empty line after finding content, we're done
    if (foundContent && trimmed.length === 0) {
      break;
    }

    // Add line to paragraph
    if (trimmed.length > 0) {
      foundContent = true;
      paragraph += (paragraph.length > 0 ? ' ' : '') + trimmed;

      // Stop if we've reached 500 characters
      if (paragraph.length >= 500) {
        paragraph = paragraph.substring(0, 500);
        break;
      }
    }
  }

  return stripMarkdown(paragraph).trim();
}

/**
 * Strip Markdown formatting from text
 * Removes: headers, links, bold, italic, code blocks, inline code
 */
export function stripMarkdown(text: string): string {
  let cleaned = text;

  // Remove inline code
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Remove bold and italic
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');

  // Remove links [text](url) → text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove images ![alt](url) → alt
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Remove headers
  cleaned = cleaned.replace(/^#+\s+/gm, '');

  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');

  return cleaned.trim();
}
