# EmbeddedDataField

A subclass of [foundry.data.fields.SchemaField](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html) which embeds some other DataModel definition as an inner object.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.EmbeddedDataField)  
- *SchemaField*  
- **EmbeddedDataField**  
- *EmbeddedDocumentField*  

---

## Constructors

### constructor

```typescript
new EmbeddedDataField(
    model: typeof DataModel,
    options?: DataFieldOptions,
    context?: DataFieldContext,
): EmbeddedDataField
```

**Parameters:**

- **model**: `typeof DataModel`  
  The class of DataModel which should be embedded in this field  
  Optional

- **options**: `DataFieldOptions` = {}  
  Options which configure the behavior of the field  
  Optional

- **context**: `DataFieldContext` = {}  
  Additional context which describes the field  
  Optional

**Returns:**  
`EmbeddedDataField`

Overrides [SchemaField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#constructor)

---

## Properties

### fields

**Type:** [DataSchema](https://foundryvtt.com/api/types/foundry.abstract.types.DataSchema.html)  
The contained field definitions.

Inherited from [SchemaField.fields](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#fields)

---

### model

**Type:** `typeof DataModel`  
The base DataModel definition which is contained in this field.

---

### options

**Type:** [DataFieldOptions](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldOptions.html)  
The initially provided options which configure the data field

Inherited from [SchemaField.options](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#options)

---

## Accessors

### static hierarchical

```typescript
static hierarchical: boolean = false
```

Whether this field defines part of a Document/Embedded Document hierarchy.

Inherited from [SchemaField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#hierarchical)

---

### static recursive

```typescript
static recursive: boolean = true
```

Inherited from [SchemaField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#recursive)

---

### get fieldPath()

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

**Returns:**  
`string`

Inherited from SchemaField.fieldPath

---

### static get _defaults()

```typescript
static get _defaults(): DataFieldOptions & { nullable: boolean; required: boolean }
```

Default parameters for this field type

**Returns:**  
`DataFieldOptions & { nullable: boolean; required: boolean }`

Inherited from SchemaField._defaults

---

### get hasFormSupport()

```typescript
get hasFormSupport(): boolean
```

Does this form field class have defined form support?

**Returns:**  
`boolean`

Inherited from SchemaField.hasFormSupport

---

## Methods

### _addTypes

```typescript
_addTypes(source: any, changes: any, options?: {}): void
```

**Parameters:**

- **source**: `any`  
- **changes**: `any`  
- **options**: `{}` = {}

**Returns:**  
void

Inherited from [SchemaField._addTypes](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_addtypes)

---

### _cast

```typescript
_cast(value: any): any
```

**Parameters:**

- **value**: `any`

**Returns:**  
`any`

Overrides [SchemaField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_cast)

---

### _cleanType

```typescript
_cleanType(data: any, options?: {}): any
```

Apply any cleaning logic specific to this DataField type.

**Parameters:**

- **data**: `any`  
  The appropriately coerced value.

- **options**: `{}` = {}  
  Additional options for how the field is cleaned.

**Returns:**  
`any`  
The cleaned value.

Inherited from [SchemaField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_cleantype)

---

### _getField

```typescript
_getField(path: any): undefined | DataField | EmbeddedDataField
```

**Parameters:**

- **path**: `any`

**Returns:**  
`undefined` | `DataField` | `EmbeddedDataField`

Inherited from [SchemaField._getField](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_getfield)

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

**Returns:**  
void

Inherited from [SchemaField._updateCommit](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_updatecommit)

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

The SchemaField#update method plays a special role of recursively dispatching DataField#update operations to the constituent fields within the schema.

**Parameters:**

- **source**: `any`  
- **key**: `any`  
- **value**: `any`  
- **difference**: `any`  
- **options**: `any`

**Returns:**  
void

Inherited from [SchemaField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_updatediff)

---

### _validateModel

```typescript
_validateModel(changes: any, options: any): void
```

**Parameters:**

- **changes**: `any`  
- **options**: `any`

**Returns:**  
void

Overrides [SchemaField._validateModel](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_validatemodel)

---

### _validateType

```typescript
_validateType(data: any, options?: {}): undefined | DataModelValidationFailure
```

**Parameters:**

- **data**: `any`
- **options**: `{}` = {}

**Returns:**  
`undefined` | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)

Inherited from [SchemaField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_validatetype)

---

### [iterator]

```typescript
"[iterator]"(): Generator<DataField, void, unknown>
```

Iterate over a SchemaField by iterating over its fields.

**Returns:**  
`Generator<DataField, void, unknown>`

Inherited from [SchemaField.[iterator]](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#iterator)

---

### apply

```typescript
apply(fn: any, data?: {}, options?: {}): {}
```

**Parameters:**

- **fn**: `any`  
- **data**: `{}` = {}  
- **options**: `{}` = {}

**Returns:**  
`{}`

Inherited from [SchemaField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#apply)

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

**Parameters:**

- **value**: `any`  
  The field's current value.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
  The change to apply.

**Returns:**  
`any`  
The updated value.

Inherited from [SchemaField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#applychange)

---

### clean

```typescript
clean(value: any, options: any): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters:**

- **value**: `any`  
  An initial requested value

- **options**: `any`  
  Additional options for how the field is cleaned

**Returns:**  
`any`  
The cast value

Overrides [SchemaField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#clean)

---

### entries

```typescript
entries(): [string, DataField][]
```

An array of [name, DataField] tuples which define the schema.

**Returns:**  
`[string, DataField][]`

Inherited from [SchemaField.entries](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#entries)

---

### get

```typescript
get(fieldName: string): void | DataField
```

Get a DataField instance from the schema by name.

**Parameters:**

- **fieldName**: `string`  
  The field name

**Returns:**  
`void` | `DataField`  
The DataField instance or undefined

Inherited from [SchemaField.get](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#get)

---

### getField

```typescript
getField(fieldName: string | string[]): undefined | DataField
```

Traverse the schema, obtaining the DataField definition for a particular field.

**Parameters:**

- **fieldName**: `string` | `string[]`  
  A field path like ["abilities", "strength"] or "abilities.strength"

**Returns:**  
`undefined` | `DataField`  
The corresponding DataField definition for that field, or undefined

Inherited from [SchemaField.getField](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#getfield)

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

**Parameters:**

- **data**: `any`

**Returns:**  
`any`

Inherited from [SchemaField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#getinitialvalue)

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

Inherited from [SchemaField.has](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#has)

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

**Parameters:**

- **value**: `any`  
- **model**: `any`  
- **options**: `{}` = {}

**Returns:**  
`any`

Overrides [SchemaField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#initialize)

---

### keys

```typescript
keys(): string[]
```

An array of field names which are present in the schema.

**Returns:**  
`string[]`

Inherited from [SchemaField.keys](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#keys)

---

### migrateSource

```typescript
migrateSource(sourceData: any, fieldData: any): void
```

**Parameters:**

- **sourceData**: `any`  
- **fieldData**: `any`

**Returns:**  
void

Overrides [SchemaField.migrateSource](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#migratesource)

---

### toFormGroup

```typescript
toFormGroup(
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```

Render this DataField as a standardized form-group element.

**Parameters:**

- **groupConfig**: [FormGroupConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormGroupConfig.html) = {}  
  Configuration options passed to the wrapping form-group

- **inputConfig**: [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html) = {}  
  Input element configuration options passed to DataField#toInput

**Returns:**  
`HTMLDivElement`

Inherited from [SchemaField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#toformgroup)

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters:**

- **config**: [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html) = {}  
  Form element configuration parameters

**Returns:**  
`HTMLElement` | `HTMLCollection`  
A rendered HTMLElement for the field

**Throws:**  
An Error if this DataField subclass does not support input rendering

Inherited from [SchemaField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#toinput)

---

### toObject

```typescript
toObject(value: any): any
```

**Parameters:**

- **value**: `any`

**Returns:**  
`any`

Overrides [SchemaField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#toobject)

---

### validate

```typescript
validate(value: any, options: any): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

**Parameters:**

- **value**: `any`  
  The initial value

- **options**: `any`  
  Options which affect validation behavior

**Returns:**  
`void` | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)  
Returns a DataModelValidationFailure if a validation failure occurred.

Overrides [SchemaField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#validate)

---

### values

```typescript
values(): DataField[]
```

An array of DataField instances which are present in the schema.

**Returns:**  
`DataField[]`

Inherited from [SchemaField.values](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#values)

---

## Protected Methods

### _applyChangeAdd

```typescript
protected _applyChangeAdd(
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

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
  The original change data.

**Returns:**  
`any`  
The updated value.

Inherited from [SchemaField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_applychangeadd)

---

### _applyChangeCustom

```typescript
protected _applyChangeCustom(
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

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
  The original change data.

**Returns:**  
`any`  
The updated value.

Inherited from [SchemaField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_applychangecustom)

---

### _applyChangeDowngrade

```typescript
protected _applyChangeDowngrade(
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

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
  The original change data.

**Returns:**  
`any`  
The updated value.

Inherited from [SchemaField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_applychangedowngrade)

---

### _applyChangeMultiply

```typescript
protected _applyChangeMultiply(
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

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
  The original change data.

**Returns:**  
`any`  
The updated value.

Inherited from [SchemaField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_applychangemultiply)

---

### _applyChangeOverride

```typescript
protected _applyChangeOverride(
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

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
  The original change data.

**Returns:**  
`any`  
The updated value.

Inherited from [SchemaField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_applychangeoverride)

---

### _applyChangeUpgrade

```typescript
protected _applyChangeUpgrade(
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

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
  The original change data.

**Returns:**  
`any`  
The updated value.

Inherited from [SchemaField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_applychangeupgrade)

---

### _initialize

```typescript
protected _initialize(fields: DataSchema): DataSchema
```

Initialize and validate the structure of the provided field definitions.

**Parameters:**

- **fields**: [DataSchema](https://foundryvtt.com/api/types/foundry.abstract.types.DataSchema.html)  
  The provided field definitions

**Returns:**  
`DataSchema`  
The validated schema

Inherited from [SchemaField._initialize](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_initialize)

---

### _toInput

```typescript
protected _toInput(config: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element. Subclasses should implement this method rather than the public toInput method which wraps it.

**Parameters:**

- **config**: [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html)  
  Form element configuration parameters

**Returns:**  
`HTMLElement` | `HTMLCollection`  
A rendered HTMLElement for the field

**Throws:**  
An Error if this DataField subclass does not support input rendering

Inherited from [SchemaField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_toinput)

---

### _validateSpecial

```typescript
protected _validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.

**Parameters:**

- **value**: `any`  
  The candidate value

**Returns:**  
`boolean` | `void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws:**  
May throw a specific error if the value is not valid

Inherited from [SchemaField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html#_validatespecial)