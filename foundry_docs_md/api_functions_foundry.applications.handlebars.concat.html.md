# concat | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
concat(...values: string[]): SafeString
```

Concatenate a number of string terms into a single string. This is useful for passing arguments with variable names.

**Parameters**

- **...values**: `string[]`  
  The values to concatenate

**Returns**  
`SafeString`

**Example: Concatenate several string parts to create a dynamic variable**

```handlebars
{{filePicker target=(concat "faces." i ".img") type="image"}}
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)