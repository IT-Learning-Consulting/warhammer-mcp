# ProseMirrorInputConfig

```typescript
interface ProseMirrorInputConfig {
    collaborate: boolean;
    compact: boolean;
    documentUUID: string;
    enriched?: string;
    height?: number;
    toggled: boolean;
}
```

## Properties

- **collaborate**: `boolean`  
  Does this editor instance support collaborative editing?

- **compact**: `boolean`  
  Should the editor be presented in compact mode?

- **documentUUID**: `string`  
  A Document UUID. Required for collaborative editing.

- **enriched?**: `string` (optional)  
  If the editor is toggled, provide the enrichedHTML which is displayed while the editor is not active.

- **height?**: `number` (optional)  
  The height of the editor in pixels.

- **toggled**: `boolean`  
  Is this editor toggled (`true`) or always active (`false`)?

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)