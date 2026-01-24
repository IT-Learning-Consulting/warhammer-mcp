# CategoryBrowserConfiguration | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface CategoryBrowserConfiguration {
    initialCategory: null | string;
    packageList: boolean;
    subtemplates: {
        category: string;
        filters: null | string;
        sidebarFooter: null | string;
    };
}
```

## Properties

### **initialCategory**

- **Type:** `null | string`

The initial category tab: a `null` value will result in an initial active tab that corresponds with the first category by insertion order.

### **packageList**

- **Type:** `boolean`

Where this application displays is a list of tagged FVTT packages.

### **subtemplates**

```typescript
{
    category: string;
    filters: null | string;
    sidebarFooter: null | string;
}
```

Additional template partials for specific use with this class.

#### **category**

- **Type:** `string`

The markup used for each category: required to be set by any subclass.

#### **filters**

- **Type:** `null | string`

Optional template for secondary filtering (aside from text search).

#### **sidebarFooter**

- **Type:** `null | string`

Optional sidebar footer content.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)