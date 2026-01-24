# AlphaField

A special [foundry.data.fields.NumberField](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html) represents a number between 0 and 1.

## Hierarchy  
(View [Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.AlphaField), Expand)

- *NumberField*  
- **AlphaField**

---

## Constructors

### `constructor`

```typescript
new AlphaField(
  options?: NumberFieldOptions,
  context?: DataFieldContext,
): AlphaField
```

**Parameters**

- **options**: `NumberFieldOptions` = `{}`  
  Options which configure the behavior of the field  
  _Optional_

- **context**: `DataFieldContext` = `{}`  
  Additional context which describes the field  
  _Optional_

**Returns**  
`AlphaField`

_Inherited from [NumberField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#constructor)_

---

## Properties

### `options`

The initially provided options which configure the data field.

Type: `DataFieldOptions`

_Inherited from [NumberField.options](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#options)_

---

## Accessors

### `hierarchical`

```typescript
static hierarchical: boolean = false
```

Whether this field defines part of a Document/Embedded Document hierarchy.

Inherited from [NumberField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#hierarchical)

---

### `recursive`

```typescript
static recursive: boolean = false
```

Does this field type contain other fields in a recursive structure? Examples of recursive fields are SchemaField, ArrayField, or TypeDataField. Examples of non-recursive fields are StringField, NumberField, or ObjectField.

Inherited from [NumberField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#recursive)

---

### `fieldPath`

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

**Returns**  
`string`

Inherited from `NumberField.fieldPath`

---

### `_defaults`

```typescript
static get _defaults(): never
```

Default parameters for this field type.

**Returns**  
`never`

Overrides [NumberField._defaults](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_defaults)

---

### `hasFormSupport`

```typescript
static get hasFormSupport(): boolean
```

Does this form field class have defined form support?

**Returns**  
`boolean`

Inherited from [NumberField.hasFormSupport](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#hasFormSupport)

---

## Methods

### `_applyChangeDowngrade`

```typescript
_applyChangeDowngrade(value: any, delta: any, model: any, change: any): any
```

**Parameters**

- **value**: `any`  
- **delta**: `any`  
- **model**: `any`  
- **change**: `any`  

**Returns**  
`any`

Inherited from [NumberField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applyChangeDowngrade)

---

### `_applyChangeMultiply`

```typescript
_applyChangeMultiply(value: any, delta: any, model: any, change: any): number
```

**Parameters**

- **value**: `any`  
- **delta**: `any`  
- **model**: `any`  
- **change**: `any`  

**Returns**  
`number`

Inherited from [NumberField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applyChangeMultiply)

---

### `_applyChangeUpgrade`

```typescript
_applyChangeUpgrade(value: any, delta: any, model: any, change: any): any
```

**Parameters**

- **value**: `any`  
- **delta**: `any`  
- **model**: `any`  
- **change**: `any`  

**Returns**  
`any`

Inherited from [NumberField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applyChangeUpgrade)

---

### `_cast`

```typescript
_cast(value: any): null | number
```

**Parameters**

- **value**: `any`

**Returns**  
`null` | `number`

Inherited from [NumberField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_cast)

---

### `_cleanType`

```typescript
_cleanType(value: any, options: any): any
```

Apply any cleaning logic specific to this DataField type.

**Parameters**

- **value**: `any`  
- **options**: `any`  
  Additional options for how the field is cleaned.

**Returns**  
`any`

Inherited from [NumberField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_cleanType)

---

### `_toInput`

```typescript
_toInput(config: any): HTMLInputElement | HTMLSelectElement | HTMLRangePickerElement
```

**Parameters**

- **config**: `any`

**Returns**  
`HTMLInputElement` | `HTMLSelectElement` | [HTMLRangePickerElement](https://foundryvtt.com/api/classes/foundry.applications.elements.HTMLRangePickerElement.html)

Inherited from [NumberField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_toInput)

---

### `_validateType`

```typescript
_validateType(value: any): void
```

**Parameters**

- **value**: `any`

**Returns**  
`void`

Inherited from [NumberField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_validateType)

---

### `apply`

```typescript
apply(fn: string | Function, value: any, options?: object): object
```

Apply a function to this DataField which propagates through recursively to any contained data schema.

**Parameters**

- **fn**: `string` | `Function`  
  The function to apply

- **value**: `any`  
  The current value of this field

- **options**: `object` = `{}`  
  Additional options passed to the applied function  
  _Optional_

**Returns**  
`object`

Inherited from [NumberField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#apply)

---

### `applyChange`

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

Inherited from [NumberField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#applyChange)

---

### `clean`

```typescript
clean(
  value: any,
  options?: { partial?: boolean; source?: object }
): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters**

- **value**: `any`  
  An initial requested value

- **options**: `{ partial?: boolean; source?: object }` = `{}`  
  Additional options for how the field is cleaned  
  _Optional_

  - **partial**?: `boolean`  
    Whether to perform partial cleaning?  
    _Optional_

  - **source**?: `object`  
    The root data model being cleaned  
    _Optional_

**Returns**  
`any`

Inherited from [NumberField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#clean)

---

### `getInitialValue`

```typescript
getInitialValue(data: object): any
```

Attempt to retrieve a valid initial value for the DataField.

**Parameters**

- **data**: `object`  
  The source data object for which an initial value is required

**Returns**  
`any`

Inherited from [NumberField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#getInitialValue)

---

### `initialize`

```typescript
initialize(value: any, model: Object, options?: object): any
```

Initialize the original source data into a mutable copy for the DataModel instance.

**Parameters**

- **value**: `any`  
  The source value of the field

- **model**: `Object`  
  The DataModel instance that this field belongs to

- **options**: `object` = `{}`  
  Initialization options  
  _Optional_

**Returns**  
`any`

Inherited from [NumberField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#initialize)

---

### `toFormGroup`

```typescript
toFormGroup(
  groupConfig?: FormGroupConfig,
  inputConfig?: FormInputConfig,
): HTMLDivElement
```

Render this DataField as a standardized form-group element.

**Parameters**

- **groupConfig**: `FormGroupConfig` = `{}`  
  Configuration options passed to the wrapping form-group  
  _Optional_

- **inputConfig**: `FormInputConfig` = `{}`  
  Input element configuration options passed to DataField#toInput  
  _Optional_

**Returns**  
`HTMLDivElement`

Inherited from [NumberField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#toFormGroup)

---

### `toInput`

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters**

- **config**: `FormInputConfig` = `{}`  
  Form element configuration parameters  
  _Optional_

**Returns**  
`HTMLElement` | `HTMLCollection`

**Throws**  
An Error if this DataField subclass does not support input rendering

Inherited from [NumberField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#toInput)

---

### `toObject`

```typescript
toObject(value: any): any
```

Export the current value of the field into a serializable object.

**Parameters**

- **value**: `any`  
  The initialized value of the field

**Returns**  
`any`

Inherited from [NumberField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#toObject)

---

### `validate`

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

- **options**: `DataFieldValidationOptions` = `{}`  
  Options which affect validation behavior  
  _Optional_

**Returns**  
`void` | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)

Inherited from [NumberField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#validate)

---

## Protected Methods

### `_applyChangeAdd`

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

Inherited from [NumberField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applyChangeAdd)

---

### `_applyChangeCustom`

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

Inherited from [NumberField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applyChangeCustom)

---

### `_applyChangeOverride`

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

Inherited from [NumberField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applyChangeOverride)

---

### `_validateSpecial`

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

Inherited from [NumberField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_validateSpecial)

---

_For more details, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.data.fields.AlphaField.html)._