# loadTemplates

```typescript
loadTemplates(
    paths: string[] | Record<string, string>,
): Promise<TemplateDelegate<any>[]>
```

Load and cache a set of templates by providing an Array of paths.

## Parameters

- **paths**: `string[] | Record<string, string>`  
  An array of template file paths to load, or an object of Handlebars partial IDs to paths.

## Returns

- `Promise<TemplateDelegate<any>[]>`

## Examples

Loading a list of templates:

```typescript
await foundry.applications.handlebars.loadTemplates([
  "templates/apps/foo.html",
  "templates/apps/bar.html"
]);
```

Include a preloaded template as a partial:

```handlebars
{{> "templates/apps/foo.html" }}
```

Loading an object of templates:

```typescript
await foundry.applications.handlebars.loadTemplates({
  foo: "templates/apps/foo.html",
  bar: "templates/apps/bar.html"
});
```

Include a preloaded template as a partial:

```handlebars
{{> foo }}
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)