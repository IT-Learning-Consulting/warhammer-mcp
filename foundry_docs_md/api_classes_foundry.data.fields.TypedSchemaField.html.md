# TypedSchemaField

A subclass of [foundry.data.fields.DataField](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html) which allows to typed schemas.

[Hierarchy (View Summary, Expand)](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.TypedSchemaField)

- *DataField*  
- **TypedSchemaField**

---

## Constructors

### constructor

```typescript
new TypedSchemaField(
  types: Record<string, typeof import("foundry").DataModel | import("foundry").SchemaField | import("foundry").DataSchema>, 
  options?: import("foundry").DataFieldOptions, 
  context?: import("foundry").DataFieldContext
): TypedSchemaField
```

**Parameters:**

- **types**: `Record<string, typeof DataModel | SchemaField | DataSchema>`  
  The different types this field can represent.

- **options** *(optional)*: `DataFieldOptions`  
  Options for configuring the field.

- **context** *(optional)*: `DataFieldContext`  
  Additional context describing the field.

**Returns:**  
`TypedSchemaField`

*Overrides* [DataField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#constructor)

---

## Properties

### options

`options: DataFieldOptions`  
The initially provided options which configure the data field.

*Inherited from* [DataField.options](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#options)

### types

`types: { [type: string]: SchemaField }`  
The types of this field.

### hierarchical (static)

`hierarchical: boolean = false`  
Whether this field defines part of a Document/Embedded Document hierarchy.

*Inherited from* [DataField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#hierarchical)

### recursive (static)

`recursive: boolean = true`  
Overrides [DataField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#recursive)

---

## Accessors

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

*Inherited from* DataField.fieldPath

### _defaults (static)

```typescript
get _defaults(): DataFieldOptions & { required: boolean }
```

Default parameters for this field type.

*Overrides* DataField._defaults

### hasFormSupport (static)

```typescript
get hasFormSupport(): boolean
```

Does this form field class have defined form support?

*Inherited from* DataField.hasFormSupport

---

## Methods

### _addTypes

```typescript
_addTypes(source: any, changes: any, options?: {}): void
```

Overrides [DataField._addTypes](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_addtypes)

**Parameters:**

- **source**: `any`  
- **changes**: `any`  
- **options** *(optional)*: `{}` = `{}`  

**Returns:** `void`

---

### _cast

```typescript
_cast(value: any): any
```

Overrides [DataField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cast)

**Parameters:**

- **value**: `any`  

**Returns:** `any`

---

### _cleanType

```typescript
_cleanType(value: any, options: any): any
```

Overrides [DataField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cleantype)

**Parameters:**

- **value**: `any`  
- **options**: `any`  

**Returns:** `any`

---

### _getField

```typescript
_getField(path: any): undefined | SchemaField | DataField | TypedSchemaField
```

Overrides [DataField._getField](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_getfield)

**Parameters:**

- **path**: `any`  

**Returns:**  
`undefined | SchemaField | DataField | TypedSchemaField`

---

### _validateSpecial

```typescript
_validateSpecial(value: any): undefined | boolean
```

Overrides [DataField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatespecial)

**Parameters:**

- **value**: `any`  

**Returns:**  
`undefined | boolean`

---

### _validateType

```typescript
_validateType(value: any, options: any): void | import("foundry").DataModelValidationFailure
```

Overrides [DataField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatetype)

**Parameters:**

- **value**: `any`  
- **options**: `any`  

**Returns:**  
`void | DataModelValidationFailure`

---

### apply

```typescript
apply(fn: any, data?: {}, options?: {}): {}
```

Overrides [DataField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#apply)

**Parameters:**

- **fn**: `any`  
- **data** *(optional)*: `{}` = `{}`  
- **options** *(optional)*: `{}` = `{}`  

**Returns:** `{}`

---

### applyChange

```typescript
applyChange(
  value: any,
  model: import("foundry").DataModel<object, import("foundry").DataModelConstructionContext>,
  change: import("foundry").EffectChangeData
): any
```

Apply an ActiveEffectChange to this field.

**Parameters:**

- **value**: `any`  
  The field's current value.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The change to apply.

**Returns:** `any`  
The updated value.

*Inherited from* [DataField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#applychange)

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters:**

- **value**: `any`  
  An initial requested value.

- **options** *(optional)*: `{ partial?: boolean; source?: object }` = `{}`  
  Additional options for how the field is cleaned.
  
  - **partial** *(optional)*: `boolean`  
    Whether to perform partial cleaning.

  - **source** *(optional)*: `object`  
    The root data model being cleaned.

**Returns:** `any`  
The cast value.

*Inherited from* [DataField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#clean)

---

### getInitialValue

```typescript
getInitialValue(data: object): any
```

Attempt to retrieve a valid initial value for the DataField.

**Parameters:**

- **data**: `object`  
  The source data object for which an initial value is required.

**Returns:** `any`  
A proposed initial value.

*Inherited from* [DataField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#getinitialvalue)

---

### initialize

```typescript
initialize(value: any, model: any, options: any): any
```

Overrides [DataField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#initialize)

**Parameters:**

- **value**: `any`  
- **model**: `any`  
- **options**: `any`  

**Returns:** `any`

---

### migrateSource

```typescript
migrateSource(sourceData: object, fieldData: any): void
```

Migrate this field's candidate source data.

**Parameters:**

- **sourceData**: `object`  
  Candidate source data of the root model.

- **fieldData**: `any`  
  The value of this field within the source data.

**Returns:** `void`

---

### toFormGroup

```typescript
toFormGroup(
  groupConfig?: import("foundry").FormGroupConfig,
  inputConfig?: import("foundry").FormInputConfig
): HTMLDivElement
```

Render this DataField as a standardized form-group element.

**Parameters:**

- **groupConfig** *(optional)*: `FormGroupConfig` = `{}`  
  Configuration options passed to the wrapping form-group.

- **inputConfig** *(optional)*: `FormInputConfig` = `{}`  
  Input element configuration options passed to DataField#toInput.

**Returns:** `HTMLDivElement`  
The rendered form group element.

*Inherited from* [DataField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toformgroup)

---

### toInput

```typescript
toInput(config?: import("foundry").FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters:**

- **config** *(optional)*: `FormInputConfig` = `{}`  
  Form element configuration parameters.

**Returns:** `HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field.

**Throws:**  
An Error if this DataField subclass does not support input rendering.

*Inherited from* [DataField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toinput)

---

### toObject

```typescript
toObject(value: any): any
```

Overrides [DataField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toobject)

**Parameters:**

- **value**: `any`

**Returns:** `any`

---

### validate

```typescript
validate(
  value: any,
  options?: import("foundry").DataFieldValidationOptions
): void | import("foundry").DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

**Parameters:**

- **value**: `any`  
  The initial value.

- **options** *(optional)*: `DataFieldValidationOptions` = `{}`  
  Options which affect validation behavior.

**Returns:**  
`void | DataModelValidationFailure`

*Inherited from* [DataField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#validate)

---

## Protected Methods

### _applyChangeAdd

```typescript
protected _applyChangeAdd(
  value: any,
  delta: any,
  model: import("foundry").DataModel<object, import("foundry").DataModelConstructionContext>,
  change: import("foundry").EffectChangeData
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

**Returns:** `any`  
The updated value.

*Inherited from* [DataField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeadd)

---

### _applyChangeCustom

```typescript
protected _applyChangeCustom(
  value: any,
  delta: any,
  model: import("foundry").DataModel<object, import("foundry").DataModelConstructionContext>,
  change: import("foundry").EffectChangeData
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

**Returns:** `any`  
The updated value.

*Inherited from* [DataField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangecustom)

---

### _applyChangeDowngrade

```typescript
protected _applyChangeDowngrade(
  value: any,
  delta: any,
  model: import("foundry").DataModel<object, import("foundry").DataModelConstructionContext>,
  change: import("foundry").EffectChangeData
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

**Returns:** `any`  
The updated value.

*Inherited from* [DataField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangedowngrade)

---

### _applyChangeMultiply

```typescript
protected _applyChangeMultiply(
  value: any,
  delta: any,
  model: import("foundry").DataModel<object, import("foundry").DataModelConstructionContext>,
  change: import("foundry").EffectChangeData
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

**Returns:** `any`  
The updated value.

*Inherited from* [DataField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangemultiply)

---

### _applyChangeOverride

```typescript
protected _applyChangeOverride(
  value: any,
  delta: any,
  model: import("foundry").DataModel<object, import("foundry").DataModelConstructionContext>,
  change: import("foundry").EffectChangeData
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

**Returns:** `any`  
The updated value.

*Inherited from* [DataField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeoverride)

---

### _applyChangeUpgrade

```typescript
protected _applyChangeUpgrade(
  value: any,
  delta: any,
  model: import("foundry").DataModel<object, import("foundry").DataModelConstructionContext>,
  change: import("foundry").EffectChangeData
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

**Returns:** `any`  
The updated value.

*Inherited from* [DataField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeupgrade)

---

### _toInput

```typescript
protected _toInput(config: import("foundry").FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element. Subclasses should implement this method rather than the public `toInput` method which wraps it.

**Parameters:**

- **config**: `FormInputConfig`  
  Form element configuration parameters.

**Returns:** `HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field.

**Throws:**  
An Error if this DataField subclass does not support input rendering.

*Inherited from* [DataField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_toinput)

---

[Back to Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)