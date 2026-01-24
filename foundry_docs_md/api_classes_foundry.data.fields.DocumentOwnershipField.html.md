# DocumentOwnershipField | Foundry Virtual Tabletop - API Documentation - Version 13

A special [foundry.data.fields.ObjectField](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html) which captures a mapping of User IDs to Document permission levels.

## Hierarchy
- [ObjectField](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html)
- DocumentOwnershipField

## Constructors

```typescript
new DocumentOwnershipField(
    options?: DataFieldOptions,
    context?: DataFieldContext,
): DocumentOwnershipField
```

**Parameters**

- **options**: `DataFieldOptions` = `{}`  
  Options which configure the behavior of the field

- **context**: `DataFieldContext` = `{}`  
  Additional context which describes the field

**Returns**  
`DocumentOwnershipField`

_Inherited from [ObjectField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#constructor)_

## Properties

### options

`options: DataFieldOptions`  
The initially provided options which configure the data field

_Inherited from [ObjectField.options](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#options)_

### hierarchical

`static hierarchical: boolean = false`  
Whether this field defines part of a Document/Embedded Document hierarchy.

_Inherited from [ObjectField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#hierarchical)_

### recursive

`static recursive: boolean = false`  
Does this field type contain other fields in a recursive structure? Examples of recursive fields are SchemaField, ArrayField, or TypeDataField. Examples of non-recursive fields are StringField, NumberField, or ObjectField

_Inherited from [ObjectField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#recursive)_

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

**Returns**  
`string`

_Inherited from ObjectField.fieldPath_

## Accessors

### _defaults

```typescript
get _defaults(): DataFieldOptions & { nullable: boolean; required: boolean } & {
    gmOnly: boolean;
    initial: { default: 0 };
    validationError: string;
}
```

Default parameters for this field type.

Overrides [ObjectField._defaults](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_defaults)

### hasFormSupport

```typescript
get hasFormSupport(): boolean
```

Does this form field class have defined form support?

**Returns**  
`boolean`

_Inherited from [ObjectField.hasFormSupport](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#hasFormSupport)_

## Methods

### _cast

```typescript
_cast(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**  
`any`

_Inherited from [ObjectField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_cast)_

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

_Inherited from [ObjectField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_updateDiff)_

---

### _validateType

```typescript
_validateType(value: any): undefined | boolean
```

**Parameters**

- **value**: `any`

**Returns**  
`undefined | boolean`

Overrides [ObjectField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_validateType)

---

### apply

```typescript
apply(fn: string | Function, value: any, options?: object): object
```

Apply a function to this DataField which propagates through recursively to any contained data schema.

**Parameters**

- **fn**: `string | Function`  
  The function to apply
  
- **value**: `any`  
  The current value of this field

- **options**?: `object` = `{}`  
  Additional options passed to the applied function

**Returns**  
`object`  
The results object

_Inherited from [ObjectField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#apply)_

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

_Inherited from [ObjectField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#applyChange)_

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters**

- **value**: `any`  
  An initial requested value

- **options**?: `{ partial?: boolean; source?: object } = {}`  
  Additional options for how the field is cleaned

  - **partial**?: `boolean`  
    Whether to perform partial cleaning?

  - **source**?: `object`  
    The root data model being cleaned

**Returns**  
`any`  
The cast value

_Inherited from [ObjectField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#clean)_

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

**Parameters**

- **data**: `any`

**Returns**  
`any`

_Inherited from [ObjectField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#getInitialValue)_

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

**Parameters**

- **value**: `any`
- **model**: `any`
- **options**?: `{}` = `{}`

**Returns**  
`any`

_Inherited from [ObjectField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#initialize)_

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

- **groupConfig**: `FormGroupConfig` = `{}`  
  Configuration options passed to the wrapping form-group

- **inputConfig**: `FormInputConfig` = `{}`  
  Input element configuration options passed to DataField#toInput

**Returns**  
`HTMLDivElement`  
The rendered form group element

_Inherited from [ObjectField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#toFormGroup)_

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
`HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field

**Throws**  
An Error if this DataField subclass does not support input rendering

_Inherited from [ObjectField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#toInput)_

---

### toObject

```typescript
toObject(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**  
`any`

_Inherited from [ObjectField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#toObject)_

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

- **options**?: `DataFieldValidationOptions` = `{}`  
  Options which affect validation behavior

**Returns**  
`void | DataModelValidationFailure`  
Returns a DataModelValidationFailure if a validation failure occurred.

_Inherited from [ObjectField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#validate)_

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

_Inherited from [ObjectField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeAdd)_

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

_Inherited from [ObjectField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeCustom)_

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

_Inherited from [ObjectField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeDowngrade)_

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

_Inherited from [ObjectField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeMultiply)_

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

_Inherited from [ObjectField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeOverride)_

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

_Inherited from [ObjectField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeUpgrade)_

---

### _cleanType

```typescript
protected _cleanType(value: any, options?: object): any
```

Apply any cleaning logic specific to this DataField type.

**Parameters**

- **value**: `any`  
  The appropriately coerced value.

- **options**?: `object`  
  Additional options for how the field is cleaned.

**Returns**  
`any`  
The cleaned value.

_Inherited from [ObjectField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_cleanType)_

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
An Error if this DataField subclass does not support input rendering

_Inherited from [ObjectField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_toInput)_

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
May throw a specific error if the value is not valid

_Inherited from [ObjectField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_validateSpecial)_

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)