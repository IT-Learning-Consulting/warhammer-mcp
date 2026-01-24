# localize | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `localize`

```typescript
localize(value: string, options: { hash: object }): string
```

Translate a provided string key by using the loaded dictionary of localization strings.

#### Parameters

- **value**: `string`  
  The path to a localized string.

- **options**: `{ hash: object }`  
  Interpolation data passed to `Localization#format`.

#### Returns

`string`

#### Example: Translate a provided localization string, optionally including formatting

```handlebars
<label>{{localize "ACTOR.Create"}}</label> <!-- "Create Actor" -->
<label>{{localize "CHAT.InvalidCommand" command=foo}}</label> <!-- "foo is not a valid chat message command." -->
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)