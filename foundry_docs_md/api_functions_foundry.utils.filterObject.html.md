# filterObject | Foundry Virtual Tabletop - API Documentation - Version 13

### Function filterObject

```typescript
filterObject(
    source: object,
    template: object,
    options?: { deletionKeys?: boolean; templateValues?: boolean },
): any
```

Filter the contents of some source object using the structure of a template object. Only keys which exist in the template are preserved in the source object.

**Parameters**

- **source**: `object`  
  An object which contains the data you wish to filter

- **template**: `object`  
  An object which contains the structure you wish to preserve

- **options**? : `{ deletionKeys?: boolean; templateValues?: boolean } = {}`  
  Additional options which customize the filtration

  - **deletionKeys**? : `boolean`  
    Whether to keep deletion keys

  - **templateValues**? : `boolean`  
    Instead of keeping values from the source, instead draw values from the template

**Returns**  
`any`

**Example: Filter an object**

```typescript
const source = {foo: {number: 1, name: "Tim", topping: "olives"}, bar: "baz"};
const template = {foo: {number: 0, name: "Mit", style: "bold"}, other: 72};
filterObject(source, template); // {foo: {number: 1, name: "Tim"}};
filterObject(source, template, {templateValues: true}); // {foo: {number: 0, name: "Mit"}};
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)