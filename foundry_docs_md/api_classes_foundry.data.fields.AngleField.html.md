# AngleField | Foundry Virtual Tabletop - API Documentation - Version 13

A special [foundry.data.fields.NumberField](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html) which represents an angle of rotation in degrees between 0 and 360.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.AngleField)  
- *NumberField*  
- **AngleField**

## Properties

### options
- **Type:** [DataFieldOptions](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldOptions.html)  
- **Description:** The initially provided options which configure the data field  
- **Inheritance:** Inherited from [NumberField.options](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#options)

### hierarchical (static)
- **Type:** `boolean` = `false`  
- **Description:** Whether this field defines part of a Document/Embedded Document hierarchy.  
- **Inheritance:** Inherited from [NumberField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#hierarchical)

### recursive (static)
- **Type:** `boolean` = `false`  
- **Description:** Does this field type contain other fields in a recursive structure? Examples of recursive fields are SchemaField, ArrayField, or TypeDataField. Examples of non-recursive fields are StringField, NumberField, or ObjectField.  
- **Inheritance:** Inherited from [NumberField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#recursive)

## Accessors

### fieldPath
```typescript
get fieldPath(): string
```
A dot-separated string representation of the field path within the parent schema.  
**Returns:** `string`  
*Inherited from NumberField.fieldPath*

### _defaults (static)
```typescript
get _defaults(): never
```
Default parameters for this field type.  
**Returns:** `never`  
*Overrides NumberField._defaults*

### hasFormSupport (static)
```typescript
get hasFormSupport(): boolean
```
Does this form field class have defined form support?  
**Returns:** `boolean`  
*Inherited from NumberField.hasFormSupport*

## Methods

### _applyChangeDowngrade
```typescript
_applyChangeDowngrade(value: any, delta: any, model: any, change: any): any
```
*Inherited from [NumberField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applychangedowngrade)*

**Parameters:**
- **value**: `any`
- **delta**: `any`
- **model**: `any`
- **change**: `any`

**Returns:** `any`

---

### _applyChangeMultiply
```typescript
_applyChangeMultiply(value: any, delta: any, model: any, change: any): number
```
*Inherited from [NumberField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applychangemultiply)*

**Parameters:**
- **value**: `any`
- **delta**: `any`
- **model**: `any`
- **change**: `any`

**Returns:** `number`

---

### _applyChangeUpgrade
```typescript
_applyChangeUpgrade(value: any, delta: any, model: any, change: any): any
```
*Inherited from [NumberField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applychangeupgrade)*

**Parameters:**
- **value**: `any`
- **delta**: `any`
- **model**: `any`
- **change**: `any`

**Returns:** `any`

---

### _cast
```typescript
_cast(value: any): any
```
Overrides [NumberField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_cast)

**Parameters:**
- **value**: `any`

**Returns:** `any`

---

### _cleanType
```typescript
_cleanType(value: any, options: any): any
```
Apply any cleaning logic specific to this DataField type.  
*Inherited from [NumberField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_cleantype)*

**Parameters:**
- **value**: `any` — The appropriately coerced value.
- **options**: `any` — Additional options for how the field is cleaned.

**Returns:** `any` — The cleaned value.

---

### _toInput
```typescript
_toInput(config: any): HTMLInputElement | HTMLSelectElement | HTMLRangePickerElement
```
Render this DataField as an HTML input or select element.  
*Inherited from [NumberField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_toinput)*

**Parameters:**
- **config**: `any`

**Returns:** `HTMLInputElement | HTMLSelectElement | HTMLRangePickerElement`

---

### _validateType
```typescript
_validateType(value: any): void
```
*Inherited from [NumberField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_validatetype)*

**Parameters:**
- **value**: `any`

**Returns:** `void`

---

### apply
```typescript
apply(fn: string | Function, value: any, options?: object): object
```
Apply a function to this DataField which propagates through recursively to any contained data schema.  
*Inherited from [NumberField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#apply)*

**Parameters:**
- **fn**: `string | Function` — The function to apply.
- **value**: `any` — The current value of this field.
- **options**: `object` = `{}` — Additional options passed to the applied function.

**Returns:** `object` — The results object.

---

### applyChange
```typescript
applyChange(
    value: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```
Apply an ActiveEffectChange to this field.  
*Inherited from [NumberField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#applychange)*

**Parameters:**
- **value**: `any` — The field's current value.
- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.
- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The change to apply.

**Returns:** `any` — The updated value.

---

### clean
```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```
Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.  
*Inherited from [NumberField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#clean)*

**Parameters:**
- **value**: `any` — An initial requested value.
- **options?**:  
  - **partial?**: `boolean` — Whether to perform partial cleaning?  
  - **source?**: `object` — The root data model being cleaned.

**Returns:** `any` — The cast value.

---

### getInitialValue
```typescript
getInitialValue(data: object): any
```
Attempt to retrieve a valid initial value for the DataField.  
*Inherited from [NumberField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#getinitialvalue)*

**Parameters:**
- **data**: `object` — The source data object for which an initial value is required.

**Returns:** `any` — A proposed initial value.

---

### initialize
```typescript
initialize(value: any, model: Object, options?: object): any
```
Initialize the original source data into a mutable copy for the DataModel instance.  
*Inherited from [NumberField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#initialize)*

**Parameters:**
- **value**: `any` — The source value of the field.
- **model**: `Object` — The DataModel instance that this field belongs to.
- **options?**: `object` = `{}` — Initialization options.

**Returns:** `any` — An initialized copy of the source data.

---

### toFormGroup
```typescript
toFormGroup(
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```
Render this DataField as a standardized form-group element.  
*Inherited from [NumberField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#toformgroup)*

**Parameters:**
- **groupConfig?**: [FormGroupConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormGroupConfig.html) = `{}` — Configuration options passed to the wrapping form-group.
- **inputConfig?**: [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html) = `{}` — Input element configuration options passed to DataField#toInput.

**Returns:** `HTMLDivElement` — The rendered form group element.

---

### toInput
```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```
Render this DataField as an HTML element.  
*Inherited from [NumberField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#toinput)*

**Parameters:**
- **config?**: [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html) = `{}` — Form element configuration parameters.

**Returns:** `HTMLElement | HTMLCollection` — A rendered HTMLElement for the field.

**Throws:** An Error if this DataField subclass does not support input rendering.

---

### toObject
```typescript
toObject(value: any): any
```
Export the current value of the field into a serializable object.  
*Inherited from [NumberField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#toobject)*

**Parameters:**
- **value**: `any` — The initialized value of the field.

**Returns:** `any` — An exported representation of the field.

---

### validate
```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions,
): void | DataModelValidationFailure
```
Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.  
*Inherited from [NumberField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#validate)*

**Parameters:**
- **value**: `any` — The initial value.
- **options?**: [DataFieldValidationOptions](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldValidationOptions.html) = `{}` — Options which affect validation behavior.

**Returns:** `void | DataModelValidationFailure` — Returns a DataModelValidationFailure if a validation failure occurred.

---

### _applyChangeAdd (protected)
```typescript
_applyChangeAdd(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```
Apply an ADD change to this field.  
*Inherited from [NumberField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applychangeadd)*

**Parameters:**
- **value**: `any` — The field's current value.
- **delta**: `any` — The change delta.
- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.
- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.

**Returns:** `any` — The updated value.

---

### _applyChangeCustom (protected)
```typescript
_applyChangeCustom(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```
Apply a CUSTOM change to this field.  
*Inherited from [NumberField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applychangecustom)*

**Parameters:**
- **value**: `any` — The field's current value.
- **delta**: `any` — The change delta.
- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.
- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.

**Returns:** `any` — The updated value.

---

### _applyChangeOverride (protected)
```typescript
_applyChangeOverride(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```
Apply an OVERRIDE change to this field.  
*Inherited from [NumberField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applychangeoverride)*

**Parameters:**
- **value**: `any` — The field's current value.
- **delta**: `any` — The change delta.
- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.
- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.

**Returns:** `any` — The updated value.

---

### _validateSpecial (protected)
```typescript
_validateSpecial(value: any): boolean | void
```
Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.  
*Inherited from [NumberField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_validatespecial)*

**Parameters:**
- **value**: `any` — The candidate value.

**Returns:** `boolean | void` — A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws:** May throw a specific error if the value is not valid.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)