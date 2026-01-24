# FontFamilyDefinition | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface FontFamilyDefinition {
    editor: boolean;
    fonts: FontDefinition[];
}
```

## Properties

### editor

- **Type:** `boolean`  
- **Description:** Whether the font is available in the rich text editor. This will also enable it for notes and drawings.

### fonts

- **Type:** [`FontDefinition`](https://foundryvtt.com/api/types/CONFIG.FontDefinition.html)[]  
- **Description:** Individual font face definitions for this font family. If this is empty, the font family may only be loaded from the client's OS-installed fonts.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)