// Minimal output sanitizer — strips script tags + on* event handlers from untrusted HTML.
// Not a full HTML parser; sufficient for journal content echoed back through MCP.
const SCRIPT_PATTERN = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
const EVENT_HANDLER_PATTERN = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;
const JAVASCRIPT_URL_PATTERN = /(?:href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi;

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';
  return String(input)
    .replace(SCRIPT_PATTERN, '')
    .replace(EVENT_HANDLER_PATTERN, '')
    .replace(JAVASCRIPT_URL_PATTERN, '');
}
