# JavaScriptField | Foundry Virtual Tabletop - API Documentation - Version 13

A subclass of [foundry.data.fields.StringField which contains JavaScript code.](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html)

## Hierarchy

- [_StringField_](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html)  
- **JavaScriptField**

## Constructors

### constructor

```typescript
new JavaScriptField(
    options?: JavaScriptFieldOptions,
    context?: DataFieldContext,
): JavaScriptField
```

**Parameters**

- **options**: _JavaScriptFieldOptions_ (optional)  
  Options which configure the behavior of the field
- **context**: _DataFieldContext_ (optional)  
  Additional context which describes the field

**Returns**  
_JavaScriptField_

Overrides [StringField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#constructor)

## Properties

### blank

`blank: boolean`  
Is the string allowed to be blank (empty)?

Inherited from [StringField.blank](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#blank)

### options

`options: DataFieldOptions`  
The initially provided options which configure the data field

Inherited from [StringField.options](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#options)

### textSearch

`textSearch: boolean = ...`  
Is this string field a target for text search?

Inherited from [StringField.textSearch](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#textsearch)

### trim

`trim: boolean = ...`  
Should any provided string be trimmed as part of cleaning?

Inherited from [StringField.trim](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#trim)

### Static hierarchical

`hierarchical: boolean = false`  
Whether this field defines part of a Document/Embedded Document hierarchy.

Inherited from [StringField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#hierarchical)

### Static recursive

`recursive: boolean = false`  
Does this field type contain other fields in a recursive structure? Examples of recursive fields are SchemaField, ArrayField, or TypeDataField. Examples of non-recursive fields are StringField, NumberField, or ObjectField.

Inherited from [StringField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#recursive)

## Accessors

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

**Returns**  
_string_

Inherited from StringField.fieldPath

### _defaults

```typescript
get _defaults(): DataFieldOptions & {
    blank: boolean;
    choices: undefined;
    textSearch: boolean;
    trim: boolean;
} & {
    async: boolean;
    blank: boolean;
    nullable: boolean;
    required: boolean;
}
```

Default parameters for this field type.

**Returns**  
_DataFieldOptions & { blank: boolean; choices: undefined; textSearch: boolean; trim: boolean; } & { async: boolean; blank: boolean; nullable: boolean; required: boolean; }_

Overrides StringField._defaults

### hasFormSupport

```typescript
static get hasFormSupport(): boolean
```

Does this form field class have defined form support?

**Returns**  
_boolean_

Inherited from StringField.hasFormSupport

## Methods

### _cast

```typescript
static _cast(value: any): string
```

**Parameters**

- **value**: _any_

**Returns**  
_string_

Inherited from [StringField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_cast)

### _toInput

```typescript
static _toInput(config: FormInputConfig & CodeMirrorInputConfig): HTMLCodeMirrorElement
```

**Parameters**

- **config**: _FormInputConfig & CodeMirrorInputConfig_  

**Returns**  
_HTMLCodeMirrorElement_

Overrides [StringField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_toinput)

### _validateSpecial

```typescript
static _validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.

**Parameters**

- **value**: _any_  
  The candidate value

**Returns**  
_boolean | void_  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**  
May throw a specific error if the value is not valid

Inherited from [StringField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_validatespecial)

### _validateType

```typescript
static _validateType(value: any, options: any): undefined | true
```

**Parameters**

- **value**: _any_
- **options**: _any_

**Returns**  
_undefined | true_

Overrides [StringField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_validatetype)

### apply

```typescript
apply(fn: string | Function, value: any, options?: object): object
```

Apply a function to this DataField which propagates through recursively to any contained data schema.

**Parameters**

- **fn**: _string | Function_  
  The function to apply
- **value**: _any_  
  The current value of this field
- **options**: _object_ = {} (optional)  
  Additional options passed to the applied function

**Returns**  
_object_

Inherited from [StringField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#apply)

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

- **value**: _any_  
  The field's current value.
- **model**: _DataModel<object, DataModelConstructionContext>_  
  The model instance.
- **change**: _EffectChangeData_  
  The change to apply.

**Returns**  
_any_  
The updated value.

Inherited from [StringField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#applychange)

### clean

```typescript
clean(value: any, options: any): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters**

- **value**: _any_  
  An initial requested value
- **options**: _any_  
  Additional options for how the field is cleaned

**Returns**  
_any_  
The cast value

Inherited from [StringField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#clean)

### getInitialValue

```typescript
getInitialValue(data: any): any
```

**Parameters**

- **data**: _any_

**Returns**  
_any_

Inherited from [StringField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#getinitialvalue)

### initialize

```typescript
initialize(value: any, model: Object, options?: object): any
```

Initialize the original source data into a mutable copy for the DataModel instance.

**Parameters**

- **value**: _any_  
  The source value of the field
- **model**: _Object_  
  The DataModel instance that this field belongs to
- **options**: _object_ = {} (optional)  
  Initialization options

**Returns**  
_any_  
An initialized copy of the source data

Inherited from [StringField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#initialize)

### toFormGroup

```typescript
toFormGroup(groupConfig?: {}, inputConfig?: {}): HTMLDivElement
```

**Parameters**

- **groupConfig**: _{}_ = {}  
- **inputConfig**: _{}_ = {}

**Returns**  
_HTMLDivElement_

Overrides [StringField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#toformgroup)

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters**

- **config**: _FormInputConfig_ = {}  
  Form element configuration parameters

**Returns**  
_HTMLHTMLElement | HTMLCollection_

**Throws**  
An Error if this DataField subclass does not support input rendering

Inherited from [StringField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#toinput)

### toObject

```typescript
toObject(value: any): any
```

Export the current value of the field into a serializable object.

**Parameters**

- **value**: _any_  
  The initialized value of the field

**Returns**  
_any_  
An exported representation of the field

Inherited from [StringField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#toobject)

### validate

```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions,
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

**Parameters**

- **value**: _any_  
  The initial value
- **options**: _DataFieldValidationOptions_ = {} (optional)  
  Options which affect validation behavior

**Returns**  
_void | DataModelValidationFailure_  
Returns a DataModelValidationFailure if a validation failure occurred.

Inherited from [StringField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#validate)

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

- **value**: _any_  
  The field's current value.
- **delta**: _any_  
  The change delta.
- **model**: _DataModel<object, DataModelConstructionContext>_  
  The model instance.
- **change**: _EffectChangeData_  
  The original change data.

**Returns**  
_any_  
The updated value.

Inherited from [StringField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangeadd)

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

- **value**: _any_  
  The field's current value.
- **delta**: _any_  
  The change delta.
- **model**: _DataModel<object, DataModelConstructionContext>_  
  The model instance.
- **change**: _EffectChangeData_  
  The original change data.

**Returns**  
_any_  
The updated value.

Inherited from [StringField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangecustom)

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

- **value**: _any_  
  The field's current value.
- **delta**: _any_  
  The change delta.
- **model**: _DataModel<object, DataModelConstructionContext>_  
  The model instance.
- **change**: _EffectChangeData_  
  The original change data.

**Returns**  
_any_  
The updated value.

Inherited from [StringField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangedowngrade)

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

- **value**: _any_  
  The field's current value.
- **delta**: _any_  
  The change delta.
- **model**: _DataModel<object, DataModelConstructionContext>_  
  The model instance.
- **change**: _EffectChangeData_  
  The original change data.

**Returns**  
_any_  
The updated value.

Inherited from [StringField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangemultiply)

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

- **value**: _any_  
  The field's current value.
- **delta**: _any_  
  The change delta.
- **model**: _DataModel<object, DataModelConstructionContext>_  
  The model instance.
- **change**: _EffectChangeData_  
  The original change data.

**Returns**  
_any_  
The updated value.

Inherited from [StringField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangeoverride)

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

- **value**: _any_  
  The field's current value.
- **delta**: _any_  
  The change delta.
- **model**: _DataModel<object, DataModelConstructionContext>_  
  The model instance.
- **change**: _EffectChangeData_  
  The original change data.

**Returns**  
_any_  
The updated value.

Inherited from [StringField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangeupgrade)

### _cleanType

```typescript
protected _cleanType(value: any, options?: object): any
```

Apply any cleaning logic specific to this DataField type.

**Parameters**

- **value**: _any_  
  The appropriately coerced value.
- **options**: _object_ (optional)  
  Additional options for how the field is cleaned.

**Returns**  
_any_  
The cleaned value.

Inherited from [StringField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_cleantype)

### _isValidChoice

```typescript
protected _isValidChoice(value: string): boolean
```

Test whether a provided value is a valid choice from the allowed choice set.

**Parameters**

- **value**: _string_  
  The provided value

**Returns**  
_boolean_  
Is the choice valid?

Inherited from [StringField._isValidChoice](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_isvalidchoice)