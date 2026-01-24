# JournalEntryPageHeading

```typescript
interface JournalEntryPageHeading {
    children: string[];
    element?: HTMLHeadingElement;
    level: number;
    order: number;
    slug: string;
    text: string;
}
```

## Properties

- **children**: `string[]`  
  Any child headings of this one.

- **element**?: `HTMLHeadingElement`  
  The currently rendered element for this heading, if it exists.

- **level**: `number`  
  The heading level, 1-6.

- **order**: `number`  
  The linear ordering of the heading in the table of contents.

- **slug**: `string`  
  The generated slug for this heading.

- **text**: `string`  
  The raw heading text with any internal tags omitted.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)