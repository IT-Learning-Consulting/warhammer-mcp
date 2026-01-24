# PackageCompatibility

A custom `SchemaField` for defining package compatibility versions.

## Class Hierarchy
- [SchemaField](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)
- **PackageCompatibility**

## Mixes
- PackageCompatibilityData

---

## Properties

### fields

**Type:** [DataSchema](https://foundryvtt.com/api/types/foundry.abstract.types.DataSchema.html)

The contained field definitions.

_Inherited from [SchemaField.fields](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#fields)_

---

## Accessors

### options

**Type:** [DataFieldOptions](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldOptions.html)

The initially provided options which configure the data field

_Inherited from [SchemaField.options](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#options)_

### hierarchical

**Static**  
**Type:** `boolean = false`

Whether this field defines part of a Document/Embedded Document hierarchy.

_Inherited from [SchemaField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#hierarchical)_

### recursive

**Static**  
**Type:** `boolean = true`

_Inherited from [SchemaField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#recursive)_

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

_Returns_ `string`

_Inherited from [SchemaField.fieldPath](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#fieldPath)_

### _defaults

```typescript
get _defaults(): DataFieldOptions & { nullable: boolean; required: boolean }
```

Default parameters for this field type.

---

### hasFormSupport

```typescript
get hasFormSupport(): boolean
```

Does this form field class have defined form support?

_Returns_ `boolean`

_Inherited from [SchemaField.hasFormSupport](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#hasFormSupport)_

---

## Methods

### _addTypes

```typescript
_addTypes(source: any, changes: any, options?: {}): void
```

_Inherited from [SchemaField._addTypes](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_addTypes)_

**Parameters:**

- **source**: `any`
- **changes**: `any`
- **options?**: `{}` _(optional)_

---

### _cast

```typescript
_cast(value: any): any
```

_Inherited from [SchemaField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_cast)_

**Parameters:**

- **value**: `any`

---

### _cleanType

```typescript
_cleanType(data: any, options?: {}): any
```

Apply any cleaning logic specific to this DataField type.

_Inherited from [SchemaField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_cleanType)_

**Parameters:**

- **data**: `any` - The appropriately coerced value.
- **options?**: `{}` _(optional)_ - Additional options for how the field is cleaned.

_Returns_ `any` - The cleaned value.

---

### _getField

```typescript
_getField(path: any): undefined | DataField | PackageCompatibility
```

_Inherited from [SchemaField._getField](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_getField)_

**Parameters:**

- **path**: `any`

_Returns_ `undefined | DataField | PackageCompatibility`

---

### _updateCommit

```typescript
_updateCommit(source: any, key: any, value: any, diff: any, options: any): void
```

_Inherited from [SchemaField._updateCommit](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_updateCommit)_

**Parameters:**

- **source**: `any`
- **key**: `any`
- **value**: `any`
- **diff**: `any`
- **options**: `any`

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

The SchemaField#update method plays a special role of recursively dispatching `DataField#update` operations to the constituent fields within the schema.

_Inherited from [SchemaField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_updateDiff)_

**Parameters:**

- **source**: `any`
- **key**: `any`
- **value**: `any`
- **difference**: `any`
- **options**: `any`

---

### _validateModel

```typescript
_validateModel(changes: any, options?: {}): void
```

_Inherited from [SchemaField._validateModel](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_validateModel)_

**Parameters:**

- **changes**: `any`
- **options?**: `{}` _(optional)_

---

### _validateType

```typescript
_validateType(data: any, options?: {}): undefined | DataModelValidationFailure
```

_Inherited from [SchemaField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_validateType)_

**Parameters:**

- **data**: `any`
- **options?**: `{}` _(optional)_

_Returns_ `undefined | DataModelValidationFailure`

---

### [iterator]

```typescript
"[iterator]"(): Generator<DataField, void, unknown>
```

Iterate over a SchemaField by iterating over its fields.

_Inherited from [SchemaField.[iterator]](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_iterator)_

---

### apply

```typescript
apply(fn: any, data?: {}, options?: {}): {}
```

_Inherited from [SchemaField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#apply)_

**Parameters:**

- **fn**: `any`
- **data?**: `{}` _(optional, default = {})_
- **options?**: `{}` _(optional, default = {})_

_Returns_ `{}`

---

### applyChange

```typescript
applyChange(
    value: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply an ActiveEffectChange to this field.

_Inherited from [SchemaField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#applyChange)_

**Parameters:**

- **value**: `any` - The field's current value.
- **model**: `DataModel<object, DataModelConstructionContext>` - The model instance.
- **change**: `EffectChangeData` - The change to apply.

_Returns_ `any` - The updated value.

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

_Inherited from [SchemaField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#clean)_

**Parameters:**

- **value**: `any` - An initial requested value.
- **options?**: `{ partial?: boolean; source?: object }` _(optional, default = {})_
  - **partial?**: `boolean` - Whether to perform partial cleaning.
  - **source?**: `object` - The root data model being cleaned.

_Returns_ `any` - The cast value.

---

### entries

```typescript
entries(): [string, DataField][]
```

An array of `[name, DataField]` tuples which define the schema.

_Inherited from [SchemaField.entries](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#entries)_

_Returns_ `[string, DataField][]`

---

### get

```typescript
get(fieldName: string): void | DataField
```

Get a DataField instance from the schema by name.

_Inherited from [SchemaField.get](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#get)_

**Parameters:**

- **fieldName**: `string` - The field name

_Returns_ `void | DataField` - The DataField instance or undefined.

---

### getField

```typescript
getField(fieldName: string | string[]): undefined | DataField
```

Traverse the schema, obtaining the DataField definition for a particular field.

_Inherited from [SchemaField.getField](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#getField)_

**Parameters:**

- **fieldName**: `string | string[]`  
  A field path like `["abilities", "strength"]` or `"abilities.strength"`

_Returns_ `undefined | DataField` - The corresponding DataField definition for that field, or undefined.

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

_Inherited from [SchemaField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#getInitialValue)_

**Parameters:**

- **data**: `any`

_Returns_ `any`

---

### has

```typescript
has(fieldName: string): boolean
```

Test whether a certain field name belongs to this schema definition.

_Inherited from [SchemaField.has](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#has)_

**Parameters:**

- **fieldName**: `string`

_Returns_ `boolean` - Does the named field exist in this schema?

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

_Inherited from [SchemaField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#initialize)_

**Parameters:**

- **value**: `any`
- **model**: `any`
- **options?**: `{}` _(optional)_

_Returns_ `any`

---

### keys

```typescript
keys(): string[]
```

An array of field names which are present in the schema.

_Inherited from [SchemaField.keys](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#keys)_

_Returns_ `string[]`

---

### migrateSource

```typescript
migrateSource(sourceData: object, fieldData: any): void
```

Migrate this field's candidate source data.

_Inherited from [SchemaField.migrateSource](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#migrateSource)_

**Parameters:**

- **sourceData**: `object` - Candidate source data of the root model
- **fieldData**: `any` - The value of this field within the source data

---

### toFormGroup

```typescript
toFormGroup(
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```

Render this DataField as a standardized form-group element.

_Inherited from [SchemaField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#toFormGroup)_

**Parameters:**

- **groupConfig?**: `FormGroupConfig` _(optional, default = {})_  
  Configuration options passed to the wrapping form-group.
- **inputConfig?**: `FormInputConfig` _(optional, default = {})_  
  Input element configuration options passed to `DataField#toInput`.

_Returns_ `HTMLDivElement` - The rendered form group element.

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

_Inherited from [SchemaField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#toInput)_

**Parameters:**

- **config?**: `FormInputConfig` _(optional, default = {})_  
  Form element configuration parameters.

_Returns_ `HTMLElement | HTMLCollection` - A rendered HTMLElement for the field.

_Throws_:  
An Error if this DataField subclass does not support input rendering.

---

### toObject

```typescript
toObject(value: any): any
```

_Inherited from [SchemaField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#toObject)_

**Parameters:**

- **value**: `any`

_Returns_ `any`

---

### validate

```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions,
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a `DataModelValidationFailure` instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

_Inherited from [SchemaField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#validate)_

**Parameters:**

- **value**: `any`
- **options?**: `DataFieldValidationOptions` _(optional, default = {})_

_Returns_ `void | DataModelValidationFailure`  
Returns a `DataModelValidationFailure` if a validation failure occurred.

---

### values

```typescript
values(): DataField[]
```

An array of DataField instances which are present in the schema.

_Inherited from [SchemaField.values](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#values)_

_Returns_ `DataField[]`

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

_Inherited from [SchemaField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_applyChangeAdd)_

**Parameters:**

- **value**: `any` - The field's current value.
- **delta**: `any` - The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>` - The model instance.
- **change**: `EffectChangeData` - The original change data.

_Returns_ `any` - The updated value.

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

_Inherited from [SchemaField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_applyChangeCustom)_

**Parameters:**

- **value**: `any` - The field's current value.
- **delta**: `any` - The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>` - The model instance.
- **change**: `EffectChangeData` - The original change data.

_Returns_ `any` - The updated value.

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

_Inherited from [SchemaField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_applyChangeDowngrade)_

**Parameters:**

- **value**: `any` - The field's current value.
- **delta**: `any` - The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>` - The model instance.
- **change**: `EffectChangeData` - The original change data.

_Returns_ `any` - The updated value.

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

_Inherited from [SchemaField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_applyChangeMultiply)_

**Parameters:**

- **value**: `any` - The field's current value.
- **delta**: `any` - The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>` - The model instance.
- **change**: `EffectChangeData` - The original change data.

_Returns_ `any` - The updated value.

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

_Inherited from [SchemaField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_applyChangeOverride)_

**Parameters:**

- **value**: `any` - The field's current value.
- **delta**: `any` - The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>` - The model instance.
- **change**: `EffectChangeData` - The original change data.

_Returns_ `any` - The updated value.

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

_Inherited from [SchemaField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_applyChangeUpgrade)_

**Parameters:**

- **value**: `any` - The field's current value.
- **delta**: `any` - The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>` - The model instance.
- **change**: `EffectChangeData` - The original change data.

_Returns_ `any` - The updated value.

---

### _initialize

```typescript
_initialize(fields: DataSchema): DataSchema
```

Initialize and validate the structure of the provided field definitions.

_Inherited from [SchemaField._initialize](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_initialize)_

**Parameters:**

- **fields**: `DataSchema` - The provided field definitions.

_Returns_ `DataSchema` - The validated schema.

---

### _toInput

```typescript
_toInput(config: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element. Subclasses should implement this method rather than the public `toInput` method which wraps it.

_Inherited from [SchemaField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_toInput)_

**Parameters:**

- **config**: `FormInputConfig` - Form element configuration parameters.

_Returns_ `HTMLElement | HTMLCollection`

_Throws_:  
An Error if this DataField subclass does not support input rendering.

---

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like `null` or `undefined`.

_Inherited from [SchemaField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_validateSpecial)_

**Parameters:**

- **value**: `any` - The candidate value.

_Returns_ `boolean | void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

_Throws_:  
May throw a specific error if the value is not valid.

---

For more details and usage, visit the [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/classes/foundry.packages.PackageCompatibility.html).