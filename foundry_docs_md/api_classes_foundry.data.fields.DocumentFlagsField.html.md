# DocumentFlagsField | Foundry Virtual Tabletop - API Documentation - Version 13

A subclass of [foundry.data.fields.TypedObjectField](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html) that is used specifically for the Document "flags" field.

## Hierarchy
- _[TypedObjectField](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html)_
- **DocumentFlagsField**

---

## Constructors

### constructor

```typescript
new DocumentFlagsField(
    options?: DataFieldOptions,
    context?: DataFieldContext,
): DocumentFlagsField
```

**Parameters**

- **options**: `DataFieldOptions`  
  Options which configure the behavior of the field

- **context**: `DataFieldContext`  
  Additional context which describes the field

**Returns**  
`DocumentFlagsField`

Overrides [TypedObjectField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#constructor)

---

## Properties

### element

`element: DataField`

The value type of each entry in this object.

Inherited from [TypedObjectField.element](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#element)

### options

`options: DataFieldOptions`

The initially provided options which configure the data field.

Inherited from [TypedObjectField.options](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#options)

---

## Static Properties

### hierarchical

```typescript
static hierarchical: boolean = false
```

Whether this field defines part of a Document/Embedded Document hierarchy.

Inherited from [TypedObjectField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#hierarchical)

### recursive

```typescript
static recursive: boolean = true
```

Inherited from [TypedObjectField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#recursive)

---

## Accessors

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

**Returns**  
`string`

Inherited from TypedObjectField.fieldPath

---

## Static Accessors

### _defaults

```typescript
static get _defaults(): object & { validateKey: (id: string) => void }
```

Default parameters for this field type

- **validateKey**: `(id: string) => void`

Overrides TypedObjectField._defaults

### hasFormSupport

```typescript
static get hasFormSupport(): boolean
```

Does this form field class have defined form support?

**Returns**  
`boolean`

Inherited from TypedObjectField.hasFormSupport

---

## Methods

### _addTypes

```typescript
_addTypes(source: any, changes: any, options?: {}): void
```

**Parameters**

- **source**: `any`
- **changes**: `any`
- **options?**: `{}` = {}

**Returns**  
`void`

Inherited from [TypedObjectField._addTypes](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_addTypes)

---

### _cast

```typescript
_cast(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**  
`any`

Inherited from [TypedObjectField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_cast)

---

### _cleanType

```typescript
_cleanType(data: any, options: any): any
```

**Parameters**

- **data**: `any`
- **options**: `any`

**Returns**  
`any`

Inherited from [TypedObjectField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_cleanType)

---

### _getField

```typescript
_getField(path: any): undefined | DataField | DocumentFlagsField
```

**Parameters**

- **path**: `any`

**Returns**  
`undefined ` | `DataField` | `DocumentFlagsField`

Inherited from [TypedObjectField._getField](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_getField)

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

Inherited from [TypedObjectField._updateCommit](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_updateCommit)

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

**Parameters**

- **source**: `any`
- **key**: `any`
- **value**: `any`
- **difference**: `any`
- **options**: `any`

**Returns**  
`void`

Inherited from [TypedObjectField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_updateDiff)

---

### _validateModel

```typescript
_validateModel(changes: any, options?: {}): void
```

**Parameters**

- **changes**: `any`
- **options?**: `{}` = {}

**Returns**  
`void`

Inherited from [TypedObjectField._validateModel](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_validateModel)

---

### _validateType

```typescript
_validateType(data: any, options?: {}): undefined | DataModelValidationFailure
```

**Parameters**

- **data**: `any`
- **options?**: `{}` = {}

**Returns**  
`undefined` | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)

Inherited from [TypedObjectField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_validateType)

---

### apply

```typescript
apply(fn: any, data?: {}, options?: {}): {}
```

**Parameters**

- **fn**: `any`
- **data?**: `{}` = {}
- **options?**: `{}` = {}

**Returns**  
`{}`

Inherited from [TypedObjectField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#apply)

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

Inherited from [TypedObjectField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#applyChange)

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters**

- **value**: `any`  
  An initial requested value
- **options?**: `{ partial?: boolean; source?: object }` = {}  
  Additional options for how the field is cleaned  
  - **partial?**: `boolean` — Whether to perform partial cleaning?  
  - **source?**: `object` — The root data model being cleaned

**Returns**  
`any`

Inherited from [TypedObjectField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#clean)

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

**Parameters**

- **data**: `any`

**Returns**  
`any`

Inherited from [TypedObjectField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#getInitialValue)

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): {}
```

**Parameters**

- **value**: `any`
- **model**: `any`
- **options?**: `{}` = {}

**Returns**  
`{}`

Inherited from [TypedObjectField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#initialize)

---

### migrateSource

```typescript
migrateSource(sourceData: object, fieldData: any): void
```

Migrate this field's candidate source data.

**Parameters**

- **sourceData**: `object`  
  Candidate source data of the root model
- **fieldData**: `any`  
  The value of this field within the source data

**Returns**  
`void`

Inherited from [TypedObjectField.migrateSource](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#migrateSource)

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

- **groupConfig?**: `FormGroupConfig` = {}  
  Configuration options passed to the wrapping form-group
- **inputConfig?**: `FormInputConfig` = {}  
  Input element configuration options passed to `DataField#toInput`

**Returns**  
`HTMLDivElement`  
The rendered form group element

Inherited from [TypedObjectField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#toFormGroup)

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters**

- **config?**: `FormInputConfig` = {}  
  Form element configuration parameters

**Returns**  
`HTMLElement` | `HTMLCollection`  
A rendered HTMLElement for the field

**Throws**

An Error if this DataField subclass does not support input rendering

Inherited from [TypedObjectField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#toInput)

---

### toObject

```typescript
toObject(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**  
`any`

Inherited from [TypedObjectField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#toObject)

---

### validate

```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions,
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

**Parameters**

- **value**: `any`  
  The initial value
- **options?**: `DataFieldValidationOptions` = {}  
  Options which affect validation behavior

**Returns**  
`void` | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)

Inherited from [TypedObjectField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#validate)

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

Inherited from [TypedObjectField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_applyChangeAdd)

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

Inherited from [TypedObjectField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_applyChangeCustom)

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

Inherited from [TypedObjectField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_applyChangeDowngrade)

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

Inherited from [TypedObjectField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_applyChangeMultiply)

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

Inherited from [TypedObjectField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_applyChangeOverride)

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

Inherited from [TypedObjectField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_applyChangeUpgrade)

---

### _toInput

```typescript
_toInput(config: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element. Subclasses should implement this method rather than the public `toInput` method which wraps it.

**Parameters**

- **config**: `FormInputConfig`  
  Form element configuration parameters

**Returns**  
`HTMLElement` | `HTMLCollection`  
A rendered HTMLElement for the field

**Throws**  
An Error if this DataField subclass does not support input rendering

Inherited from [TypedObjectField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_toInput)

---

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.

**Parameters**

- **value**: `any`  
  The candidate value

**Returns**  
`boolean` | `void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**  
May throw a specific error if the value is not valid

Inherited from [TypedObjectField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html#_validateSpecial)