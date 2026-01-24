# getTemplate | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `getTemplate`

```typescript
getTemplate(path: string, id?: string): Promise<TemplateDelegate<any>>
```

Get a template from the server by fetch request and caching the retrieved result.

#### Parameters

- **path**: `string`  
  The web-accessible HTML template URL.

- **id**: `string` = `path` (Optional)  
  An ID to register the partial with.

#### Returns

`Promise<TemplateDelegate<any>>`  
A Promise which resolves to the compiled Handlebars template.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)