# ActorDeltaField

A special subclass of `EmbeddedDocumentField` which allows construction of the ActorDelta to be lazily evaluated.

---

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.ActorDeltaField)  
- _EmbeddedDocumentField_  
- **ActorDeltaField**

---

## Constructor

```typescript
new ActorDeltaField(
    model: typeof Document, 
    options?: DataFieldOptions, 
    context?: DataFieldContext
): ActorDeltaField
```

**Parameters:**

- **model**: `typeof Document`  
  The type of Document which is embedded.  
  _Optional_

- **options**: `DataFieldOptions = {}`  
  Options which configure the behavior of the field.  
  _Optional_

- **context**: `DataFieldContext = {}`  
  Additional context which describes the field  
  _Optional_

**Returns:**  
`ActorDeltaField`

_Inherited from [`EmbeddedDocumentField`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#constructor)_

---

## Properties

- **fields**: `DataSchema`  
  The contained field definitions.  
  _Inherited from [`EmbeddedDocumentField.fields`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#fields)_

- **model**: `typeof DataModel`  
  The base DataModel definition which is contained in this field.  
  _Inherited from [`EmbeddedDocumentField.model`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#model)_

- **options**: `DataFieldOptions`  
  The initially provided options which configure the data field  
  _Inherited from [`EmbeddedDocumentField.options`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#options)_

- **hierarchical**: `boolean = true` _(static)_  
  _Inherited from [`EmbeddedDocumentField.hierarchical`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#hierarchical)_

- **recursive**: `boolean = true` _(static)_  
  _Inherited from [`EmbeddedDocumentField.recursive`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#recursive)_

---

## Accessors

- **fieldPath**: `string` (getter)  
  A dot-separated string representation of the field path within the parent schema.  
  _Returns:_ `string`  
  _Inherited from [`fields.EmbeddedDocumentField.fieldPath`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#fieldPath)_

- **_defaults**: `DataFieldOptions & { nullable: boolean; required: boolean } & { nullable: boolean; }` (static getter)  
  Default parameters for this field type  
  _Returns:_ `DataFieldOptions & { nullable: boolean; required: boolean } & { nullable: boolean }`  
  _Inherited from [`fields.EmbeddedDocumentField._defaults`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_defaults)_

- **hasFormSupport**: `boolean` (getter)  
  Does this form field class have defined form support?  
  _Returns:_ `boolean`  
  _Inherited from [`fields.EmbeddedDocumentField.hasFormSupport`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#hasFormSupport)_

---

## Methods

### _addTypes

```typescript
_addTypes(source: any, changes: any, options?: {}): void
```

**Parameters:**

- **source**: `any`  
- **changes**: `any`  
- **options**: `{}` = `{}`

**Returns:** `void`

_Inherited from [`EmbeddedDocumentField._addTypes`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_addTypes)_

---

### _cast

```typescript
_cast(value: any): any
```

**Parameters:**

- **value**: `any`

**Returns:** `any`

_Inherited from [`EmbeddedDocumentField._cast`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_cast)_

---

### _cleanType

```typescript
_cleanType(data: any, options?: {}): any
```

Apply any cleaning logic specific to this DataField type.

**Parameters:**

- **data**: `any`  
  The appropriately coerced value.

- **options**: `{}` = `{}`  
  Additional options for how the field is cleaned.

**Returns:**  
`any` The cleaned value.

_Inherited from [`EmbeddedDocumentField._cleanType`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_cleanType)_

---

### _getField

```typescript
_getField(path: any): undefined | DataField | ActorDeltaField
```

**Parameters:**

- **path**: `any`

**Returns:**  
`undefined | DataField | ActorDeltaField`

_Inherited from [`EmbeddedDocumentField._getField`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_getField)_

---

### _updateCommit

```typescript
_updateCommit(source: any, key: any, value: any, diff: any, options: any): void
```

**Parameters:**

- **source**: `any`  
- **key**: `any`  
- **value**: `any`  
- **diff**: `any`  
- **options**: `any`

**Returns:** `void`

Overrides [`EmbeddedDocumentField._updateCommit`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_updateCommit)

---

### _updateDiff

```typescript
_updateDiff(
    source: any,
    key: any,
    value: any,
    difference: any,
    options: any,
): void
```

The `SchemaField#update` method plays a special role of recursively dispatching `DataField#update` operations to the constituent fields within the schema.

**Parameters:**

- **source**: `any`  
- **key**: `any`  
- **value**: `any`  
- **difference**: `any`  
- **options**: `any`

**Returns:** `void`

_Inherited from [`EmbeddedDocumentField._updateDiff`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_updateDiff)_

---

### _validateModel

```typescript
_validateModel(changes: any, options: any): void
```

**Parameters:**

- **changes**: `any`  
- **options**: `any`

**Returns:** `void`

_Inherited from [`EmbeddedDocumentField._validateModel`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_validateModel)_

---

### _validateType

```typescript
_validateType(data: any, options?: {}): undefined | DataModelValidationFailure
```

**Parameters:**

- **data**: `any`  
- **options**: `{}` = `{}`

**Returns:**  
`undefined | DataModelValidationFailure`

_Inherited from [`EmbeddedDocumentField._validateType`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_validateType)_

---

### [iterator]

```typescript
"[iterator]"(): Generator<DataField, void, unknown>
```

Iterate over a SchemaField by iterating over its fields.

**Returns:**  
`Generator<DataField, void, unknown>`

_Inherited from [`EmbeddedDocumentField[iterator]`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#iterator)_

---

### apply

```typescript
apply(fn: any, data?: {}, options?: {}): {}
```

**Parameters:**

- **fn**: `any`  
- **data**: `{}` = `{}`  
- **options**: `{}` = `{}`

**Returns:** `{}`

_Inherited from [`EmbeddedDocumentField.apply`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#apply)_

---

### applyChange

```typescript
applyChange(
    value: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

Apply an `ActiveEffectChange` to this field.

**Parameters:**

- **value**: `any`  
  The field's current value.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The change to apply.

**Returns:**  
`any` The updated value.

_Inherited from [`EmbeddedDocumentField.applyChange`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#applyChange)_

---

### clean

```typescript
clean(value: any, options: any): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a `DataModel` is constructed. For one-off cleaning of user-provided input the `sanitize` method should be used.

**Parameters:**

- **value**: `any`  
  An initial requested value

- **options**: `any`  
  Additional options for how the field is cleaned

**Returns:**  
`any` The cast value

_Inherited from [`EmbeddedDocumentField.clean`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#clean)_

---

### entries

```typescript
entries(): [string, DataField][]
```

An array of `[name, DataField]` tuples which define the schema.

**Returns:**  
`[string, DataField][]`

_Inherited from [`EmbeddedDocumentField.entries`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#entries)_

---

### get

```typescript
get(fieldName: string): void | DataField
```

Get a `DataField` instance from the schema by name.

**Parameters:**

- **fieldName**: `string`  
  The field name

**Returns:**  
`void | DataField` - The `DataField` instance or `undefined`

_Inherited from [`EmbeddedDocumentField.get`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#get)_

---

### getCollection

```typescript
getCollection(
    parent: Document<object, DocumentConstructionContext>
): Collection<string, Document<object, DocumentConstructionContext>>
```

Return the embedded document(s) as a `Collection`.

**Parameters:**

- **parent**: `Document<object, DocumentConstructionContext>`  
  The parent document.

**Returns:**  
`Collection<string, Document<object, DocumentConstructionContext>>`

_Inherited from [`EmbeddedDocumentField.getCollection`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#getCollection)_

---

### getField

```typescript
getField(fieldName: string | string[]): undefined | DataField
```

Traverse the schema, obtaining the `DataField` definition for a particular field.

**Parameters:**

- **fieldName**: `string | string[]`  
  A field path like `["abilities", "strength"]` or `"abilities.strength"`

**Returns:**  
`undefined | DataField` - The corresponding `DataField` definition for that field, or `undefined`

_Inherited from [`EmbeddedDocumentField.getField`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#getField)_

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

**Parameters:**

- **data**: `any`

**Returns:**  
`any`

_Inherited from [`EmbeddedDocumentField.getInitialValue`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#getInitialValue)_

---

### has

```typescript
has(fieldName: string): boolean
```

Test whether a certain field name belongs to this schema definition.

**Parameters:**

- **fieldName**: `string`  
  The field name

**Returns:**  
`boolean`  
Does the named field exist in this schema?

_Inherited from [`EmbeddedDocumentField.has`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#has)_

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

**Parameters:**

- **value**: `any`  
- **model**: `any`  
- **options**: `{}` = `{}`

**Returns:**  
`any`

_Overrides [`EmbeddedDocumentField.initialize`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#initialize)_

---

### keys

```typescript
keys(): string[]
```

An array of field names which are present in the schema.

**Returns:**  
`string[]`

_Inherited from [`EmbeddedDocumentField.keys`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#keys)_

---

### migrateSource

```typescript
migrateSource(sourceData: any, fieldData: any): void
```

**Parameters:**

- **sourceData**: `any`  
- **fieldData**: `any`

**Returns:**  
`void`

_Inherited from [`EmbeddedDocumentField.migrateSource`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#migrateSource)_

---

### toFormGroup

```typescript
toFormGroup(
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```

Render this `DataField` as a standardized form-group element.

**Parameters:**

- **groupConfig**: `FormGroupConfig = {}`  
  Configuration options passed to the wrapping form-group

- **inputConfig**: `FormInputConfig = {}`  
  Input element configuration options passed to `DataField#toInput`

**Returns:**  
`HTMLDivElement` - The rendered form group element

_Inherited from [`EmbeddedDocumentField.toFormGroup`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#toFormGroup)_

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this `DataField` as an HTML element.

**Parameters:**

- **config**: `FormInputConfig = {}`  
  Form element configuration parameters

**Returns:**  
`HTMLElement | HTMLCollection` - A rendered HTMLElement for the field

**Throws:**  
An Error if this `DataField` subclass does not support input rendering

_Inherited from [`EmbeddedDocumentField.toInput`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#toInput)_

---

### toObject

```typescript
toObject(value: any): any
```

**Parameters:**

- **value**: `any`

**Returns:**  
`any`

_Inherited from [`EmbeddedDocumentField.toObject`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#toObject)_

---

### validate

```typescript
validate(value: any, options: any): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a `DataModelValidationFailure` instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

**Parameters:**

- **value**: `any`  
  The initial value

- **options**: `any`  
  Options which affect validation behavior

**Returns:**  
`void | DataModelValidationFailure`  
Returns a `DataModelValidationFailure` if a validation failure occurred.

_Inherited from [`EmbeddedDocumentField.validate`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#validate)_

---

### values

```typescript
values(): DataField[]
```

An array of `DataField` instances which are present in the schema.

**Returns:**  
`DataField[]`

_Inherited from [`EmbeddedDocumentField.values`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#values)_

---

## Protected Methods

### _applyChangeAdd

```typescript
_applyChangeAdd(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply an ADD change to this field.

**Parameters:**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The original change data.

**Returns:**  
`any` - The updated value.

_Inherited from [`EmbeddedDocumentField._applyChangeAdd`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_applyChangeAdd)_

---

### _applyChangeCustom

```typescript
_applyChangeCustom(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply a CUSTOM change to this field.

**Parameters:**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The original change data.

**Returns:**  
`any` - The updated value.

_Inherited from [`EmbeddedDocumentField._applyChangeCustom`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_applyChangeCustom)_

---

### _applyChangeDowngrade

```typescript
_applyChangeDowngrade(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply a DOWNGRADE change to this field.

**Parameters:**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The original change data.

**Returns:**  
`any` - The updated value.

_Inherited from [`EmbeddedDocumentField._applyChangeDowngrade`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_applyChangeDowngrade)_

---

### _applyChangeMultiply

```typescript
_applyChangeMultiply(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply a MULTIPLY change to this field.

**Parameters:**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The original change data.

**Returns:**  
`any` - The updated value.

_Inherited from [`EmbeddedDocumentField._applyChangeMultiply`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_applyChangeMultiply)_

---

### _applyChangeOverride

```typescript
_applyChangeOverride(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply an OVERRIDE change to this field.

**Parameters:**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The original change data.

**Returns:**  
`any` - The updated value.

_Inherited from [`EmbeddedDocumentField._applyChangeOverride`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_applyChangeOverride)_

---

### _applyChangeUpgrade

```typescript
_applyChangeUpgrade(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply an UPGRADE change to this field.

**Parameters:**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The original change data.

**Returns:**  
`any` - The updated value.

_Inherited from [`EmbeddedDocumentField._applyChangeUpgrade`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_applyChangeUpgrade)_

---

### _initialize

```typescript
_initialize(fields: DataSchema): DataSchema
```

Initialize and validate the structure of the provided field definitions.

**Parameters:**

- **fields**: `DataSchema`  
  The provided field definitions

**Returns:**  
`DataSchema` - The validated schema

_Inherited from [`EmbeddedDocumentField._initialize`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_initialize)_

---

### _toInput

```typescript
_toInput(config: FormInputConfig): HTMLElement | HTMLCollection
```

Render this `DataField` as an HTML element. Subclasses should implement this method rather than the public `toInput` method which wraps it.

**Parameters:**

- **config**: `FormInputConfig`  
  Form element configuration parameters

**Returns:**  
`HTMLElement | HTMLCollection` - A rendered HTMLElement for the field

**Throws:**  
An Error if this `DataField` subclass does not support input rendering

_Inherited from [`EmbeddedDocumentField._toInput`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_toInput)_

---

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like `null` or `undefined`.

**Parameters:**

- **value**: `any`  
  The candidate value

**Returns:**  
`boolean | void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws:**  
May throw a specific error if the value is not valid

_Inherited from [`EmbeddedDocumentField._validateSpecial`](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDocumentField.html#_validateSpecial)_

---

For more details, visit the [Foundry Virtual Tabletop API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.data.ActorDeltaField.html).