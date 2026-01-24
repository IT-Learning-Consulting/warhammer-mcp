# PackageCompendiumPacks | Foundry Virtual Tabletop - API Documentation - Version 13

A special SetField which provides additional validation and initialization behavior specific to compendium packs.

## Hierarchy
- [SetField](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html)
- **PackageCompendiumPacks**  
  [View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.PackageCompendiumPacks)

---

## Constructors

### constructor

```typescript
new PackageCompendiumPacks(
    element: DataField,
    options?: ArrayFieldOptions,
    context?: DataFieldContext,
): PackageCompendiumPacks
```

**Parameters**

- **element**: `DataField`  
  The type of element contained in the Array
- **options** (optional): `ArrayFieldOptions = {}`  
  Options which configure the behavior of the field
- **context** (optional): `DataFieldContext = {}`  
  Additional context which describes the field

**Returns**

- `PackageCompendiumPacks`  

Inherited from [SetField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#constructor)

---

## Properties

- **element**: `DataField`  
  The data type of each element in this array  
  Inherited from [SetField.element](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#element)

- **options**: `DataFieldOptions`  
  The initially provided options which configure the data field  
  Inherited from [SetField.options](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#options)

- **context** (optional): `DataFieldContext = {}`  
  Additional context which describes the field

- **hierarchical** (static): `boolean = false`  
  Whether this field defines part of a Document/Embedded Document hierarchy.  
  Inherited from [SetField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#hierarchical)

- **recursive** (static): `boolean = true`  
  Inherited from [SetField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#recursive)

---

## Accessors

- **fieldPath**

  ```typescript
  get fieldPath(): string
  ```

  A dot-separated string representation of the field path within the parent schema.

  Returns `string`  
  Inherited from [SetField.fieldPath](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#fieldPath)

- **_defaults** (static)

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

  Returns  
  `DataFieldOptions & {
    empty: boolean;
    exact: undefined;
    max: number;
    min: number;
    nullable: boolean;
    required: boolean;
  }`  

  Inherited from [SetField._defaults](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_defaults)

- **hasFormSupport** (static)

  ```typescript
  get hasFormSupport(): boolean
  ```

  Does this form field class have defined form support?

  Returns `boolean`  

---

## Methods

### _applyChangeAdd

```typescript
_applyChangeAdd(value: any, delta: any, model: any, change: any): any
```

**Parameters**

- **value**: `any`
- **delta**: `any`
- **model**: `any`
- **change**: `any`

**Returns**  
`any`

Inherited from [SetField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_applyChangeAdd)

---

### _cast

```typescript
_cast(value: any): any[]
```

**Parameters**

- **value**: `any`

**Returns**  
`any[]`

Inherited from [SetField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_cast)

---

### _castChangeDelta

```typescript
_castChangeDelta(raw: any): Set<any>
```

**Parameters**

- **raw**: `any`

**Returns**  
`Set<any>`

Inherited from [SetField._castChangeDelta](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_castChangeDelta)

---

### _cleanType

```typescript
_cleanType(value: any, options: any): any
```

**Parameters**

- **value**: `any`
- **options**: `any`

**Returns**  
`any`

Overrides [SetField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_cleanType)

---

### _getField

```typescript
_getField(path: any): any
```

**Parameters**

- **path**: `any`

**Returns**  
`any`

Inherited from [SetField._getField](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_getField)

---

### _toInput

```typescript
_toInput(config: any): any
```

**Parameters**

- **config**: `any`

**Returns**  
`any`

Inherited from [SetField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_toInput)

---

### _updateCommit

```typescript
_updateCommit(source: any, key: any, value: any, diff: any, options: any): void
```

Commit array field changes by replacing array contents while preserving the array reference itself.

**Parameters**

- **source**: `any`
- **key**: `any`
- **value**: `any`
- **diff**: `any`
- **options**: `any`

**Returns**  
`void`

Inherited from [SetField._updateCommit](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_updateCommit)

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

Inherited from [SetField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_updateDiff)

---

### _validateElement

```typescript
_validateElement(
    value: any,
    __namedParameters?: {},
): void | DataModelValidationFailure
```

Validate a single element of the ArrayField.

**Parameters**

- **value**: `any`  
  The value of the array element
- **__namedParameters** (optional): `{}`  
  Validation options

**Returns**  
`void | DataModelValidationFailure`  
A validation failure if the element failed validation

Overrides [SetField._validateElement](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_validateElement)

---

### _validateElements

```typescript
_validateElements(
    value: any,
    options: any,
): undefined | DataModelValidationFailure
```

**Parameters**

- **value**: `any`
- **options**: `any`

**Returns**  
`undefined | DataModelValidationFailure`

Overrides [SetField._validateElements](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_validateElements)

---

### _validateModel

```typescript
_validateModel(changes: any, options: any): void
```

**Parameters**

- **changes**: `any`
- **options**: `any`

**Returns**  
`void`

Inherited from [SetField._validateModel](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_validateModel)

---

### _validateType

```typescript
_validateType(value: any, options?: {}): void | DataModelValidationFailure
```

**Parameters**

- **value**: `any`
- **options** (optional): `{}`

**Returns**  
`void | DataModelValidationFailure`

Inherited from [SetField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_validateType)

---

### apply

```typescript
apply(fn: any, value?: any[], options?: {}): any[]
```

**Parameters**

- **fn**: `any`
- **value** (optional): `any[] = []`
- **options** (optional): `{}`

**Returns**  
`any[]`

Inherited from [SetField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#apply)

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

Inherited from [SetField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#applyChange)

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters**

- **value**: `any`  
  An initial requested value
- **options** (optional): `{ partial?: boolean; source?: object } = {}`  
  Additional options for how the field is cleaned  
  - **partial** (optional): `boolean`  
    Whether to perform partial cleaning?  
  - **source** (optional): `object`  
    The root data model being cleaned

**Returns**  
`any`

Inherited from [SetField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#clean)

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

**Parameters**

- **data**: `any`

**Returns**  
`any`

Inherited from [SetField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#getInitialValue)

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): Set<any>
```

**Parameters**

- **value**: `any`
- **model**: `any`
- **options** (optional): `{}`

**Returns**  
`Set<any>`

Overrides [SetField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#initialize)

---

### migrateSource

```typescript
migrateSource(sourceData: object, fieldData: any): void
```

Migrate this field's candidate source data.

**Parameters**

- **sourceData**: `object`  
  Candidate source data of the root model
- **fieldData**: `any`  
  The value of this field within the source data

**Returns**  
`void`

Inherited from [SetField.migrateSource](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#migrateSource)

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

- **groupConfig** (optional): `FormGroupConfig = {}`  
  Configuration options passed to the wrapping form-group
- **inputConfig** (optional): `FormInputConfig = {}`  
  Input element configuration options passed to DataField#toInput

**Returns**  
`HTMLDivElement`  
The rendered form group element  

Inherited from [SetField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#toFormGroup)

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters**

- **config** (optional): `FormInputConfig = {}`  
  Form element configuration parameters

**Returns**  
`HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field

**Throws**  
An Error if this DataField subclass does not support input rendering

Inherited from [SetField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#toInput)

---

### toObject

```typescript
toObject(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**  
`any`

Inherited from [SetField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#toObject)

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
- **options** (optional): `DataFieldValidationOptions = {}`  
  Options which affect validation behavior

**Returns**  
`void | DataModelValidationFailure`  
Returns a DataModelValidationFailure if a validation failure occurred.

Inherited from [SetField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#validate)

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

Inherited from [SetField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_applyChangeCustom)

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

**Returns**  
`any`  
The updated value.

Inherited from [SetField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_applyChangeDowngrade)

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

**Returns**  
`any`  
The updated value.

Inherited from [SetField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_applyChangeMultiply)

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

**Returns**  
`any`  
The updated value.

Inherited from [SetField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_applyChangeOverride)

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

**Returns**  
`any`  
The updated value.

Inherited from [SetField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_applyChangeUpgrade)

---

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
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

Inherited from [SetField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_validateSpecial)

---

### _validateElementType

```typescript
_validateElementType(element: any): ElementType
```

Validate the contained element type of the ArrayField

**Parameters**

- **element**: `any`  
  The type of Array element

**Returns**  
`ElementType`  
The validated element type

**Throws**  
An error if the element is not a valid type

Inherited from [SetField._validateElementType](https://foundryvtt.com/api/classes/foundry.data.fields.SetField.html#_validateElementType)