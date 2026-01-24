# ColorField | Foundry Virtual Tabletop - API Documentation - Version 13

A special [foundry.data.fields.StringField which records a standardized CSS color string.](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html)

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.ColorField), Expand)  
_StringField_  
**ColorField**

---

## Constructors

### constructor

```typescript
new ColorField(
    options?: StringFieldOptions,
    context?: DataFieldContext,
): ColorField
```

**Parameters**

- **options**: `StringFieldOptions = {}`  
  Options which configure the behavior of the field

- **context**: `DataFieldContext = {}`  
  Additional context which describes the field

**Returns**  
_ColorField_

Inherited from [StringField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#constructor)

---

## Properties

### blank

**Type:** `boolean`  
Is the string allowed to be blank (empty)?

Inherited from [StringField.blank](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#blank)

---

### choices

**Type:** `object | Function | string[] = ...`  
An array of values or an object of values/labels which represent allowed choices for the field.  
A function may be provided which dynamically returns the array of choices.

Inherited from [StringField.choices](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#choices)

---

### options

**Type:** [DataFieldOptions](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldOptions.html)  
The initially provided options which configure the data field

Inherited from [StringField.options](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#options)

---

### textSearch

**Type:** `boolean = ...`  
Is this string field a target for text search?

Inherited from [StringField.textSearch](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#textsearch)

---

### trim

**Type:** `boolean = ...`  
Should any provided string be trimmed as part of cleaning?

Inherited from [StringField.trim](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#trim)

---

### hierarchical

**Static**  
**Type:** `boolean = false`  
Whether this field defines part of a Document/Embedded Document hierarchy.

Inherited from [StringField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#hierarchical)

---

### recursive

**Static**  
**Type:** `boolean = false`  
Does this field type contain other fields in a recursive structure? Examples of recursive fields are SchemaField, ArrayField, or TypeDataField. Examples of non-recursive fields are StringField, NumberField, or ObjectField.

Inherited from [StringField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#recursive)

---

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

**Returns:** `string`  

Inherited from StringField.fieldPath

---

### _defaults

```typescript
static get _defaults(): DataFieldOptions & {
    blank: boolean;
    choices: undefined;
    textSearch: boolean;
    trim: boolean;
} & { blank: boolean; initial: null; nullable: boolean; }
```

Default parameters for this field type

**Returns:** [DataFieldOptions](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldOptions.html) & { blank: boolean; choices: undefined; textSearch: boolean; trim: boolean; } & { blank: boolean; initial: null; nullable: boolean; }

Overrides StringField._defaults

---

### hasFormSupport

```typescript
static get hasFormSupport(): boolean
```

Does this form field class have defined form support?

**Returns:** `boolean`

Inherited from StringField.hasFormSupport

---

## Methods

### _cast

```typescript
_cast(value: any): string
```

Overrides [StringField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_cast)

**Parameters**

- **value**: `any`

**Returns:** `string`

---

### _toInput

```typescript
_toInput(config: any): HTMLColorPickerElement
```

Overrides [StringField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_toinput)

**Parameters**

- **config**: `any`

**Returns:** [HTMLColorPickerElement](https://foundryvtt.com/api/classes/foundry.applications.elements.HTMLColorPickerElement.html)

---

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation.  
This validator screens for certain values which are otherwise incompatible with this field like null or undefined.

Inherited from [StringField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_validatespecial)

**Parameters**

- **value**: `any`  
  The candidate value

**Returns**  
`boolean | void` - A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**  
May throw a specific error if the value is not valid

---

### _validateType

```typescript
_validateType(value: any, options: any): undefined | true
```

Overrides [StringField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_validatetype)

**Parameters**

- **value**: `any`  
- **options**: `any`

**Returns:** `undefined | true`

---

### apply

```typescript
apply(fn: string | Function, value: any, options?: object): object
```

Apply a function to this DataField which propagates through recursively to any contained data schema.

Inherited from [StringField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#apply)

**Parameters**

- **fn**: `string | Function`  
  The function to apply

- **value**: `any`  
  The current value of this field

- **options** (optional): `object = {}`  
  Additional options passed to the applied function

**Returns:** `object`  
The results object

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

Inherited from [StringField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#applychange)

**Parameters**

- **value**: `any`  
  The field's current value.

- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)>  
  The model instance.

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
  The change to apply.

**Returns:** `any`  
The updated value.

---

### clean

```typescript
clean(value: any, options: any): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

Inherited from [StringField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#clean)

**Parameters**

- **value**: `any`  
  An initial requested value

- **options**: `any`  
  Additional options for how the field is cleaned

**Returns:** `any`  
The cast value

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

Inherited from [StringField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#getinitialvalue)

**Parameters**

- **data**: `any`

**Returns:** `any`

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

Overrides [StringField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#initialize)

**Parameters**

- **value**: `any`  
- **model**: `any`  
- **options** (optional): `{}` = {}

**Returns:** `any`

---

### toFormGroup

```typescript
toFormGroup(
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```

Render this DataField as a standardized form-group element.

Inherited from [StringField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#toformgroup)

**Parameters**

- **groupConfig**: [FormGroupConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormGroupConfig.html) = {}  
  Configuration options passed to the wrapping form-group

- **inputConfig**: [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html) = {}  
  Input element configuration options passed to DataField#toInput

**Returns:** `HTMLDivElement`  
The rendered form group element

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

Inherited from [StringField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#toinput)

**Parameters**

- **config**: [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html) = {}  
  Form element configuration parameters

**Returns:** `HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field

**Throws**  
An Error if this DataField subclass does not support input rendering

---

### toObject

```typescript
toObject(value: any): any
```

Export the current value of the field into a serializable object.

Inherited from [StringField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#toobject)

**Parameters**

- **value**: `any`  
  The initialized value of the field

**Returns:** `any`  
An exported representation of the field

---

### validate

```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions,
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements.  
A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance.  
A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

Inherited from [StringField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#validate)

**Parameters**

- **value**: `any`  
  The initial value

- **options** (optional): [DataFieldValidationOptions](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldValidationOptions.html) = {}  
  Options which affect validation behavior

**Returns:** `void | DataModelValidationFailure`  
Returns a DataModelValidationFailure if a validation failure occurred.

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

Inherited from [StringField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangeadd)

**Parameters**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)>

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
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

Inherited from [StringField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangecustom)

**Parameters**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)>

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
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

Inherited from [StringField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangedowngrade)

**Parameters**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)>

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
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

Inherited from [StringField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangemultiply)

**Parameters**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)>

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
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

Inherited from [StringField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangeoverride)

**Parameters**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)>

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
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

Inherited from [StringField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangeupgrade)

**Parameters**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)>

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
  The original change data.

**Returns:** `any`  
The updated value.

---

### _cleanType

```typescript
protected _cleanType(value: any, options?: object): any
```

Apply any cleaning logic specific to this DataField type.

Inherited from [StringField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_cleantype)

**Parameters**

- **value**: `any`  
  The appropriately coerced value.

- **options** (optional): `object`  
  Additional options for how the field is cleaned.

**Returns:** `any`  
The cleaned value.

---

### _isValidChoice

```typescript
protected _isValidChoice(value: string): boolean
```

Test whether a provided value is a valid choice from the allowed choice set.

Inherited from [StringField._isValidChoice](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_isvalidchoice)

**Parameters**

- **value**: `string`  
  The provided value

**Returns:** `boolean`  
Is the choice valid?