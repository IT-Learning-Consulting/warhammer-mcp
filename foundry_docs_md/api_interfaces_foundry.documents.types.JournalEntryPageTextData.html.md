# JournalEntryPageTextData

Interface **JournalEntryPageTextData**

```typescript
interface JournalEntryPageTextData {
    content?: string;
    format: number;
    markdown?: string;
}
```

## Properties

- **content?**: `string`  
  The content of the JournalEntryPage in a format appropriate for its type.

- **format**: `number`  
  The format of the page's content, in `CONST.JOURNAL_ENTRY_PAGE_FORMATS`.

- **markdown?**: `string`  
  The original markdown source, if applicable.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)