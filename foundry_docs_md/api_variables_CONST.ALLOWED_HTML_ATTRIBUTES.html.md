# ALLOWED_HTML_ATTRIBUTES

**Type:** `Readonly<{ ... }>`

The list of allowed attributes in HTML elements.

```typescript
const ALLOWED_HTML_ATTRIBUTES: Readonly<{
  "*": readonly [
    "class",
    "data-*",
    "id",
    "title",
    "style",
    "draggable",
    "aria-*",
    "tabindex",
    "dir",
    "hidden",
    "inert",
    "role",
    "is",
    "lang",
    "popover",
    "autocapitalize",
    "autocorrect",
    "autofocus",
    "contenteditable",
    "spellcheck",
    "translate",
  ];
  a: readonly ["href", "name", "target", "rel"];
  area: readonly ["alt", "coords", "href", "rel", "shape", "target"];
  audio: readonly ["controls", "loop", "muted", "src", "autoplay"];
  blockquote: readonly ["cite"];
  button: readonly ["disabled", "name", "type", "value"];
  "code-mirror": readonly [
    "disabled",
    "name",
    "value",
    "placeholder",
    "readonly",
    "required",
    "language",
    "indent",
    "nowrap",
  ];
  col: readonly ["span"];
  colgroup: readonly ["span"];
  "color-picker": readonly [
    "disabled",
    "name",
    "value",
    "placeholder",
    "readonly",
    "required",
  ];
  details: readonly ["open"];
  "document-embed": readonly ["uuid"];
  "document-tags": readonly [
    "disabled",
    "name",
    "value",
    "placeholder",
    "readonly",
    "required",
    "type",
    "single",
    "max",
  ];
  "enriched-content": readonly ["enricher"];
  fieldset: readonly ["disabled"];
  "file-picker": readonly [
    "disabled",
    "name",
    "value",
    "placeholder",
    "readonly",
    "required",
    "type",
    "noupload",
  ];
  form: readonly ["name"];
  "hue-slider": readonly [
    "disabled",
    "name",
    "value",
    "readonly",
    "required",
  ];
  iframe: readonly [
    "src",
    "srcdoc",
    "name",
    "height",
    "width",
    "loading",
    "sandbox",
  ];
  img: readonly [
    "height",
    "src",
    "width",
    "usemap",
    "sizes",
    "srcset",
    "alt",
  ];
  input: readonly [
    "checked",
    "disabled",
    "name",
    "value",
    "placeholder",
    "type",
    "alt",
    "height",
    "list",
    "max",
    "min",
    "readonly",
    "size",
    "src",
    "step",
    "width",
    "required",
  ];
  label: readonly ["for"];
  li: readonly ["value"];
  map: readonly ["name"];
  meter: readonly ["value", "min", "max", "low", "high", "optimum"];
  "multi-checkbox": readonly ["disabled", "name", "required"];
  "multi-select": readonly ["disabled", "name", "required"];
  ol: readonly ["reversed", "start", "type"];
  optgroup: readonly ["disabled", "label"];
  option: readonly ["disabled", "selected", "label", "value"];
  output: readonly ["for", "form", "name"];
  progress: readonly ["max", "value"];
  "prose-mirror": readonly [
    "disabled",
    "name",
    "value",
    "placeholder",
    "readonly",
    "required",
    "toggled",
    "open",
  ];
  "range-picker": readonly [
    "disabled",
    "name",
    "value",
    "placeholder",
    "readonly",
    "min",
    "max",
    "step",
  ];
  select: readonly ["name", "disabled", "multiple", "size", "required"];
  source: readonly ["media", "sizes", "src", "srcset", "type"];
  "string-tags": readonly [
    "disabled",
    "name",
    "value",
    "placeholder",
    "readonly",
    "required",
  ];
  table: readonly ["border"];
  td: readonly ["colspan", "headers", "rowspan"];
  textarea: readonly [
    "rows",
    "cols",
    "disabled",
    "name",
    "readonly",
    "wrap",
    "required",
  ];
  th: readonly ["abbr", "colspan", "headers", "rowspan", "scope", "sorted"];
  time: readonly ["datetime"];
  track: readonly ["default", "kind", "label", "src", "srclang"];
  video: readonly [
    "controls",
    "height",
    "width",
    "loop",
    "muted",
    "poster",
    "src",
    "autoplay",
  ];
}>;
```

---

Refer to the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html) for more details.