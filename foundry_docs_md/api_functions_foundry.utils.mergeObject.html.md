# mergeObject | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
mergeObject(
    original: object,
    other?: object,
    options?: {
        enforceTypes?: boolean;
        inplace?: boolean;
        insertKeys?: boolean;
        insertValues?: boolean;
        overwrite?: boolean;
        performDeletions?: boolean;
        recursive?: boolean;
    },
    _d?: number,
): object
```

Update a source object by replacing its keys and values with those from a target object.

## Parameters

- **original**: `object`  
  The initial object which should be updated with values from the target  
  *Optional*

- **other**: `object` = `{}`  
  A new object whose values should replace those in the source  
  *Optional*

- **options**:  
  ```typescript
  {
      enforceTypes?: boolean;
      inplace?: boolean;
      insertKeys?: boolean;
      insertValues?: boolean;
      overwrite?: boolean;
      performDeletions?: boolean;
      recursive?: boolean;
  } = {}
  ```  
  Additional options which configure the merge  
  *Optional*

  - **enforceTypes**?: `boolean`  
    Control whether strict type checking requires that the value of a key in the other object must match the data type in the original data to be merged.  
    *Optional*

  - **inplace**?: `boolean`  
    Control whether to apply updates to the original object in-place (if true), otherwise the original object is duplicated and the copy is merged.  
    *Optional*

  - **insertKeys**?: `boolean`  
    Control whether to insert new top-level objects into the resulting structure which do not previously exist in the original object.  
    *Optional*

  - **insertValues**?: `boolean`  
    Control whether to insert new nested values into child objects in the resulting structure which did not previously exist in the original object.  
    *Optional*

  - **overwrite**?: `boolean`  
    Control whether to replace existing values in the source, or only merge values which do not already exist in the original object.  
    *Optional*

  - **performDeletions**?: `boolean`  
    Control whether to perform deletions on the original object if deletion keys are present in the other object.  
    *Optional*

  - **recursive**?: `boolean`  
    Control whether to merge inner-objects recursively (if true), or whether to simply replace inner objects with a provided new value.  
    *Optional*

- **_d**: `number` = `0`  
  A privately used parameter to track recursion depth.  
  *Optional*

## Returns

- `object`  
  The original source object including updated, inserted, or overwritten records.

## Examples

### Control how new keys and values are added

```typescript
mergeObject({k1: "v1"}, {k2: "v2"}, {insertKeys: false}); // {k1: "v1"}
mergeObject({k1: "v1"}, {k2: "v2"}, {insertKeys: true});  // {k1: "v1", k2: "v2"}
mergeObject({k1: {i1: "v1"}}, {k1: {i2: "v2"}}, {insertValues: false}); // {k1: {i1: "v1"}}
mergeObject({k1: {i1: "v1"}}, {k1: {i2: "v2"}}, {insertValues: true});  // {k1: {i1: "v1", i2: "v2"}}
```

### Control how existing data is overwritten

```typescript
mergeObject({k1: "v1"}, {k1: "v2"}, {overwrite: true});  // {k1: "v2"}
mergeObject({k1: "v1"}, {k1: "v2"}, {overwrite: false}); // {k1: "v1"}
```

### Control whether merges are performed recursively

```typescript
mergeObject({k1: {i1: "v1"}}, {k1: {i2: "v2"}}, {recursive: false}); // {k1: {i2: "v2"}}
mergeObject({k1: {i1: "v1"}}, {k1: {i2: "v2"}}, {recursive: true});  // {k1: {i1: "v1", i2: "v2"}}
```

### Deleting an existing object key

```typescript
mergeObject({k1: "v1", k2: "v2"}, {"-=k1": null}, {performDeletions: true}); // {k2: "v2"}
```

### Explicitly replacing an inner object key

```typescript
mergeObject({k1: {i1: "v1"}}, {"==k1": {i2: "v2"}}, {performDeletions: true}); // {k1: {i2: "v2"}}
```

---

For more details, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).