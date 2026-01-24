# ObjectField | Foundry Virtual Tabletop - API Documentation - Version 13

A subclass of `DataField` which deals with object-typed data.

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.ObjectField), Expand)

- *DataField*
- **ObjectField**
- *TypedObjectField*  
- *DocumentOwnershipField*  
- *TypeDataField*  
- *AdditionalTypesField*  

---

## Constructors

### constructor

```typescript
new ObjectField(
    options?: DataFieldOptions,
    context?: DataFieldContext,
): ObjectField
```

**Parameters**

- **options**: `DataFieldOptions` = {}  
  Options which configure the behavior of the field.

- **context**: `DataFieldContext` = {}  
  Additional context which describes the field.

**Returns**  
`ObjectField`

Inherited from [DataField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#constructor)

---

## Accessors

### options

```typescript
options: DataFieldOptions
```

The initially provided options which configure the data field.

Inherited from [DataField.options](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#options)

### hierarchical

```typescript
static hierarchical: boolean = false
```

Whether this field defines part of a Document/Embedded Document hierarchy.

Inherited from [DataField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#hierarchical)

### recursive

```typescript
static recursive: boolean = false
```

Does this field type contain other fields in a recursive structure? Examples of recursive fields are `SchemaField`, `ArrayField`, or `TypeDataField`. Examples of non-recursive fields are `StringField`, `NumberField`, or `ObjectField`.

Inherited from [DataField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#recursive)

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

**Returns**  
`string`

Inherited from `DataField.fieldPath`

---

## Methods

### _defaults

```typescript
get _defaults(): DataFieldOptions & { nullable: boolean; required: boolean }
```

Default parameters for this field type.

**Returns**  
`DataFieldOptions & { nullable: boolean; required: boolean }`

Overrides `DataField._defaults`

### hasFormSupport

```typescript
static get hasFormSupport(): boolean
```

Does this form field class have defined form support?

**Returns**  
`boolean`

Inherited from `DataField.hasFormSupport`

### _cast

```typescript
_cast(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**  
`any`

Overrides [DataField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cast)

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

Overrides [DataField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_updatediff)

### _validateType

```typescript
_validateType(value: any, options?: {}): void
```

**Parameters**

- **value**: `any`
- **options**: `{}` = {}

**Returns**  
`void`

Overrides [DataField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatetype)

### apply

```typescript
apply(fn: string | Function, value: any, options?: object): object
```

Apply a function to this `DataField` which propagates through recursively to any contained data schema.

**Parameters**

- **fn**: `string` | `Function`  
  The function to apply.

- **value**: `any`  
  The current value of this field.

- **options** (optional): `object` = {}  
  Additional options passed to the applied function.

**Returns**  
`object`

Inherited from [DataField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#apply)

### applyChange

```typescript
applyChange(
    value: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply an `ActiveEffectChange` to this field.

**Parameters**

- **value**: `any`  
  The field's current value.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The change to apply.

**Returns**  
`any`

Inherited from [DataField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#applychange)

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a `DataModel` is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters**

- **value**: `any`  
  An initial requested value.

- **options** (optional): `{ partial?: boolean; source?: object }` = {}  
  Additional options for how the field is cleaned.
  - **partial** (optional): `boolean`  
    Whether to perform partial cleaning?
  - **source** (optional): `object`  
    The root data model being cleaned.

**Returns**  
`any`

Inherited from [DataField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#clean)

### getInitialValue

```typescript
getInitialValue(data: any): any
```

**Parameters**

- **data**: `any`

**Returns**  
`any`

Overrides [DataField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#getinitialvalue)

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

**Parameters**

- **value**: `any`  
- **model**: `any`  
- **options** (optional): `{}` = {}

**Returns**  
`any`

Overrides [DataField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#initialize)

### toFormGroup

```typescript
toFormGroup(
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```

Render this `DataField` as a standardized form-group element.

**Parameters**

- **groupConfig**: `FormGroupConfig` = {}  
  Configuration options passed to the wrapping form-group.

- **inputConfig**: `FormInputConfig` = {}  
  Input element configuration options passed to `DataField#toInput`.

**Returns**  
`HTMLDivElement`

Inherited from [DataField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toformgroup)

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this `DataField` as an HTML element.

**Parameters**

- **config**: `FormInputConfig` = {}  
  Form element configuration parameters.

**Returns**  
`HTMLElement | HTMLCollection`

**Throws**  
An Error if this `DataField` subclass does not support input rendering.

Inherited from [DataField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toinput)

### toObject

```typescript
toObject(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**  
`any`

Overrides [DataField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toobject)

### validate

```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions,
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a `DataModelValidationFailure` instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

**Parameters**

- **value**: `any`  
  The initial value.

- **options** (optional): `DataFieldValidationOptions` = {}  
  Options which affect validation behavior.

**Returns**  
`void | DataModelValidationFailure`

Inherited from [DataField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#validate)

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

Inherited from [DataField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeadd)

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

Inherited from [DataField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangecustom)

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

Inherited from [DataField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangedowngrade)

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

Inherited from [DataField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangemultiply)

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

Inherited from [DataField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeoverride)

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

Inherited from [DataField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeupgrade)

### _cleanType

```typescript
protected _cleanType(value: any, options?: object): any
```

Apply any cleaning logic specific to this `DataField` type.

**Parameters**

- **value**: `any`  
  The appropriately coerced value.

- **options** (optional): `object`  
  Additional options for how the field is cleaned.

**Returns**  
`any`

Inherited from [DataField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cleantype)

### _toInput

```typescript
protected _toInput(config: FormInputConfig): HTMLElement | HTMLCollection
```

Render this `DataField` as an HTML element. Subclasses should implement this method rather than the public `toInput` method which wraps it.

**Parameters**

- **config**: `FormInputConfig`  
  Form element configuration parameters.

**Returns**  
`HTMLElement | HTMLCollection`

**Throws**  
An Error if this `DataField` subclass does not support input rendering.

Inherited from [DataField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_toinput)

### _validateSpecial

```typescript
protected _validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like `null` or `undefined`.

**Parameters**

- **value**: `any`  
  The candidate value.

**Returns**  
`boolean | void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**  
May throw a specific error if the value is not valid.

Inherited from [DataField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatespecial)

---

For additional information and advanced hierarchy, refer to the [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html).