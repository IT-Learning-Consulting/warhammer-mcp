import { ZodError } from 'zod';

const MAX_LEN = 800;
const PATH_PATTERNS = [
  /[A-Z]:\\[^:\s]+/g,
  /\/(?:home|Users|root|var|tmp)\/[^:\s]+/g,
];

function formatZodIssues(issues: Array<{ path?: Array<string | number>; message?: string; code?: string }>): string {
  return issues
    .map((iss) => {
      const path = Array.isArray(iss.path) && iss.path.length ? iss.path.join('.') : '(root)';
      return `${path}: ${iss.message ?? iss.code ?? 'invalid'}`;
    })
    .join('; ');
}

export function scrubError(e: unknown): string {
  let raw: string;
  if (e instanceof ZodError) {
    raw = `ZodError: ${formatZodIssues(e.errors as any)}`;
  } else if (e instanceof Error) {
    raw = e.message;
  } else if (typeof e === 'string') {
    raw = e;
  } else {
    raw = 'Unknown error occurred';
  }

  // BUG-065: Foundry-side handlers re-wrap ZodErrors as `new Error(\`Failed: ${zodErr.message}\`)`,
  // where the inner message is multi-line JSON (`[\n  { ... }\n]`). The old `split('\n')[0]`
  // truncated the body to just `[`. Collapse internal whitespace runs to a single space so the
  // Zod issues array stays readable; rely on MAX_LEN below to cap noisy stack-like content.
  let msg = raw.replace(/\s*\n+\s*/g, ' ').trim();

  for (const pattern of PATH_PATTERNS) {
    msg = msg.replace(pattern, '<path>');
  }
  if (msg.length > MAX_LEN) msg = msg.slice(0, MAX_LEN) + '… [truncated]';
  return msg;
}
