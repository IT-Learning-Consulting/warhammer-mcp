import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../utils/sanitize-html.js';

describe('sanitizeHtml', () => {
  it('strips <script> tags', () => {
    expect(sanitizeHtml('<p>ok</p><script>alert(1)</script>')).toBe('<p>ok</p>');
  });
  it('strips on* event handlers', () => {
    expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).toBe('<img src="x">');
  });
  it('strips javascript: urls', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe('<a >x</a>');
  });
  it('handles null/undefined', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });
});
