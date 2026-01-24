# StringField

A subclass of [foundry.data.fields.DataField](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html) which deals with string-typed data.

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.StringField)):
- *DataField*
- **StringField**
- [ColorField](https://foundryvtt.com/api/classes/foundry.data.fields.ColorField.html)
- [DocumentIdField](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html)
- [DocumentTypeField](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentTypeField.html)
- [DocumentUUIDField](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentUUIDField.html)
- [FilePathField](https://foundryvtt.com/api/classes/foundry.data.fields.FilePathField.html)
- [HTMLField](https://foundryvtt.com/api/classes/foundry.data.fields.HTMLField.html)
- [JavaScriptField](https://foundryvtt.com/api/classes/foundry.data.fields.JavaScriptField.html)
- [JSONField](https://foundryvtt.com/api/classes/foundry.data.fields.JSONField.html)

---

## Constructors

### constructor

```typescript
new StringField(
    options?: StringFieldOptions,
    context?: DataFieldContext,
): StringField
```

**Parameters**

- **options?**: `StringFieldOptions = {}`  
  Options which configure the behavior of the field

- **context?**: `DataFieldContext = {}`  
  Additional context which describes the field

---

## Properties

- **blank**: `boolean`  
  Is the string allowed to be blank (empty)?

- **choices**: `object | Function | string[] = ...`  
  An array of values or an object of values/labels which represent allowed choices for the field.  
  A function may be provided which dynamically returns the array of choices.

- **options**: `DataFieldOptions`  
  The initially provided options which configure the data field  
  (Inherited from [DataField.options](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#options))

- **textSearch**: `boolean = ...`  
  Is this string field a target for text search?

- **trim**: `boolean = ...`  
  Should any provided string be trimmed as part of cleaning?

- **hierarchical** (static): `boolean = false`  
  Whether this field defines part of a Document/Embedded Document hierarchy.  
  (Inherited from [DataField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#hierarchical))

- **recursive** (static): `boolean = false`  
  Does this field type contain other fields in a recursive structure? Examples of recursive fields are SchemaField, ArrayField, or TypeDataField. Examples of non-recursive fields are StringField, NumberField, or ObjectField.  
  (Inherited from [DataField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#recursive))

- **fieldPath** (accessor): `string`  
  A dot-separated string representation of the field path within the parent schema.  
  (Inherited from `DataField.fieldPath`)

- **_defaults** (static accessor): `DataFieldOptions & { blank: boolean; choices: undefined; textSearch: boolean; trim: boolean; }`  
  Default parameters for this field type  
  Overrides `DataField._defaults`

- **hasFormSupport** (static accessor): `boolean`  
  Does this form field class have defined form support?  
  (Inherited from `DataField.hasFormSupport`)

---

## Methods

### _cast

```typescript
_cast(value: any): string
```

**Parameters**

- **value**: `any`

**Returns**: `string`  
Overrides [DataField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cast)

---

### _toInput

```typescript
_toInput(config: FormInputConfig & StringFieldInputConfig): HTMLElement
```

**Parameters**

- **config**: `FormInputConfig & StringFieldInputConfig`

**Returns**: `HTMLElement`  
Overrides [DataField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_toinput)

---

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.

**Parameters**

- **value**: `any`  
  The candidate value

**Returns**: `boolean | void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**

May throw a specific error if the value is not valid  
Overrides [DataField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatespecial)

---

### _validateType

```typescript
_validateType(value: any): undefined | true
```

**Parameters**

- **value**: `any`

**Returns**: `undefined | true`  
Overrides [DataField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatetype)

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

- **options?**: `object = {}`  
  Additional options passed to the applied function

**Returns**: `object`  
The results object

(Inherited from [DataField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#apply))

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
  The field's current value.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The change to apply.

**Returns**: `any`  
The updated value.

(Inherited from [DataField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#applychange))

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

**Returns**: `any`  
The cast value

Overrides [DataField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#clean)

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

**Parameters**

- **data**: `any`

**Returns**: `any`  
Overrides [DataField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#getinitialvalue)

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

- **options?**: `object = {}`  
  Initialization options

**Returns**: `any`  
An initialized copy of the source data

(Inherited from [DataField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#initialize))

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

- **groupConfig?**: `FormGroupConfig = {}`  
  Configuration options passed to the wrapping form-group

- **inputConfig?**: `FormInputConfig = {}`  
  Input element configuration options passed to DataField#toInput

**Returns**: `HTMLDivElement`  
The rendered form group element

(Inherited from [DataField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toformgroup))

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters**

- **config?**: `FormInputConfig = {}`  
  Form element configuration parameters

**Returns**: `HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field

**Throws**

An Error if this DataField subclass does not support input rendering

(Inherited from [DataField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toinput))

---

### toObject

```typescript
toObject(value: any): any
```

Export the current value of the field into a serializable object.

**Parameters**

- **value**: `any`  
  The initialized value of the field

**Returns**: `any`  
An exported representation of the field

(Inherited from [DataField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toobject))

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

- **options?**: `DataFieldValidationOptions = {}`  
  Options which affect validation behavior

**Returns**: `void | DataModelValidationFailure`  
Returns a DataModelValidationFailure if a validation failure occurred.

(Inherited from [DataField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#validate))

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

**Returns**: `any`  
The updated value.

(Inherited from [DataField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeadd))

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

**Returns**: `any`  
The updated value.

(Inherited from [DataField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangecustom))

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

**Returns**: `any`  
The updated value.

(Inherited from [DataField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangedowngrade))

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

**Returns**: `any`  
The updated value.

(Inherited from [DataField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangemultiply))

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

**Returns**: `any`  
The updated value.

(Inherited from [DataField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeoverride))

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

**Returns**: `any`  
The updated value.

(Inherited from [DataField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeupgrade))

---

### _cleanType

```typescript
_cleanType(value: any, options?: object): any
```

Apply any cleaning logic specific to this DataField type.

**Parameters**

- **value**: `any`  
  The appropriately coerced value.

- **options?**: `object`  
  Additional options for how the field is cleaned.

**Returns**: `any`  
The cleaned value.

(Inherited from [DataField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cleantype))

---

### _isValidChoice

```typescript
_isValidChoice(value: string): boolean
```

Test whether a provided value is a valid choice from the allowed choice set.

**Parameters**

- **value**: `string`  
  The provided value

**Returns**: `boolean`  
Is the choice valid?