# performIntegerSort

```typescript
performIntegerSort(
    source: object,
    options?: {
        siblings?: object[];
        sortBefore?: boolean;
        sortKey?: string;
        target?: null | object;
    },
): object[]
```

Given a source object to sort, a target to sort relative to, and an Array of siblings in the container: Determine the updated sort keys for the source object, or all siblings if a reindex is required. Return an Array of updates to perform, it is up to the caller to dispatch these updates. Each update is structured as: `{ target: object, update: {sortKey: sortValue} }`

## Parameters

- **source**: `object`  
  The source object being sorted

- **options** (optional):  
  ```typescript
  {
      siblings?: object[];
      sortBefore?: boolean;
      sortKey?: string;
      target?: null | object;
  } = {}
  ```
  Options which modify the sort behavior

  - **siblings** (optional): `object[]`  
    The Array of siblings which the source should be sorted within

  - **sortBefore** (optional): `boolean`  
    Explicitly sort before (`true`) or sort after (`false`). If undefined the sort order will be automatically determined.

  - **sortKey** (optional): `string`  
    The property name within the source object which defines the sort key

  - **target** (optional): `null | object`  
    The target object relative which to sort

## Returns

`object[]`  
An Array of updates for the caller of the helper function to perform

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)