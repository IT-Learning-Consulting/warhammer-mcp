# Localization | Foundry Virtual Tabletop - API Documentation - Version 13

A helper class which assists with localization and string translation

**Param: serverLanguage**  
The default language configuration setting for the server

---

## Properties

### defaultModule

**Type:** `string`  
The package authorized to provide default language configurations

### lang

**Type:** `string`  
The target language for localization

### translations

**Type:** `Object`  
The translation dictionary for the target language

---

## Methods

### format

```typescript
format(stringId: string, data?: object): string
```

Localize a string including variable formatting for input arguments. Provide a string ID which defines the localized template. Variables can be included in the template enclosed in braces and will be substituted using those named keys.

- **Parameters:**
  - **stringId**: `string`  
    The string ID to translate
  - **data**: `object` = `{}`  
    Provided input data
- **Returns:** `string`  
  The translated and formatted string

**Example: Localizing a formatted string in JavaScript**

```js
{
  "MYMODULE.GREETING": "Hello {name}, this is my module!"
}
game.i18n.format("MYMODULE.GREETING", {name: "Andrew"}); // Hello Andrew, this is my module!
```

**Example: Localizing a formatted string in Handlebars**

```handlebars
{{localize "MYMODULE.GREETING" name="Andrew"}} <!-- Hello, this is my module! -->
```

---

### getListFormatter

```typescript
getListFormatter(options?: { style?: any; type?: any }): ListFormat
```

Retrieve list formatter configured to the world's language setting.

- **Parameters:**
  - **Optional**  
    **options**: `{ style?: any; type?: any } = {}`
    - **style?**: `any`  
      The list formatter style, either `"long"`, `"short"`, or `"narrow"`.
    - **type?**: `any`  
      The list formatter type, either `"conjunction"`, `"disjunction"`, or `"unit"`.
- **Returns:** `ListFormat`

**See:**  
[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat)

---

### has

```typescript
has(stringId: string, fallback?: boolean): boolean
```

Return whether a certain string has a known translation defined.

- **Parameters:**
  - **stringId**: `string`  
    The string key being translated
  - **Optional**  
    **fallback**: `boolean` = `true`  
    Allow fallback translations to count?
- **Returns:** `boolean`

---

### initialize

```typescript
initialize(): Promise<void>
```

Initialize the Localization module. Discover available language translations and apply the current language setting.

- **Returns:** `Promise<void>`  
  A Promise which resolves once languages are initialized

---

### localize

```typescript
localize(stringId: string): string
```

Localize a string by drawing a translation from the available translations dictionary, if available. If a translation is not available, the original string is returned.

- **Parameters:**
  - **stringId**: `string`  
    The string ID to translate
- **Returns:** `string`  
  The translated string

**Example: Localizing a simple string in JavaScript**

```js
{
  "MYMODULE.MYSTRING": "Hello, this is my module!"
}
game.i18n.localize("MYMODULE.MYSTRING"); // Hello, this is my module!
```

**Example: Localizing a simple string in Handlebars**

```handlebars
{{localize "MYMODULE.MYSTRING"}} <!-- Hello, this is my module! -->
```

---

### setLanguage

```typescript
setLanguage(lang: string): Promise<void>
```

Set a language as the active translation source for the session.

- **Parameters:**
  - **lang**: `string`  
    A language string in `CONFIG.supportedLanguages`
- **Returns:** `Promise<void>`  
  A Promise which resolves once the translations for the requested language are ready

---

### sortObjects

```typescript
sortObjects(objects: object[], key: string): object[]
```

Sort an array of objects by a given key in a localization-aware manner.

- **Parameters:**
  - **objects**: `object[]`  
    The objects to sort, this array will be mutated.
  - **key**: `string`  
    The key to sort the objects by. This can be provided in dot-notation.
- **Returns:** `object[]`

---

### static localizeDataModel

```typescript
localizeDataModel(
  model: any,
  options?: { prefixes?: string[]; prefixPath?: string },
): void
```

Perform one-time localization of the fields in a DataModel schema, translating their label and hint properties.

- **Parameters:**
  - **model**: `any`  
    The DataModel class to localize
  - **options**: `{ prefixes?: string[]; prefixPath?: string } = {}`  
    Options which configure how localization is performed
    - **Optional**  
      **prefixes?**: `string[]`  
      An array of localization key prefixes to use. If not specified, prefixes are learned from the `DataModel.LOCALIZATION_PREFIXES` static property.
    - **Optional**  
      **prefixPath?**: `string`  
      A localization path prefix used to prefix all field names within this model. This is generally not required.
- **Returns:** `void`

**Example**

JavaScript class definition and localization call:

```js
class MyDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      foo: new foundry.data.fields.StringField(),
      bar: new foundry.data.fields.NumberField()
    };
  }
  static LOCALIZATION_PREFIXES = ["MYMODULE.MYDATAMODEL"];
}

Hooks.on("i18nInit", () => {
  Localization.localizeDataModel(MyDataModel);
});
```

JSON localization file:

```json
{
  "MYMODULE": {
    "MYDATAMODEL": {
      "FIELDS": {
        "foo": {
          "label": "Foo",
          "hint": "Instructions for foo"
        },
        "bar": {
          "label": "Bar",
          "hint": "Instructions for bar"
        }
      }
    }
  }
}
```

---

### static localizeSchema

```typescript
localizeSchema(
  schema: SchemaField,
  prefixes?: string[],
  options?: { prefixPath?: string; seenFields?: Set<foundry.data.fields.DataField> },
): void
```

Localize the "label" and "hint" properties for all fields in a data schema.

- **Parameters:**
  - **schema**: `SchemaField`
  - **prefixes**: `string[] = []`
  - **options**: `{ prefixPath?: string; seenFields?: Set<foundry.data.fields.DataField> } = {}`
- **Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)