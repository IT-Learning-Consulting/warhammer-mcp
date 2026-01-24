# _StringFieldOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface _StringFieldOptions {
    blank?: boolean;
    choices?: object | Function | string[];
    textSearch?: boolean;
    trim?: boolean;
}
```

## Properties

- **blank**? : `boolean`  
  Is the string allowed to be blank (empty)?

- **choices**? : `object | Function | string[]`  
  An array of values or an object of values/labels which represent allowed choices for the field.  
  A function may be provided which dynamically returns the array of choices.

- **textSearch**? : `boolean`  
  Is this string field a target for text search?

- **trim**? : `boolean`  
  Should any provided string be trimmed as part of cleaning?

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)