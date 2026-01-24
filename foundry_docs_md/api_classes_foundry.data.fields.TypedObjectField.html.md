# TypedObjectField

A subclass of `ObjectField` that represents a mapping of keys to the provided `DataField` type.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html)

## Hierarchy  
(View [Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.TypedObjectField))

- *ObjectField*  
- **TypedObjectField**  
- *DocumentFlagsField*  

---

## Constructor

```typescript
new TypedObjectField(
    element: DataField,
    options?: DataFieldOptions,
    context?: DataFieldContext,
): TypedObjectField
```

**Parameters:**

- **element**: `DataField`  
  The value type of each entry in this object.

- **options** *(optional)*: `DataFieldOptions`  
  Options which configure the behavior of the field.

- **context** *(optional)*: `DataFieldContext`  
  Additional context which describes the field.

---

## Properties

### element

`element: DataField`  
The value type of each entry in this object.

### options

`options: DataFieldOptions`  
The initially provided options which configure the data field.  
*Inherited from [ObjectField.options](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#options)*

### hierarchical

`static hierarchical: boolean = false`  
Whether this field defines part of a Document/Embedded Document hierarchy.  
*Inherited from [ObjectField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#hierarchical)*

### recursive

`static recursive: boolean = true`  
Overrides [ObjectField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#recursive)

---

## Accessors

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.  
*Inherited from ObjectField.fieldPath*

### _defaults

```typescript
static get _defaults(): object
```

Default parameters for this field type.  
Overrides [ObjectField._defaults](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_defaults)

### hasFormSupport

```typescript
static get hasFormSupport(): boolean
```

Does this form field class have defined form support?  
*Inherited from ObjectField.hasFormSupport*

---

## Methods

### _addTypes

```typescript
_addTypes(source: any, changes: any, options?: {}): void
```

Overrides [ObjectField._addTypes](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_addTypes)

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

Inherited from [ObjectField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_cast)

**Parameters:**

- **value**: `any`

**Returns:** `any`

---

### _cleanType

```typescript
_cleanType(data: any, options: any): any
```

Overrides [ObjectField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_cleanType)

**Parameters:**

- **data**: `any`  
- **options**: `any`

**Returns:** `any`

---

### _getField

```typescript
_getField(path: any): undefined | DataField | TypedObjectField
```

Overrides [ObjectField._getField](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_getField)

**Parameters:**

- **path**: `any`

**Returns:** `undefined` | `DataField` | `TypedObjectField`

---

### _updateCommit

```typescript
_updateCommit(source: any, key: any, value: any, diff: any, options: any): void
```

Overrides [ObjectField._updateCommit](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_updateCommit)

**Parameters:**

- **source**: `any`  
- **key**: `any`  
- **value**: `any`  
- **diff**: `any`  
- **options**: `any`

**Returns:** `void`

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

Overrides [ObjectField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_updateDiff)

**Parameters:**

- **source**: `any`  
- **key**: `any`  
- **value**: `any`  
- **difference**: `any`  
- **options**: `any`

**Returns:** `void`

---

### _validateModel

```typescript
_validateModel(changes: any, options?: {}): void
```

Overrides [ObjectField._validateModel](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_validateModel)

**Parameters:**

- **changes**: `any`  
- **options** *(optional)*: `{}` = `{}`

**Returns:** `void`

---

### _validateType

```typescript
_validateType(data: any, options?: {}): undefined | DataModelValidationFailure
```

Overrides [ObjectField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_validateType)

**Parameters:**

- **data**: `any`  
- **options** *(optional)*: `{}` = `{}`

**Returns:** `undefined` | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)

---

### apply

```typescript
apply(fn: any, data?: {}, options?: {}): {}
```

Overrides [ObjectField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#apply)

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
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Applies an ActiveEffectChange to this field.  
Inherited from [ObjectField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#applyChange)

**Parameters:**

- **value**: `any`  
  The field's current value.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The change to apply.

**Returns:** `any`  
The updated value.

---

### clean

```typescript
clean(
    value: any, 
    options?: { partial?: boolean; source?: object },
): any
```

Coerces source data to ensure that it conforms to the correct data type for the field.  
Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.  
Inherited from [ObjectField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#clean)

**Parameters:**

- **value**: `any`  
  An initial requested value.

- **options** *(optional)*:  
  - **partial**?: `boolean`  
    Whether to perform partial cleaning?  
  - **source**?: `object`  
    The root data model being cleaned.

**Returns:** `any`  
The cast value.

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

Inherited from [ObjectField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#getInitialValue)

**Parameters:**

- **data**: `any`

**Returns:** `any`

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): {}
```

Overrides [ObjectField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#initialize)

**Parameters:**

- **value**: `any`  
- **model**: `any`  
- **options** *(optional)*: `{}` = `{}`

**Returns:** `{}`

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
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```

Render this DataField as a standardized form-group element.  
Inherited from [ObjectField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#toFormGroup)

**Parameters:**

- **groupConfig** *(optional)*: `FormGroupConfig` = `{}`  
  Configuration options passed to the wrapping form-group.

- **inputConfig** *(optional)*: `FormInputConfig` = `{}`  
  Input element configuration options passed to `DataField#toInput`.

**Returns:** `HTMLDivElement`  
The rendered form group element.

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.  
Inherited from [ObjectField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#toInput)

**Parameters:**

- **config** *(optional)*: `FormInputConfig` = `{}`  
  Form element configuration parameters.

**Returns:** `HTMLElement` | `HTMLCollection`  
A rendered HTMLElement for the field.

**Throws:**  
An Error if this DataField subclass does not support input rendering.

---

### toObject

```typescript
toObject(value: any): any
```

Overrides [ObjectField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#toObject)

**Parameters:**

- **value**: `any`

**Returns:** `any`

---

### validate

```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions,
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements.  
A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a `DataModelValidationFailure` instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.  
Inherited from [ObjectField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#validate)

**Parameters:**

- **value**: `any`  
  The initial value.

- **options** *(optional)*: `DataFieldValidationOptions` = `{}`  
  Options which affect validation behavior.

**Returns:**  
`void` | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)  
Returns a `DataModelValidationFailure` if a validation failure occurred.

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
Inherited from [ObjectField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeAdd)

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
Inherited from [ObjectField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeCustom)

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
Inherited from [ObjectField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeDowngrade)

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
Inherited from [ObjectField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeMultiply)

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
Inherited from [ObjectField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeOverride)

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
Inherited from [ObjectField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeUpgrade)

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

---

### _toInput

```typescript
protected _toInput(config: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element. Subclasses should implement this method rather than the public `toInput` method which wraps it.  
Inherited from [ObjectField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_toInput)

**Parameters:**

- **config**: `FormInputConfig`  
  Form element configuration parameters.

**Returns:** `HTMLElement` | `HTMLCollection`  
A rendered HTMLElement for the field.

**Throws:**  
An Error if this DataField subclass does not support input rendering.

---

### _validateSpecial

```typescript
protected _validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like `null` or `undefined`.  
Inherited from [ObjectField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_validateSpecial)

**Parameters:**

- **value**: `any`  
  The candidate value.

**Returns:** `boolean` | `void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws:**  
May throw a specific error if the value is not valid.

---

For more details, see the [TypedObjectField API Documentation](https://foundryvtt.com/api/classes/foundry.data.fields.TypedObjectField.html).