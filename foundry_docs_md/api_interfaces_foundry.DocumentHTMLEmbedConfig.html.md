# DocumentHTMLEmbedConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DocumentHTMLEmbedConfig {
    caption?: boolean;
    captionPosition?: string;
    cite?: boolean;
    classes?: string;
    inline?: boolean;
    label?: string;
    values: string[];
}
```

## Properties

### Optional

#### caption

**Type:** `boolean`

Whether to include a caption. The caption will depend on the Document being embedded, but if an explicit label is provided, that will always be used as the caption. This option is ignored if the Document is inlined.

#### captionPosition

**Type:** `string`

Controls whether the caption is rendered above or below the embedded content.

#### cite

**Type:** `boolean`

Whether to include a content link to the original Document as a citation. This option is ignored if the Document is inlined.

#### classes

**Type:** `string`

Classes to attach to the outermost element.

#### inline

**Type:** `boolean`

By default Documents are embedded inside a figure element. If this option is passed, the embed content will instead be included as part of the rest of the content flow, but still wrapped in a section tag for styling purposes.

#### label

**Type:** `string`

The label.

### Required

#### values

**Type:** `string[]`

Any strings that did not have a key name associated with them.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)