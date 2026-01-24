# EmbeddedDocumentField | Foundry Virtual Tabletop - API Documentation - Version 13

A subclass of [foundry.data.fields.EmbeddedDataField](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html) which supports a single embedded Document.

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.EmbeddedDocumentField))

- *EmbeddedDataField*  
- **EmbeddedDocumentField**  
- *ActorDeltaField*

## Constructors

### constructor

```typescript
new EmbeddedDocumentField(
    model: typeof Document,
    options?: DataFieldOptions,
    context?: DataFieldContext,
): EmbeddedDocumentField
```

**Parameters**

- **model**: `typeof Document`  
  The type of Document which is embedded.  
  Optional
- **options**: `DataFieldOptions = {}`  
  Options which configure the behavior of the field.  
  Optional
- **context**: `DataFieldContext = {}`  
  Additional context which describes the field  
  Optional

**Returns**  
`EmbeddedDocumentField`

Overrides [EmbeddedDataField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#constructor).

## Properties

### fields

`fields: DataSchema`  
The contained field definitions.  
Inherited from [EmbeddedDataField.fields](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#fields).

### model

`model: typeof DataModel`  
The base DataModel definition which is contained in this field.  
Inherited from [EmbeddedDataField.model](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#model).

### options

`options: DataFieldOptions`  
The initially provided options which configure the data field.  
Inherited from [EmbeddedDataField.options](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#options).

### hierarchical

`hierarchical: boolean = true`  
Overrides [EmbeddedDataField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#hierarchical).

### recursive

`recursive: boolean = true`  
Inherited from [EmbeddedDataField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#recursive).

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

**Returns**  
`string`

Inherited from `EmbeddedDataField.fieldPath`.

### _defaults

```typescript
get _defaults(): DataFieldOptions & { nullable: boolean; required: boolean } & {
    nullable: boolean;
}
```

Default parameters for this field type.

**Returns**  
`DataFieldOptions & { nullable: boolean; required: boolean } & { nullable: boolean; }`

Overrides EmbeddedDataField._defaults.

### hasFormSupport

```typescript
get hasFormSupport(): boolean
```

Does this form field class have defined form support?

**Returns**  
`boolean`

Inherited from [EmbeddedDataField.hasFormSupport](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#hasFormSupport).

## Methods

### _addTypes

```typescript
_addTypes(source: any, changes: any, options?: {}): void
```

**Parameters**

- **source**: `any`  
- **changes**: `any`  
- **options**: `{}` = {}

**Returns**  
`void`

Inherited from [EmbeddedDataField._addTypes](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_addtypes).

---

### _cast

```typescript
_cast(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**  
`any`

Inherited from [EmbeddedDataField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_cast).

---

### _cleanType

```typescript
_cleanType(data: any, options?: {}): any
```

Apply any cleaning logic specific to this DataField type.

**Parameters**

- **data**: `any`  
  The appropriately coerced value.
- **options**: `{}` = {}  
  Additional options for how the field is cleaned.

**Returns**  
`any`  
The cleaned value.

Inherited from [EmbeddedDataField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_cleantype).

---

### _getField

```typescript
_getField(path: any): undefined | DataField | EmbeddedDocumentField
```

**Parameters**

- **path**: `any`

**Returns**  
`undefined` | `DataField` | `EmbeddedDocumentField`

Inherited from [EmbeddedDataField._getField](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_getfield).

---

### _updateCommit

```typescript
_updateCommit(source: any, key: any, value: any, diff: any, options: any): void
```

**Parameters**

- **source**: `any`  
- **key**: `any`  
- **value**: `any`  
- **diff**: `any`  
- **options**: `any`

**Returns**  
`void`

Inherited from [EmbeddedDataField._updateCommit](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_updatecommit).

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

**Parameters**

- **source**: `any`  
- **key**: `any`  
- **value**: `any`  
- **difference**: `any`  
- **options**: `any`

**Returns**  
`void`

Inherited from [EmbeddedDataField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_updatediff).

---

### _validateModel

```typescript
_validateModel(changes: any, options: any): void
```

**Parameters**

- **changes**: `any`  
- **options**: `any`

**Returns**  
`void`

Inherited from [EmbeddedDataField._validateModel](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_validatemodel).

---

### _validateType

```typescript
_validateType(data: any, options?: {}): undefined | DataModelValidationFailure
```

**Parameters**

- **data**: `any`  
- **options**: `{}` = {}

**Returns**  
`undefined` | `DataModelValidationFailure`

Inherited from [EmbeddedDataField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_validatetype).

---

### [iterator]

```typescript
"[iterator]"(): Generator<DataField, void, unknown>
```

Iterate over a SchemaField by iterating over its fields.

**Returns**  
`Generator<DataField, void, unknown>`

Inherited from [EmbeddedDataField.[iterator]](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#iterator).

---

### apply

```typescript
apply(fn: any, data?: {}, options?: {}): {}
```

**Parameters**

- **fn**: `any`  
- **data**: `{}` = {}  
- **options**: `{}` = {}

**Returns**  
`{}`

Inherited from [EmbeddedDataField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#apply).

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

**Parameters**

- **value**: `any`  
  The field's current value.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The change to apply.

**Returns**  
`any`  
The updated value.

Inherited from [EmbeddedDataField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#applychange).

---

### clean

```typescript
clean(value: any, options: any): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters**

- **value**: `any`  
  An initial requested value
- **options**: `any`  
  Additional options for how the field is cleaned

**Returns**  
`any`  
The cast value

Inherited from [EmbeddedDataField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#clean).

---

### entries

```typescript
entries(): [string, DataField][]
```

An array of [name, DataField] tuples which define the schema.

**Returns**  
`[string, DataField][]`

Inherited from [EmbeddedDataField.entries](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#entries).

---

### get

```typescript
get(fieldName: string): void | DataField
```

Get a DataField instance from the schema by name.

**Parameters**

- **fieldName**: `string`  
  The field name

**Returns**  
`void` | `DataField`  
The DataField instance or undefined

Inherited from [EmbeddedDataField.get](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#get).

---

### getCollection

```typescript
getCollection(
    parent: Document<object, DocumentConstructionContext>,
): Collection<string, Document<object, DocumentConstructionContext>>
```

Return the embedded document(s) as a Collection.

**Parameters**

- **parent**: `Document<object, DocumentConstructionContext>`  
  The parent document.

**Returns**  
`Collection<string, Document<object, DocumentConstructionContext>>`

---

### getField

```typescript
getField(fieldName: string | string[]): undefined | DataField
```

Traverse the schema, obtaining the DataField definition for a particular field.

**Parameters**

- **fieldName**: `string` | `string[]`  
  A field path like `["abilities", "strength"]` or `"abilities.strength"`

**Returns**  
`undefined` | `DataField`  
The corresponding DataField definition for that field, or undefined

Inherited from [EmbeddedDataField.getField](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#getField).

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

**Parameters**

- **data**: `any`

**Returns**  
`any`

Inherited from [EmbeddedDataField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#getInitialValue).

---

### has

```typescript
has(fieldName: string): boolean
```

Test whether a certain field name belongs to this schema definition.

**Parameters**

- **fieldName**: `string`  
  The field name

**Returns**  
`boolean`  
Does the named field exist in this schema?

Inherited from [EmbeddedDataField.has](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#has).

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

**Parameters**

- **value**: `any`  
- **model**: `any`  
- **options**: `{}` = {}

**Returns**  
`any`

Overrides [EmbeddedDataField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#initialize).

---

### keys

```typescript
keys(): string[]
```

An array of field names which are present in the schema.

**Returns**  
`string[]`

Inherited from [EmbeddedDataField.keys](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#keys).

---

### migrateSource

```typescript
migrateSource(sourceData: any, fieldData: any): void
```

**Parameters**

- **sourceData**: `any`  
- **fieldData**: `any`

**Returns**  
`void`

Inherited from [EmbeddedDataField.migrateSource](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#migrateSource).

---

### toFormGroup

```typescript
toFormGroup(
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```

Render this DataField as a standardized form-group element.

**Parameters**

- **groupConfig**: `FormGroupConfig = {}`  
  Configuration options passed to the wrapping form-group
- **inputConfig**: `FormInputConfig = {}`  
  Input element configuration options passed to DataField#toInput

**Returns**  
`HTMLDivElement`  
The rendered form group element

Inherited from [EmbeddedDataField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#toFormGroup).

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters**

- **config**: `FormInputConfig = {}`  
  Form element configuration parameters

**Returns**  
`HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field

**Throws**  
An Error if this DataField subclass does not support input rendering

Inherited from [EmbeddedDataField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#toInput).

---

### toObject

```typescript
toObject(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**  
`any`

Inherited from [EmbeddedDataField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#toObject).

---

### validate

```typescript
validate(value: any, options: any): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

**Parameters**

- **value**: `any`  
  The initial value
- **options**: `any`  
  Options which affect validation behavior

**Returns**  
`void` | `DataModelValidationFailure`  
Returns a DataModelValidationFailure if a validation failure occurred.

Inherited from [EmbeddedDataField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#validate).

---

### values

```typescript
values(): DataField[]
```

An array of DataField instances which are present in the schema.

**Returns**  
`DataField[]`

Inherited from [EmbeddedDataField.values](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#values).

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

**Parameters**

- **value**: `any`  
  The field's current value.
- **delta**: `any`  
  The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The original change data.

**Returns**  
`any`  
The updated value.

Inherited from [EmbeddedDataField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_applyChangeAdd).

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

**Parameters**

- **value**: `any`  
  The field's current value.
- **delta**: `any`  
  The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The original change data.

**Returns**  
`any`  
The updated value.

Inherited from [EmbeddedDataField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_applyChangeCustom).

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

**Parameters**

- **value**: `any`  
  The field's current value.
- **delta**: `any`  
  The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The original change data.

**Returns**  
`any`  
The updated value.

Inherited from [EmbeddedDataField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_applyChangeDowngrade).

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

**Parameters**

- **value**: `any`  
  The field's current value.
- **delta**: `any`  
  The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The original change data.

**Returns**  
`any`  
The updated value.

Inherited from [EmbeddedDataField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_applyChangeMultiply).

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

**Parameters**

- **value**: `any`  
  The field's current value.
- **delta**: `any`  
  The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The original change data.

**Returns**  
`any`  
The updated value.

Inherited from [EmbeddedDataField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_applyChangeOverride).

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

**Parameters**

- **value**: `any`  
  The field's current value.
- **delta**: `any`  
  The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The original change data.

**Returns**  
`any`  
The updated value.

Inherited from [EmbeddedDataField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_applyChangeUpgrade).

---

### _initialize

```typescript
protected _initialize(fields: DataSchema): DataSchema
```

Initialize and validate the structure of the provided field definitions.

**Parameters**

- **fields**: `DataSchema`  
  The provided field definitions

**Returns**  
`DataSchema`  
The validated schema

Inherited from [EmbeddedDataField._initialize](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_initialize).

---

### _toInput

```typescript
protected _toInput(config: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element. Subclasses should implement this method rather than the public toInput method which wraps it.

**Parameters**

- **config**: `FormInputConfig`  
  Form element configuration parameters

**Returns**  
`HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field

**Throws**  
An Error if this DataField subclass does not support input rendering.

Inherited from [EmbeddedDataField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_toInput).

---

### _validateSpecial

```typescript
protected _validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.

**Parameters**

- **value**: `any`  
  The candidate value

**Returns**  
`boolean | void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**  
May throw a specific error if the value is not valid.

Inherited from [EmbeddedDataField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedDataField.html#_validateSpecial).