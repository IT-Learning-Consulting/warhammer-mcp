# ArrayField | Foundry Virtual Tabletop - API Documentation - Version 13

A subclass of [foundry.data.fields.DataField](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html) which deals with array-typed data.

## Type Parameters

- `ElementType` = *[DataField](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html)*

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.ArrayField), Expand)

- *DataField*
- **ArrayField**
- *EmbeddedCollectionField*
- *SetField*

---

## Constructors

### constructor

```typescript
new ArrayField<ElementType = DataField>(
    element: ElementType,
    options?: ArrayFieldOptions,
    context?: DataFieldContext,
): ArrayField<ElementType>
```

**Type Parameters**

**Parameters**

- **element**: *ElementType*  
  The type of element contained in the Array

- **options**: *ArrayFieldOptions* = {}  
  Options which configure the behavior of the field

- **context**: *DataFieldContext* = {}  
  Additional context which describes the field

**Returns**

*ArrayField<ElementType>*

Overrides [DataField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#constructor)

---

## Properties

- **element**: *ElementType*  
  The data type of each element in this array

- **options**: *DataFieldOptions*  
  The initially provided options which configure the data field  
  Inherited from [DataField.options](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#options)

### Static

- **hierarchical**: *boolean* = false  
  Whether this field defines part of a Document/Embedded Document hierarchy.  
  Inherited from [DataField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#hierarchical)

---

## Accessors

### Static

- **recursive**: *boolean* = true  
  Overrides [DataField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#recursive)

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

**Returns**

*string*  
Inherited from DataField.fieldPath

### Static

- **_defaults**

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

**Returns**

*DataFieldOptions* & {
  - empty: boolean;
  - exact: undefined;
  - max: number;
  - min: number;
  - nullable: boolean;
  - required: boolean;
}

Overrides DataField._defaults

### hasFormSupport

```typescript
get hasFormSupport(): boolean
```

Does this form field class have defined form support?

**Returns**

*boolean*  
Inherited from DataField.hasFormSupport

---

## Methods

### _applyChangeAdd

```typescript
_applyChangeAdd(value: any, delta: any, model: any, change: any): any
```

Overrides [DataField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeadd)

**Parameters**

- **value**: *any*
- **delta**: *any*
- **model**: *any*
- **change**: *any*

**Returns**

*any*

---

### _cast

```typescript
_cast(value: any): any[]
```

Overrides [DataField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cast)

**Parameters**

- **value**: *any*

**Returns**

*any[]*

---

### _castChangeDelta

```typescript
_castChangeDelta(raw: any): any[]
```

Overrides [DataField._castChangeDelta](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_castchangedelta)

**Parameters**

- **raw**: *any*

**Returns**

*any[]*

---

### _cleanType

```typescript
_cleanType(value: any, options: any): any
```

Overrides [DataField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cleantype)

**Parameters**

- **value**: *any*
- **options**: *any*

**Returns**

*any*

---

### _getField

```typescript
_getField(path: any): any
```

Overrides [DataField._getField](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_getfield)

**Parameters**

- **path**: *any*

**Returns**

*any*

---

### _updateCommit

```typescript
_updateCommit(source: any, key: any, value: any, diff: any, options: any): void
```

Commit array field changes by replacing array contents while preserving the array reference itself.

Overrides [DataField._updateCommit](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_updatecommit)

**Parameters**

- **source**: *any*
- **key**: *any*
- **value**: *any*
- **diff**: *any*
- **options**: *any*

**Returns**

*void*

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

Overrides [DataField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_updatediff)

**Parameters**

- **source**: *any*
- **key**: *any*
- **value**: *any*
- **difference**: *any*
- **options**: *any*

**Returns**

*void*

---

### _validateModel

```typescript
_validateModel(changes: any, options: any): void
```

Overrides [DataField._validateModel](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatemodel)

**Parameters**

- **changes**: *any*
- **options**: *any*

**Returns**

*void*

---

### _validateType

```typescript
_validateType(value: any, options?: {}): void | DataModelValidationFailure
```

Overrides [DataField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatetype)

**Parameters**

- **value**: *any*
- **options**: *{}* = {}

**Returns**

*void* | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)

---

### apply

```typescript
apply(fn: any, value?: any[], options?: {}): any[]
```

Overrides [DataField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#apply)

**Parameters**

- **fn**: *any*
- **value**: *any[]* = []
- **options**: *{}* = {}

**Returns**

*any[]*

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

- **value**: *any*  
  The field's current value.

- **model**: *DataModel<object, DataModelConstructionContext>*  
  The model instance.

- **change**: *EffectChangeData*  
  The change to apply.

**Returns**

*any*  
The updated value.

Inherited from [DataField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#applychange)

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters**

- **value**: *any*  
  An initial requested value  
  Optional

- **options**: *{ partial?: boolean; source?: object }* = {}  
  Additional options for how the field is cleaned  
  Optional

  - **partial**?: *boolean*  
    Whether to perform partial cleaning?  
    Optional

  - **source**?: *object*  
    The root data model being cleaned  
    Optional

**Returns**

*any*  
The cast value

Inherited from [DataField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#clean)

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

Overrides [DataField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#getinitialvalue)

**Parameters**

- **data**: *any*

**Returns**

*any*

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

Overrides [DataField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#initialize)

**Parameters**

- **value**: *any*
- **model**: *any*
- **options**: *{}* = {}

**Returns**

*any*

---

### migrateSource

```typescript
migrateSource(sourceData: object, fieldData: any): void
```

Migrate this field's candidate source data.

**Parameters**

- **sourceData**: *object*  
  Candidate source data of the root model

- **fieldData**: *any*  
  The value of this field within the source data

**Returns**

*void*

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

- **groupConfig**: *FormGroupConfig* = {}  
  Configuration options passed to the wrapping form-group

- **inputConfig**: *FormInputConfig* = {}  
  Input element configuration options passed to DataField#toInput

**Returns**

*HTMLDivElement*  
The rendered form group element

Inherited from [DataField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toformgroup)

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters**

- **config**: *FormInputConfig* = {}  
  Form element configuration parameters

**Returns**

*HTMLElement* | *HTMLCollection*  
A rendered HTMLElement for the field

**Throws**

An Error if this DataField subclass does not support input rendering

Inherited from [DataField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toinput)

---

### toObject

```typescript
toObject(value: any): any
```

Overrides [DataField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toobject)

**Parameters**

- **value**: *any*

**Returns**

*any*

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

- **value**: *any*  
  The initial value  
  Optional

- **options**: *DataFieldValidationOptions* = {}  
  Options which affect validation behavior

**Returns**

*void* | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)  
Returns a DataModelValidationFailure if a validation failure occurred.

Inherited from [DataField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#validate)

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

**Parameters**

- **value**: *any*  
  The field's current value.

- **delta**: *any*  
  The change delta.

- **model**: *DataModel<object, DataModelConstructionContext>*  
  The model instance.

- **change**: *EffectChangeData*  
  The original change data.

**Returns**

*any*  
The updated value.

Inherited from [DataField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangecustom)

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

- **value**: *any*  
  The field's current value.

- **delta**: *any*  
  The change delta.

- **model**: *DataModel<object, DataModelConstructionContext>*  
  The model instance.

- **change**: *EffectChangeData*  
  The original change data.

**Returns**

*any*  
The updated value.

Inherited from [DataField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangedowngrade)

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

- **value**: *any*  
  The field's current value.

- **delta**: *any*  
  The change delta.

- **model**: *DataModel<object, DataModelConstructionContext>*  
  The model instance.

- **change**: *EffectChangeData*  
  The original change data.

**Returns**

*any*  
The updated value.

Inherited from [DataField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangemultiply)

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

- **value**: *any*  
  The field's current value.

- **delta**: *any*  
  The change delta.

- **model**: *DataModel<object, DataModelConstructionContext>*  
  The model instance.

- **change**: *EffectChangeData*  
  The original change data.

**Returns**

*any*  
The updated value.

Inherited from [DataField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeoverride)

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

- **value**: *any*  
  The field's current value.

- **delta**: *any*  
  The change delta.

- **model**: *DataModel<object, DataModelConstructionContext>*  
  The model instance.

- **change**: *EffectChangeData*  
  The original change data.

**Returns**

*any*  
The updated value.

Inherited from [DataField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeupgrade)

---

### _toInput

```typescript
_toInput(config: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element. Subclasses should implement this method rather than the public toInput method which wraps it.

**Parameters**

- **config**: *FormInputConfig*  
  Form element configuration parameters

**Returns**

*HTMLElement* | *HTMLCollection*  
A rendered HTMLElement for the field

**Throws**

An Error if this DataField subclass does not support input rendering

Inherited from [DataField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_toinput)

---

### _validateElement

```typescript
_validateElement(
    value: any,
    options: DataFieldValidationOptions,
): DataModelValidationFailure
```

Validate a single element of the ArrayField.

**Parameters**

- **value**: *any*  
  The value of the array element

- **options**: *DataFieldValidationOptions*  
  Validation options

**Returns**

*DataModelValidationFailure*  
A validation failure if the element failed validation

---

### _validateElements

```typescript
_validateElements(
    value: any[],
    options: DataFieldValidationOptions,
): void | DataModelValidationFailure
```

Validate every element of the ArrayField

**Parameters**

- **value**: *any[]*  
  The array to validate

- **options**: *DataFieldValidationOptions*  
  Validation options

**Returns**

*void* | *DataModelValidationFailure*  
A validation failure if any of the elements failed validation, otherwise void

---

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.

**Parameters**

- **value**: *any*  
  The candidate value

**Returns**

*boolean* | *void*  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**

May throw a specific error if the value is not valid

Inherited from [DataField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatespecial)

---

### Static _validateElementType

```typescript
_validateElementType(element: any): ElementType
```

Validate the contained element type of the ArrayField

**Parameters**

- **element**: *any*  
  The type of Array element

**Returns**

*ElementType*  
The validated element type

**Throws**

An error if the element is not a valid type