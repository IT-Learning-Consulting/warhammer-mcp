# JournalSheetPageContext | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface JournalSheetPageContext {
    category?: string;
    editable: boolean;
    hidden: boolean;
    icon: string;
    id: string;
    name: string;
    number: number;
    ownershipClass: string;
    sort: number;
    tocClass: string;
    uncategorized?: boolean;
    viewClass: string;
}
```

## Properties

### Optional

- **category**?: `string`  
  The ID of the category this page belongs to, if any.

### Required

- **editable**: `boolean`  
  Whether the current user is allowed to edit the page.

- **hidden**: `boolean`  
  Whether the page is currently hidden due to a search filter.

- **icon**: `string`  
  The ownership icon for the page entry in the table of contents.

- **id**: `string`  
  The page ID.

- **name**: `string`  
  The page title.

- **number**: `number`  
  The page number in the table of contents.

- **ownershipClass**: `string`  
  The class name for the page's ownership level in the table of contents.

- **sort**: `number`  
  The numeric sort value which orders this page relative to other pages in its category.

- **tocClass**: `string`  
  The class name for the page entry in the table of contents.

- **uncategorized**?: `boolean`  
  Whether the page has not been assigned a category.

- **viewClass**: `string`  
  The class name for the page entry in the pages view.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)