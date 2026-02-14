/**
 * Lightweight markdown-to-HTML converter for simple content.
 *
 * Supports: headings (h1-h3), paragraphs, bold, italic, links,
 * unordered/ordered lists, horizontal rules, and inline code.
 *
 * For more complex markdown (MDX, code blocks, tables), consider
 * using remark/rehype or next-mdx-remote instead.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function processInline(text: string): string {
  let result = escapeHtml(text);

  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>');

  // Inline code: `code`
  result = result.replace(/`(.+?)`/g, '<code>$1</code>');

  // Links: [text](url)
  result = result.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return result;
}

/**
 * Convert a markdown string to an HTML string.
 */
export function markdownToHtml(markdown: string): string {
  const lines = markdown.split('\n');
  const htmlParts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (trimmed === '') {
      i++;
      continue;
    }

    // Horizontal rule: --- or *** or ___
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      htmlParts.push('<hr />');
      i++;
      continue;
    }

    // Headings: # h1, ## h2, ### h3
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = processInline(headingMatch[2]);
      htmlParts.push(`<h${level}>${text}</h${level}>`);
      i++;
      continue;
    }

    // Ordered list: 1. item
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, '');
        items.push(`<li>${processInline(itemText)}</li>`);
        i++;
      }
      htmlParts.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // Unordered list: - item or * item
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[-*]\s+/, '');
        items.push(`<li>${processInline(itemText)}</li>`);
        i++;
      }
      htmlParts.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Paragraph: collect consecutive non-empty, non-special lines
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i].trim());
      i++;
    }

    if (paragraphLines.length > 0) {
      const text = processInline(paragraphLines.join(' '));
      htmlParts.push(`<p>${text}</p>`);
    }
  }

  return htmlParts.join('\n');
}
