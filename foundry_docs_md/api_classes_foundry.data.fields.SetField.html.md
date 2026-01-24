# SetField

A subclass of [foundry.data.fields.ArrayField](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html) which supports a set of contained elements.  
Elements in this set are treated as fungible and may be represented in any order or discarded if invalid.

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.SetField), Expand):

- *ArrayField*
- **SetField**
- *PackageCompendiumPacks*

---

## Constructors

### constructor

```typescript
new SetField(
    element: DataField,
    options?: ArrayFieldOptions,
    context?: DataFieldContext,
): SetField
```

**Parameters:**

- **element**: _DataField_  
  The type of element contained in the Array

- **options** (Optional): _ArrayFieldOptions_ = {}  
  Options which configure the behavior of the field

- **context** (Optional): _DataFieldContext_ = {}  
  Additional context which describes the field

**Returns:**  
_SetField_  

Inherited from [ArrayField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#constructor)

---

## Properties

### element

**Type:** _DataField_  

The data type of each element in this array

Inherited from [ArrayField.element](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#element)

### options

**Type:** _DataFieldOptions_  

The initially provided options which configure the data field

Inherited from [ArrayField.options](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#options)

### hierarchical

**Type:** _boolean_ = false  

Whether this field defines part of a Document/Embedded Document hierarchy.

Inherited from [ArrayField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#hierarchical)

### recursive

**Type:** _boolean_ = true  

Inherited from [ArrayField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#recursive)

---

## Accessors

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

**Returns:**  
_string_  

Inherited from ArrayField.fieldPath

### _defaults

```typescript
get _defaults(): DataFieldOptions & {
    empty: boolean;
    exact: undefined;
    max: number;
    min: number;
    nullable: boolean;
    required: boolean;
}
```

Default parameters for this field type

**Returns:**  
_DataFieldOptions_ & {  
&nbsp;&nbsp;empty: _boolean_;  
&nbsp;&nbsp;exact: _undefined_;  
&nbsp;&nbsp;max: _number_;  
&nbsp;&nbsp;min: _number_;  
&nbsp;&nbsp;nullable: _boolean_;  
&nbsp;&nbsp;required: _boolean_;  
}

Inherited from ArrayField._defaults

### hasFormSupport

```typescript
get hasFormSupport(): boolean
```

Does this form field class have defined form support?

**Returns:**  
_boolean_  

Inherited from ArrayField.hasFormSupport

---

## Methods

### _applyChangeAdd

```typescript
_applyChangeAdd(value: any, delta: any, model: any, change: any): any
```

Overrides [ArrayField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_applychangeadd)  

**Parameters:**

- **value**: _any_  
- **delta**: _any_  
- **model**: _any_  
- **change**: _any_  

**Returns:**  
_any_

---

### _cast

```typescript
_cast(value: any): any[]
```

Inherited from [ArrayField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_cast)  

**Parameters:**

- **value**: _any_

**Returns:**  
_any[]_

---

### _castChangeDelta

```typescript
_castChangeDelta(raw: any): Set<any>
```

Overrides [ArrayField._castChangeDelta](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_castchangedelta)  

**Parameters:**

- **raw**: _any_

**Returns:**  
_Set<any>_

---

### _cleanType

```typescript
_cleanType(value: any, options: any): any
```

Inherited from [ArrayField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_cleantype)  

**Parameters:**

- **value**: _any_  
- **options**: _any_

**Returns:**  
_any_

---

### _getField

```typescript
_getField(path: any): any
```

Inherited from [ArrayField._getField](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_getfield)  

**Parameters:**

- **path**: _any_

**Returns:**  
_any_

---

### _toInput

```typescript
_toInput(config: any): any
```

Overrides [ArrayField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_toinput)  

**Parameters:**

- **config**: _any_

**Returns:**  
_any_

---

### _updateCommit

```typescript
_updateCommit(source: any, key: any, value: any, diff: any, options: any): void
```

Commit array field changes by replacing array contents while preserving the array reference itself.

Inherited from [ArrayField._updateCommit](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_updatecommit)  

**Parameters:**

- **source**: _any_  
- **key**: _any_  
- **value**: _any_  
- **diff**: _any_  
- **options**: _any_

**Returns:**  
_void_

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

Inherited from [ArrayField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_updatediff)  

**Parameters:**

- **source**: _any_  
- **key**: _any_  
- **value**: _any_  
- **difference**: _any_  
- **options**: _any_

**Returns:**  
_void_

---

### _validateElements

```typescript
_validateElements(
    value: any,
    options: any,
): undefined | DataModelValidationFailure
```

Overrides [ArrayField._validateElements](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_validateelements)  

**Parameters:**

- **value**: _any_  
- **options**: _any_

**Returns:**  
_undefined | DataModelValidationFailure_

---

### _validateModel

```typescript
_validateModel(changes: any, options: any): void
```

Inherited from [ArrayField._validateModel](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_validatemodel)  

**Parameters:**

- **changes**: _any_  
- **options**: _any_

**Returns:**  
_void_

---

### _validateType

```typescript
_validateType(value: any, options?: {}): void | DataModelValidationFailure
```

Inherited from [ArrayField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_validatetype)  

**Parameters:**

- **value**: _any_  
- **options** (Optional): _{}_ = {}

**Returns:**  
_void | DataModelValidationFailure_

---

### apply

```typescript
apply(fn: any, value?: any[], options?: {}): any[]
```

Inherited from [ArrayField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#apply)  

**Parameters:**

- **fn**: _any_  
- **value** (Optional): _any[]_ = []  
- **options** (Optional): _{}_ = {}

**Returns:**  
_any[]_

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

**Parameters:**

- **value**: _any_  
  The field's current value.

- **model**: _DataModel<object, DataModelConstructionContext>_  
  The model instance.

- **change**: _EffectChangeData_  
  The change to apply.

**Returns:**  
_any_  

Inherited from [ArrayField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#applychange)

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters:**

- **value**: _any_  
  An initial requested value

- **options** (Optional): _{ partial?: boolean; source?: object }_ = {}  
  Additional options for how the field is cleaned

  - **partial** (Optional): _boolean_  
    Whether to perform partial cleaning?

  - **source** (Optional): _object_  
    The root data model being cleaned

**Returns:**  
_any_  
The cast value

Inherited from [ArrayField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#clean)

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

Inherited from [ArrayField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#getinitialvalue)

**Parameters:**

- **data**: _any_

**Returns:**  
_any_

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

Overrides [ArrayField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#initialize)  

**Parameters:**

- **value**: _any_  
- **model**: _any_  
- **options** (Optional): _{}_ = {}

**Returns:**  
_any_

---

### migrateSource

```typescript
migrateSource(sourceData: object, fieldData: any): void
```

Migrate this field's candidate source data.

Inherited from [ArrayField.migrateSource](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#migratesource)

**Parameters:**

- **sourceData**: _object_  
  Candidate source data of the root model

- **fieldData**: _any_  
  The value of this field within the source data

**Returns:**  
_void_

---

### toFormGroup

```typescript
toFormGroup(
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```

Render this DataField as a standardized form-group element.

Inherited from [ArrayField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#toformgroup)

**Parameters:**

- **groupConfig** (Optional): _FormGroupConfig_ = {}  
  Configuration options passed to the wrapping form-group

- **inputConfig** (Optional): _FormInputConfig_ = {}  
  Input element configuration options passed to DataField#toInput

**Returns:**  
_HTMLDivElement_  
The rendered form group element

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

Inherited from [ArrayField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#toinput)

**Parameters:**

- **config** (Optional): _FormInputConfig_ = {}  
  Form element configuration parameters

**Returns:**  
_HTMLElement | HTMLCollection_  
A rendered HTMLElement for the field

**Throws:**  
An Error if this DataField subclass does not support input rendering

---

### toObject

```typescript
toObject(value: any): any
```

Overrides [ArrayField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#toobject)

**Parameters:**

- **value**: _any_

**Returns:**  
_any_

---

### validate

```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions,
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

Inherited from [ArrayField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#validate)

**Parameters:**

- **value**: _any_  
  The initial value

- **options** (Optional): _DataFieldValidationOptions_ = {}  
  Options which affect validation behavior

**Returns:**  
_void | DataModelValidationFailure_  
Returns a DataModelValidationFailure if a validation failure occurred.

---

## Protected Methods

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

**Parameters:**

- **value**: _any_  
  The field's current value.

- **delta**: _any_  
  The change delta.

- **model**: _DataModel<object, DataModelConstructionContext>_  
  The model instance.

- **change**: _EffectChangeData_  
  The original change data.

**Returns:**  
_any_  
The updated value.

Inherited from [ArrayField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_applychangecustom)

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

**Parameters:**

- **value**: _any_  
  The field's current value.

- **delta**: _any_  
  The change delta.

- **model**: _DataModel<object, DataModelConstructionContext>_  
  The model instance.

- **change**: _EffectChangeData_  
  The original change data.

**Returns:**  
_any_  
The updated value.

Inherited from [ArrayField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_applychangedowngrade)

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

**Parameters:**

- **value**: _any_  
  The field's current value.

- **delta**: _any_  
  The change delta.

- **model**: _DataModel<object, DataModelConstructionContext>_  
  The model instance.

- **change**: _EffectChangeData_  
  The original change data.

**Returns:**  
_any_  
The updated value.

Inherited from [ArrayField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_applychangemultiply)

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

**Parameters:**

- **value**: _any_  
  The field's current value.

- **delta**: _any_  
  The change delta.

- **model**: _DataModel<object, DataModelConstructionContext>_  
  The model instance.

- **change**: _EffectChangeData_  
  The original change data.

**Returns:**  
_any_  
The updated value.

Inherited from [ArrayField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_applychangeoverride)

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

**Parameters:**

- **value**: _any_  
  The field's current value.

- **delta**: _any_  
  The change delta.

- **model**: _DataModel<object, DataModelConstructionContext>_  
  The model instance.

- **change**: _EffectChangeData_  
  The original change data.

**Returns:**  
_any_  
The updated value.

Inherited from [ArrayField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_applychangeupgrade)

---

### _validateElement

```typescript
_validateElement(
    value: any,
    options: DataFieldValidationOptions,
): DataModelValidationFailure
```

Validate a single element of the ArrayField.

**Parameters:**

- **value**: _any_  
  The value of the array element

- **options**: _DataFieldValidationOptions_  
  Validation options

**Returns:**  
_DataModelValidationFailure_  
A validation failure if the element failed validation

Inherited from [ArrayField._validateElement](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_validateelement)

---

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.

**Parameters:**

- **value**: _any_  
  The candidate value

**Returns:**  
_boolean | void_  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws:**  
May throw a specific error if the value is not valid

Inherited from [ArrayField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_validatespecial)

---

### _validateElementType

```typescript
static _validateElementType(element: any): ElementType
```

Validate the contained element type of the ArrayField.

**Parameters:**

- **element**: _any_  
  The type of Array element

**Returns:**  
_ElementType_  
The validated element type

**Throws:**  
An error if the element is not a valid type

Inherited from [ArrayField._validateElementType](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_validateelementtype)