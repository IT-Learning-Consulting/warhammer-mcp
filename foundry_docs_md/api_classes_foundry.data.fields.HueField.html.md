# HueField | Foundry Virtual Tabletop - API Documentation - Version 13

A special [foundry.data.fields.NumberField](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html) represents a number between 0 (inclusive) and 1 (exclusive). Its values are normalized (modulo 1) to the range [0, 1) instead of being clamped.

## Hierarchy

- _NumberField_
- **HueField**

---

## Constructors

### constructor

```typescript
new HueField(
  options?: NumberFieldOptions,
  context?: DataFieldContext
): HueField
```

**Parameters**

- **options**: `NumberFieldOptions` = `{}`  
  Options which configure the behavior of the field. (Optional)

- **context**: `DataFieldContext` = `{}`  
  Additional context which describes the field. (Optional)

**Returns**  
`HueField`

Inherited from [NumberField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#constructor)

---

## Properties

### options

- **options**: `DataFieldOptions`  
  The initially provided options which configure the data field.

Inherited from [NumberField.options](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#options)

---

## Accessors

### hierarchical

```typescript
static hierarchical: boolean = false
```

Whether this field defines part of a Document/Embedded Document hierarchy.

Inherited from [NumberField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#hierarchical)

---

### recursive

```typescript
static recursive: boolean = false
```

Does this field type contain other fields in a recursive structure?  
Examples of recursive fields are SchemaField, ArrayField, or TypeDataField.  
Examples of non-recursive fields are StringField, NumberField, or ObjectField.

Inherited from [NumberField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#recursive)

---

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

**Returns**  
`string`

Inherited from NumberField.fieldPath

---

### _defaults

```typescript
static get _defaults(): never
```

Default parameters for this field type.

**Returns**  
`never`

Overrides NumberField._defaults

---

## Methods

### hasFormSupport

```typescript
static get hasFormSupport(): boolean
```

Does this form field class have defined form support?

**Returns**  
`boolean`

Inherited from NumberField.hasFormSupport

---

### _applyChangeDowngrade

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

Inherited from [NumberField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applychangedowngrade)

---

### _applyChangeMultiply

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

Inherited from [NumberField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applychangemultiply)

---

### _applyChangeUpgrade

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

Inherited from [NumberField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applychangeupgrade)

---

### _cast

```typescript
_cast(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**  
`any`

Overrides [NumberField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_cast)

---

### _cleanType

```typescript
_cleanType(value: any, options: any): any
```

Apply any cleaning logic specific to this DataField type.

**Parameters**

- **value**: `any`  
  The appropriately coerced value.

- **options**: `any`  
  Additional options for how the field is cleaned.

**Returns**  
`any`

Inherited from [NumberField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_cleantype)

---

### _toInput

```typescript
_toInput(config: any): HTMLHueSelectorSlider
```

**Parameters**

- **config**: `any`

**Returns**  
`HTMLHueSelectorSlider`

Overrides [NumberField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_toinput)

---

### _validateType

```typescript
_validateType(value: any): void
```

**Parameters**

- **value**: `any`

**Returns**  
`void`

Inherited from [NumberField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_validatetype)

---

### apply

```typescript
apply(fn: string | Function, value: any, options?: object): object
```

Apply a function to this DataField which propagates through recursively to any contained data schema.

**Parameters**

- **fn**: `string` | `Function`  
  The function to apply

- **value**: `any`  
  The current value of this field

- **options**: `object` = `{}` (Optional)  
  Additional options passed to the applied function

**Returns**  
`object`  
The results object

Inherited from [NumberField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#apply)

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

**Parameters**

- **value**: `any`  
  The field's current value

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance

- **change**: `EffectChangeData`  
  The change to apply

**Returns**  
`any`  
The updated value

Inherited from [NumberField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#applychange)

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters**

- **value**: `any`  
  An initial requested value

- **options**: `{ partial?: boolean; source?: object }` = `{}` (Optional)  
  Additional options for how the field is cleaned

  - **partial**?: `boolean` (Optional)  
    Whether to perform partial cleaning?

  - **source**?: `object` (Optional)  
    The root data model being cleaned

**Returns**  
`any`  
The cast value

Inherited from [NumberField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#clean)

---

### getInitialValue

```typescript
getInitialValue(data: object): any
```

Attempt to retrieve a valid initial value for the DataField.

**Parameters**

- **data**: `object`  
  The source data object for which an initial value is required

**Returns**  
`any`  
A proposed initial value

Inherited from [NumberField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#getinitialvalue)

---

### initialize

```typescript
initialize(value: any, model: Object, options?: object): any
```

Initialize the original source data into a mutable copy for the DataModel instance.

**Parameters**

- **value**: `any`  
  The source value of the field

- **model**: `Object`  
  The DataModel instance that this field belongs to

- **options**: `object` = `{}` (Optional)  
  Initialization options

**Returns**  
`any`  
An initialized copy of the source data

Inherited from [NumberField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#initialize)

---

### toFormGroup

```typescript
toFormGroup(
  groupConfig?: FormGroupConfig,
  inputConfig?: FormInputConfig
): HTMLDivElement
```

Render this DataField as a standardized form-group element.

**Parameters**

- **groupConfig**: `FormGroupConfig` = `{}`  
  Configuration options passed to the wrapping form-group

- **inputConfig**: `FormInputConfig` = `{}`  
  Input element configuration options passed to DataField#toInput

**Returns**  
`HTMLDivElement`  
The rendered form group element

Inherited from [NumberField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#toformgroup)

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters**

- **config**: `FormInputConfig` = `{}`  
  Form element configuration parameters

**Returns**  
`HTMLElement` | `HTMLCollection`  
A rendered HTMLElement for the field

**Throws**  
An Error if this DataField subclass does not support input rendering

Inherited from [NumberField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#toinput)

---

### toObject

```typescript
toObject(value: any): any
```

Export the current value of the field into a serializable object.

**Parameters**

- **value**: `any`  
  The initialized value of the field

**Returns**  
`any`  
An exported representation of the field

Inherited from [NumberField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#toobject)

---

### validate

```typescript
validate(
  value: any, 
  options?: DataFieldValidationOptions
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

**Parameters**

- **value**: `any`  
  The initial value

- **options**: `DataFieldValidationOptions` = `{}` (Optional)  
  Options which affect validation behavior

**Returns**  
`void` | `DataModelValidationFailure`  
Returns a DataModelValidationFailure if a validation failure occurred.

Inherited from [NumberField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#validate)

---

## Protected Methods

### _applyChangeAdd

```typescript
protected _applyChangeAdd(
  value: any,
  delta: any,
  model: DataModel<object, DataModelConstructionContext>,
  change: EffectChangeData
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

Inherited from [NumberField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applychangeadd)

---

### _applyChangeCustom

```typescript
protected _applyChangeCustom(
  value: any,
  delta: any,
  model: DataModel<object, DataModelConstructionContext>,
  change: EffectChangeData
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

Inherited from [NumberField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applychangecustom)

---

### _applyChangeOverride

```typescript
protected _applyChangeOverride(
  value: any,
  delta: any,
  model: DataModel<object, DataModelConstructionContext>,
  change: EffectChangeData
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

Inherited from [NumberField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_applychangeoverride)

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
`boolean` | `void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**  
May throw a specific error if the value is not valid

Inherited from [NumberField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html#_validatespecial)

---

For full details, visit the [Foundry Virtual Tabletop API documentation](https://foundryvtt.com/api/classes/foundry.data.fields.HueField.html).