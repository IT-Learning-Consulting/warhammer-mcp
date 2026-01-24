# TextEditor | Foundry Virtual Tabletop - API Documentation - Version 13

A collection of helper functions and utility methods related to the rich text editor.

---

## Accessors

### implementation
```typescript
get implementation(): typeof applications.ux.TextEditor
```
Retrieve the configured TextEditor implementation.

**Returns:**  
`typeof applications.ux.TextEditor`

---

## Methods

### activateListeners
```typescript
activateListeners(): void
```
Activate interaction listeners for the interior content of the editor frame.

**Returns:**  
`void`

---

### create
```typescript
create(
    options?: { engine?: string },
    content?: string,
): Promise<ProseMirrorEditor | Editor>
```
Create a Rich Text Editor. The current implementation uses TinyMCE.

**Parameters:**

- **options?**: `{ engine?: string }` = `{}`  
  Configuration options provided to the Editor init  
  - *engine?*: `string`  
    Which rich text editor engine to use, `"tinymce"` or `"prosemirror"`. TinyMCE is deprecated and will be removed in a later version.

- **content?**: `string` = `""`  
  Initial HTML or text content to populate the editor with

**Returns:**  
`Promise<ProseMirrorEditor | Editor>`  
The editor instance.

---

### createAnchor
```typescript
createAnchor(options?: Partial<EnrichmentAnchorOptions>): HTMLAnchorElement
```
Helper method to create an anchor element.

**Parameters:**

- **options?**: `Partial<EnrichmentAnchorOptions>` = `{}`  
  Options to configure the anchor's construction.

**Returns:**  
`HTMLAnchorElement`

---

### decodeHTML
```typescript
decodeHTML(html: string): string
```
Safely decode an HTML string, removing invalid tags and converting entities back to unicode characters.

**Parameters:**

- **html**: `string`  
  The original encoded HTML string.

**Returns:**  
`string`  
The decoded unicode string.

---

### enrichHTML
```typescript
enrichHTML(content: string, options?: EnrichmentOptions): Promise<string>
```
Enrich HTML content by replacing or augmenting components of it.

**Parameters:**

- **content**: `string`  
  The original HTML content (as a string).

- **options?**: `EnrichmentOptions` = `{}`  
  Additional options which configure how HTML is enriched.

**Returns:**  
`Promise<string>`  
The enriched HTML content.

---

### getContentLink
```typescript
getContentLink(
    eventData: object,
    options?: { label?: string; relativeTo?: any },
): Promise<null | string>
```
Given a Drop event, returns a Content link if possible such as `"@Actor[ABC123]"`, else `null`.

**Parameters:**

- **eventData**: `object`  
  The parsed object of data provided by the transfer event.

- **options?**: `{ label?: string; relativeTo?: any }` = `{}`  
  Additional options to configure link creation.  
  - **label?**: `string`  
    A custom label to use instead of the document's name.  
  - **relativeTo?**: `any`  
    A document to generate the link relative to.

**Returns:**  
`Promise<null | string>`

---

### getDragEventData
```typescript
getDragEventData(event: DragEvent): object
```
Extract JSON data from a drag/drop event.

**Parameters:**

- **event**: `DragEvent`  
  The drag event which contains JSON data.

**Returns:**  
`object`  
The extracted JSON data. The object will be empty if the DragEvent did not contain JSON-parseable data.

---

### previewHTML
```typescript
previewHTML(content: string, length?: number): string
```
Preview an HTML fragment by constructing a substring of a given length from its inner text.

**Parameters:**

- **content**: `string`  
  The raw HTML to preview.

- **length?**: `number` = `250`  
  The desired length.

**Returns:**  
`string`  
The previewed HTML.

---

### truncateHTML
```typescript
truncateHTML(html: HTMLElement): HTMLElement
```
Sanitises an HTML fragment and removes any non-paragraph-style text.

**Parameters:**

- **html**: `HTMLElement`  
  The root HTML element.

**Returns:**  
`HTMLElement`

---

### truncateText
```typescript
truncateText(
    text: string,
    options?: {
        maxLength?: number;
        splitWords?: boolean;
        suffix?: null | string;
    },
): string
```
Truncate a fragment of text to a maximum number of characters.

**Parameters:**

- **text**: `string`  
  The original text fragment that should be truncated to a maximum length.

- **options?**: `{ maxLength?: number; splitWords?: boolean; suffix?: null | string; }` = `{}`  
  Options which affect the behavior of text truncation.  
  - **maxLength?**: `number`  
    The maximum allowed length of the truncated string.  
  - **splitWords?**: `boolean`  
    Whether to truncate by splitting on white space (if true) or breaking words.  
  - **suffix?**: `null | string`  
    A suffix string to append to denote that the text was truncated.

**Returns:**  
`string`  
The truncated text string.

---

### _applyCustomEnrichers
```typescript
protected static _applyCustomEnrichers(
    config: TextEditorEnricherConfig,
    text: Text[],
    options?: EnrichmentOptions,
): Promise<boolean>
```
Match any custom registered regex patterns and apply their replacements.

**Parameters:**

- **config**: `TextEditorEnricherConfig`  
  The custom enricher configuration.

- **text**: `Text[]`  
  The existing text content.

- **options?**: `EnrichmentOptions`  
  Options provided to customize text enrichment.

**Returns:**  
`Promise<boolean>`  
Whether any replacements were made, requiring the text nodes to be updated.

---

### _createContentLink
```typescript
protected static _createContentLink(
    match: RegExpMatchArray,
    options?: EnrichmentOptions,
): Promise<HTMLAnchorElement>
```
Create a dynamic document link from a regular expression match.

**Parameters:**

- **match**: `RegExpMatchArray`  
  The regular expression match.

- **options?**: `EnrichmentOptions` = `{}`  
  Additional options to configure enrichment behaviour.  
  - **custom?**: `boolean`  
    Apply custom enrichers?  
  - **documents?**: `boolean`  
    Replace dynamic document links?  
  - **embeds?**: `boolean`  
    Replace embedded content?  
  - **links?**: `boolean`  
    Replace hyperlink content?  
  - **relativeTo?**: `any`  
    A document to resolve relative UUIDs against.  
  - **rollData?**: `object | Function`  
    The data object providing context for inline rolls, or a function that produces it.  
  - **rolls?**: `boolean`  
    Replace inline dice rolls?  
  - **secrets?**: `boolean`  
    Include unrevealed secret tags in the final HTML? If false, unrevealed secret blocks will be removed.

**Returns:**  
`Promise<HTMLAnchorElement>`  
An HTML element for the document link.

---

### _createHyperlink
```typescript
protected static _createHyperlink(
    match: RegExpMatchArray,
    options?: EnrichmentOptions,
): Promise<HTMLAnchorElement>
```
Replace a hyperlink-like string with an actual HTML `<a>` tag.

**Parameters:**

- **match**: `RegExpMatchArray`  
  The regular expression match.

- **options?**: `EnrichmentOptions` = `{}`  
  Options provided to customize text enrichment.

**Returns:**  
`Promise<HTMLAnchorElement>`  
An HTML element for the document link.

---

### _createInlineRoll
```typescript
protected static _createInlineRoll(
    match: RegExpMatchArray,
    rollData: object,
    options?: EnrichmentOptions,
): Promise<null | HTMLAnchorElement>
```
Replace an inline roll formula with a rollable `<a>` element or an eagerly evaluated roll result.

**Parameters:**

- **match**: `RegExpMatchArray`  
  The regular expression match array.

- **rollData**: `object`  
  Provided roll data for use in roll evaluation.

- **options?**: `EnrichmentOptions` = `{}`  
  Options provided to customize text enrichment.

**Returns:**  
`Promise<null | HTMLAnchorElement>`  
The replaced match. Returns null if the contained command is not a valid roll expression.

---

### _createTinyMCE
```typescript
protected static _createTinyMCE(
    options?: object,
    content?: string,
): Promise<Editor>
```
Create a TinyMCE editor instance.

**Parameters:**

- **options?**: `object` = `{}`  
  Configuration options passed to the editor.

- **content?**: `string` = `""`  
  Initial HTML or text content to populate the editor with.

**Returns:**  
`Promise<Editor>`  
The TinyMCE editor instance.

---

### _embedContent
```typescript
protected static _embedContent(
    match: RegExpMatchArray,
    options?: EnrichmentOptions,
): Promise<null | HTMLElement>
```
Embed content from another Document.

**Parameters:**

- **match**: `RegExpMatchArray`  
  The regular expression match.

- **options?**: `EnrichmentOptions` = `{}`  
  Options provided to customize text enrichment.

**Returns:**  
`Promise<null | HTMLElement>`  
A representation of the Document as HTML content, or null if the Document could not be embedded.

---

### _enrichContentLinks
```typescript
protected static _enrichContentLinks(
    text: Text[],
    options?: EnrichmentOptions,
): Promise<boolean>
```
Convert text of the form `@UUID[uuid]{name}` to anchor elements.

**Parameters:**

- **text**: `Text[]`  
  The existing text content.

- **options?**: `EnrichmentOptions` = `{}`  
  Options provided to customize text enrichment.  
  - **custom?**: `boolean`  
    Apply custom enrichers?  
  - **documents?**: `boolean`  
    Replace dynamic document links?  
  - **embeds?**: `boolean`  
    Replace embedded content?  
  - **links?**: `boolean`  
    Replace hyperlink content?  
  - **relativeTo?**: `any`  
    A document to resolve relative UUIDs against.  
  - **rollData?**: `object | Function`  
    The data object providing context for inline rolls, or a function that produces it.  
  - **rolls?**: `boolean`  
    Replace inline dice rolls?  
  - **secrets?**: `boolean`  
    Include unrevealed secret tags in the final HTML? If false, unrevealed secret blocks will be removed.

**Returns:**  
`Promise<boolean>`  
Whether any content links were replaced and the text nodes need to be updated.

---

### _enrichEmbeds
```typescript
protected static _enrichEmbeds(
    text: Text[],
    options?: EnrichmentOptions,
): Promise<boolean>
```
Handle embedding Document content with `@Embed[uuid]{label}` text.

**Parameters:**

- **text**: `Text[]`  
  The existing text content.

- **options?**: `EnrichmentOptions` = `{}`  
  Options provided to customize text enrichment.

**Returns:**  
`Promise<boolean>`  
Whether any embeds were replaced and the text nodes need to be updated.

---

### _enrichHyperlinks
```typescript
protected static _enrichHyperlinks(
    text: Text[],
    options?: EnrichmentOptions,
): Promise<boolean>
```
Convert URLs into anchor elements.

**Parameters:**

- **text**: `Text[]`  
  The existing text content.

- **options?**: `EnrichmentOptions` = `{}`  
  Options provided to customize text enrichment.

**Returns:**  
`Promise<boolean>`  
Whether any hyperlinks were replaced and the text nodes need to be updated.

---

### _enrichInlineRolls
```typescript
protected static _enrichInlineRolls(
    rollData: object | Function,
    text: Text[],
    options?: EnrichmentOptions,
): Promise<boolean>
```
Convert text of the form `[[roll]]` to anchor elements.

**Parameters:**

- **rollData**: `object | Function`  
  The data object providing context for inline rolls.

- **text**: `Text[]`  
  The existing text content.

- **options?**: `EnrichmentOptions` = `{}`  
  Options provided to customize text enrichment.

**Returns:**  
`Promise<boolean>`  
Whether any inline rolls were replaced and the text nodes need to be updated.

---

### _onClickInlineRoll
```typescript
protected static _onClickInlineRoll(event: MouseEvent): Promise<any>
```
Handle left-mouse clicks on an inline roll, dispatching the formula or displaying the tooltip.

**Parameters:**

- **event**: `MouseEvent`  
  The initiating click event.

**Returns:**  
`Promise<any>`

---

### _parseEmbedConfig
```typescript
protected static _parseEmbedConfig(raw: string, options?: object): DocumentHTMLEmbedConfig
```
Parse the embed configuration to be passed to `ClientDocument#toEmbed`. The return value will be an object of any key=value pairs included with the configuration, as well as a separate `values` property that contains all the options supplied that were not in key=value format. If a `uuid` key is supplied it is used as the Document's UUID, otherwise the first supplied UUID is used.

**Parameters:**

- **raw**: `string`  
  The raw matched config string.

- **options?**: `object` = `{}`  
  Options forwarded to `parseUuid`.

**Returns:**  
`DocumentHTMLEmbedConfig`

**Example:**

```typescript
TextEditor._parseEmbedConfig('uuid=Actor.xyz caption="Example Caption" cite=false');
// Returns: { uuid: "Actor.xyz", caption: "Example Caption", cite: false, values: [] }

TextEditor._parseEmbedConfig('Actor.xyz caption="Example Caption" inline');
// Returns: { uuid: "Actor.xyz", caption: "Example Caption", values: ["inline"] }
```

---

### _primeCompendiums
```typescript
protected static _primeCompendiums(
    text: Text[],
    options?: EnrichmentOptions,
): Promise<void>
```
Scan for compendium UUIDs and retrieve Documents in batches so that they are cached when enrichment proceeds.

**Parameters:**

- **text**: `Text[]`  
  The text nodes to scan.

- **options?**: `EnrichmentOptions` = `{}`  
  Options provided to customize text enrichment.

**Returns:**  
`Promise<void>`

---

### _replaceTextContent
```typescript
protected static _replaceTextContent(
    text: Text[],
    rgx: RegExp,
    func: TextContentReplacer,
    options?: TextReplacementOptions,
): boolean
```
Facilitate the replacement of text node content using a matching regex rule and a provided replacement function.

**Parameters:**

- **text**: `Text[]`  
  The text nodes to match and replace.

- **rgx**: `RegExp`  
  The provided regular expression for matching and replacement.

- **func**: `TextContentReplacer`  
  The replacement function.

- **options?**: `TextReplacementOptions` = `{}`  
  Options to configure text replacement behavior.

**Returns:**  
`boolean`  
Whether a replacement was made.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)