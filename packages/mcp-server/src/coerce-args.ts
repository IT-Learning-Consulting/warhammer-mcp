// BUG-047: Claude Code's MCP client ships booleans / arrays / numbers as JSON-encoded
// strings. Each tool's Zod parser expects the native JSON type and rejects with
// "expected boolean, received string". Coerce per the tool's declared inputSchema
// before dispatch so Zod sees the right shape. Unknown / untyped props pass through
// unchanged — downstream Zod will still catch real errors.
export function coerceArgsBySchema(schema: any, args: any): any {
  if (!schema || schema.type !== 'object' || !schema.properties || !args || typeof args !== 'object' || Array.isArray(args)) {
    return args;
  }
  const out: any = { ...args };
  for (const [key, propSchemaRaw] of Object.entries(schema.properties as Record<string, any>)) {
    if (!(key in out)) continue;
    const propSchema = propSchemaRaw as any;
    const t = propSchema?.type;
    const val = out[key];
    if (typeof val === 'string' && t && t !== 'string') {
      if (t === 'boolean') {
        if (val === 'true') out[key] = true;
        else if (val === 'false') out[key] = false;
      } else if (t === 'number' || t === 'integer') {
        const n = Number(val);
        if (!Number.isNaN(n) && val.trim() !== '') out[key] = n;
      } else if (t === 'array' || t === 'object') {
        try {
          const parsed = JSON.parse(val);
          out[key] = parsed;
          if (t === 'object' && propSchema.properties) {
            out[key] = coerceArgsBySchema(propSchema, parsed);
          } else if (t === 'array' && propSchema.items && Array.isArray(parsed)) {
            out[key] = parsed.map((item: any) => coerceArgsBySchema(propSchema.items, item));
          }
        } catch {
          // leave as-is; Zod will produce a readable error downstream
        }
      }
    } else if (t === 'object' && propSchema.properties && val && typeof val === 'object' && !Array.isArray(val)) {
      out[key] = coerceArgsBySchema(propSchema, val);
    } else if (t === 'array' && propSchema.items && Array.isArray(val)) {
      out[key] = val.map((item: any) => coerceArgsBySchema(propSchema.items, item));
    }
  }
  return out;
}
