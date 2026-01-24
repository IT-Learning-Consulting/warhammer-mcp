# renderTemplate | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
renderTemplate(path: string, data: object): Promise<string>
```

Get and render a template using provided data and handle the returned HTML. Supports asynchronous file template loading with a client-side caching layer.

Allows resolution of prototype methods and properties since this all occurs within the safety of the client.

**Parameters**

- **path**: `string`  
  The file path to the target HTML template

- **data**: `object`  
  A data object against which to compile the template

**Returns**  
`Promise<string>`  
Returns the compiled and rendered template as a string

**See**

- [https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access](https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access)
- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)