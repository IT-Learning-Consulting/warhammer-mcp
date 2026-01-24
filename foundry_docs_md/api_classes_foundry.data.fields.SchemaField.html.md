# SchemaField | Foundry Virtual Tabletop - API Documentation - Version 13

A special class of [foundry.data.fields.DataField](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html) which defines a data schema.

## Hierarchy
- _DataField_  
- **SchemaField**  
  - _DocumentStatsField_  
  - _EmbeddedDataField_  
  - _TextureData_  
  - _PackageCompatibility_  
  - _RelatedPackage_  
  - _PackageRelationships_  

---

## Constructors

### constructor

```typescript
new SchemaField(
    fields: DataSchema,
    options?: DataFieldOptions,
    context?: DataFieldContext = {}
): SchemaField
```

**Parameters**

- **fields**: `DataSchema`  
  The contained field definitions.

- **options**?: `DataFieldOptions`  
  Options which configure the behavior of the field.

- **context**?: `DataFieldContext = {}`  
  Additional context which describes the field.

**Returns**  
`SchemaField`  

Overrides [DataField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#constructor).

---

## Properties

### fields

`fields: DataSchema`

The contained field definitions.

### options

`options: DataFieldOptions`

The initially provided options which configure the data field.  
Inherited from [DataField.options](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#options).

---

## Static Properties

### hierarchical

`hierarchical: boolean = false`

Whether this field defines part of a Document/Embedded Document hierarchy.

### recursive

`recursive: boolean = true`

Overrides [DataField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#recursive).

---

## Accessors

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.  
Inherited from DataField.fieldPath.

**Returns**  
`string`

### _defaults

```typescript
get _defaults(): DataFieldOptions & { nullable: boolean; required: boolean; }
```

Default parameters for this field type. Overrides DataField._defaults.

**Returns**  
`DataFieldOptions & { nullable: boolean; required: boolean }`

### hasFormSupport

```typescript
get hasFormSupport(): boolean
```

Does this form field class have defined form support?  
Inherited from DataField.hasFormSupport.

**Returns**  
`boolean`

---

## Methods

### _addTypes

```typescript
_addTypes(source: any, changes: any, options?: {}): void
```

Overrides [DataField._addTypes](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_addtypes).

**Parameters**  
- **source**: `any`  
- **changes**: `any`  
- **options**: `{}` = {}

**Returns**  
`void`

---

### _cast

```typescript
_cast(value: any): any
```

Overrides [DataField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cast).

**Parameters**  
- **value**: `any`

**Returns**  
`any`

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

Overrides [DataField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cleantype).

---

### _getField

```typescript
_getField(path: any): undefined | SchemaField | DataField
```

Overrides [DataField._getField](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_getfield).

**Parameters**  
- **path**: `any`

**Returns**  
`undefined | SchemaField | DataField`

---

### _updateCommit

```typescript
_updateCommit(source: any, key: any, value: any, diff: any, options: any): void
```

Overrides [DataField._updateCommit](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_updatecommit).

**Parameters**  
- **source**: `any`  
- **key**: `any`  
- **value**: `any`  
- **diff**: `any`  
- **options**: `any`

**Returns**  
`void`

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

Overrides [DataField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_updatediff).

---

### _validateModel

```typescript
_validateModel(changes: any, options?: {}): void
```

Overrides [DataField._validateModel](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatemodel).

**Parameters**  
- **changes**: `any`  
- **options**: `{}` = {}

**Returns**  
`void`

---

### _validateType

```typescript
_validateType(data: any, options?: {}): undefined | DataModelValidationFailure
```

Overrides [DataField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatetype).

**Parameters**  
- **data**: `any`  
- **options**: `{}` = {}

**Returns**  
`undefined | DataModelValidationFailure`

---

### [iterator]

```typescript
"[iterator]"(): Generator<DataField, void, unknown>
```

Iterate over a SchemaField by iterating over its fields.

**Returns**  
`Generator<DataField, void, unknown>`

---

### apply

```typescript
apply(fn: any, data?: {}, options?: {}): {}
```

Overrides [DataField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#apply).

**Parameters**  
- **fn**: `any`  
- **data**: `{}` = {}  
- **options**: `{}` = {}

**Returns**  
`{}`

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
Inherited from [DataField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#applychange).

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

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.  
Inherited from [DataField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#clean).

**Parameters**  
- **value**: `any`  
  An initial requested value (Optional)  
- **options**: `{ partial?: boolean; source?: object }` = {}  
  Additional options for how the field is cleaned (Optional)  
  - **partial**?: `boolean`  
    Whether to perform partial cleaning?  
  - **source**?: `object`  
    The root data model being cleaned.

**Returns**  
`any`  
The cast value.

---

### entries

```typescript
entries(): [string, DataField][]
```

An array of [name, DataField] tuples which define the schema.

**Returns**  
`[string, DataField][]`

---

### get

```typescript
get(fieldName: string): void | DataField
```

Get a DataField instance from the schema by name.

**Parameters**  
- **fieldName**: `string`  
  The field name.

**Returns**  
`void | DataField`  
The DataField instance or undefined.

---

### getField

```typescript
getField(fieldName: string | string[]): undefined | DataField
```

Traverse the schema, obtaining the DataField definition for a particular field.

**Parameters**  
- **fieldName**: `string | string[]`  
  A field path like `["abilities", "strength"]` or `"abilities.strength"`.

**Returns**  
`undefined | DataField`  
The corresponding DataField definition for that field, or undefined.

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

Overrides [DataField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#getinitialvalue).

**Parameters**  
- **data**: `any`

**Returns**  
`any`

---

### has

```typescript
has(fieldName: string): boolean
```

Test whether a certain field name belongs to this schema definition.

**Parameters**  
- **fieldName**: `string`  
  The field name.

**Returns**  
`boolean`  
Does the named field exist in this schema?

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

Overrides [DataField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#initialize).

**Parameters**  
- **value**: `any`  
- **model**: `any`  
- **options**: `{}` = {}

**Returns**  
`any`

---

### keys

```typescript
keys(): string[]
```

An array of field names which are present in the schema.

**Returns**  
`string[]`

---

### migrateSource

```typescript
migrateSource(sourceData: object, fieldData: any): void
```

Migrate this field's candidate source data.

**Parameters**  
- **sourceData**: `object`  
  Candidate source data of the root model.  
- **fieldData**: `any`  
  The value of this field within the source data.

**Returns**  
`void`

---

### toFormGroup

```typescript
toFormGroup(
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```

Render this DataField as a standardized form-group element.  
Inherited from [DataField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toformgroup).

**Parameters**  
- **groupConfig**?: `FormGroupConfig` = {}  
  Configuration options passed to the wrapping form-group  
- **inputConfig**?: `FormInputConfig` = {}  
  Input element configuration options passed to DataField#toInput

**Returns**  
`HTMLDivElement`  
The rendered form group element.

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.  
Inherited from [DataField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toinput).

**Parameters**  
- **config**?: `FormInputConfig` = {}  
  Form element configuration parameters.

**Returns**  
`HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field.

**Throws**  
An Error if this DataField subclass does not support input rendering.

---

### toObject

```typescript
toObject(value: any): any
```

Overrides [DataField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toobject).

**Parameters**  
- **value**: `any`

**Returns**  
`any`

---

### validate

```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions,
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.  
Inherited from [DataField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#validate).

**Parameters**  
- **value**: `any` (Optional)  
  The initial value  
- **options**?: `DataFieldValidationOptions` = {}  
  Options which affect validation behavior.

**Returns**  
`void | DataModelValidationFailure`  
Returns a DataModelValidationFailure if a validation failure occurred.

---

### values

```typescript
values(): DataField[]
```

An array of DataField instances which are present in the schema.

**Returns**  
`DataField[]`

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
Inherited from [DataField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeadd).

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
Inherited from [DataField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangecustom).

**Parameters**  
- **value**: `any`  
- **delta**: `any`  
- **model**: `DataModel<object, DataModelConstructionContext>`  
- **change**: `EffectChangeData`

**Returns**  
`any`

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
Inherited from [DataField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangedowngrade).

**Parameters**  
- **value**: `any`  
- **delta**: `any`  
- **model**: `DataModel<object, DataModelConstructionContext>`  
- **change**: `EffectChangeData`

**Returns**  
`any`

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
Inherited from [DataField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangemultiply).

**Parameters**  
- **value**: `any`  
- **delta**: `any`  
- **model**: `DataModel<object, DataModelConstructionContext>`  
- **change**: `EffectChangeData`

**Returns**  
`any`

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
Inherited from [DataField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeoverride).

**Parameters**  
- **value**: `any`  
- **delta**: `any`  
- **model**: `DataModel<object, DataModelConstructionContext>`  
- **change**: `EffectChangeData`

**Returns**  
`any`

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
Inherited from [DataField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeupgrade).

**Parameters**  
- **value**: `any`  
- **delta**: `any`  
- **model**: `DataModel<object, DataModelConstructionContext>`  
- **change**: `EffectChangeData`

**Returns**  
`any`

---

### _initialize

```typescript
_initialize(fields: DataSchema): DataSchema
```

Initialize and validate the structure of the provided field definitions.

**Parameters**  
- **fields**: `DataSchema`  
  The provided field definitions.

**Returns**  
`DataSchema`  
The validated schema.

---

### _toInput

```typescript
_toInput(config: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element. Subclasses should implement this method rather than the public toInput method which wraps it.  
Inherited from [DataField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_toinput).

**Parameters**  
- **config**: `FormInputConfig`  
  Form element configuration parameters.

**Returns**  
`HTMLElement | HTMLCollection`

**Throws**  
An Error if this DataField subclass does not support input rendering.

---

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.  
Inherited from [DataField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatespecial).

**Parameters**  
- **value**: `any`  
  The candidate value.

**Returns**  
`boolean | void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**  
May throw a specific error if the value is not valid.

---

For more information, visit the [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html).