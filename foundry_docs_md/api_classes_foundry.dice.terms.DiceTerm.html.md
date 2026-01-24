# DiceTerm | Foundry Virtual Tabletop - API Documentation - Version 13

An abstract base class for any type of RollTerm which involves randomized input from dice, coins, or other devices.

## Hierarchy  
- _RollTerm_  
- **DiceTerm**  
  - _Coin_  
  - _Die_  
  - _FateDie_

---

## Constructors

### constructor

```typescript
new DiceTerm(
    termData: {
        faces?: number | Roll;
        method: string;
        modifiers?: string[];
        number?: number | Roll;
        options?: object;
        results?: DiceTermResult[];
    },
): DiceTerm
```

**Parameters**

- **termData**:  
  Data used to create the Dice Term, including the following:

  - **Optional**  
    **faces**?: `number` | [`Roll`](https://foundryvtt.com/api/classes/foundry.dice.Roll.html)  
    The number of faces on each die of this type, or a Roll instance that will be evaluated to a number.

  - **method**: `string`  
    The resolution method used to resolve DiceTerm.

  - **Optional**  
    **modifiers**?: `string`[]  
    An array of modifiers applied to the results.

  - **Optional**  
    **number**?: `number` | [`Roll`](https://foundryvtt.com/api/classes/foundry.dice.Roll.html)  
    The number of dice of this term to roll, before modifiers are applied, or a Roll instance that will be evaluated to a number.

  - **Optional**  
    **options**?: `object`  
    Additional options that modify the term.

  - **Optional**  
    **results**?: `DiceTermResult`[]  
    An optional array of pre-cast results for the term.

---

## Properties

### isIntermediate

```typescript
isIntermediate: boolean = false
```

Is this term intermediate, and should be evaluated first as part of the simplification process?  
Inherited from [RollTerm.isIntermediate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isintermediate)

### modifiers

```typescript
modifiers: string[]
```

An Array of dice term modifiers which are applied.

### options

```typescript
options: object
```

An object of additional options which describes and modifies the term.  
Inherited from [RollTerm.options](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#options)

### results

```typescript
results: DiceTermResult[]
```

The array of dice term results which have been rolled.

### _faces _(protected)_

```typescript
_faces: number | Roll
```

The number of faces on the die, or a Roll instance that will be evaluated to a number.

### _number _(protected)_

```typescript
_number: number | Roll
```

The number of dice of this term to roll, before modifiers are applied, or a Roll instance that will be evaluated to a number.

### DENOMINATION (static)

```typescript
static DENOMINATION: string = ""
```

Define the denomination string used to register this DiceTerm type in `CONFIG.Dice.terms`

### FLAVOR_REGEXP (static)

```typescript
static FLAVOR_REGEXP: RegExp = ...
```

A regular expression which identifies term-level flavor text.  
Inherited from [RollTerm.FLAVOR_REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp)

### FLAVOR_REGEXP_STRING (static)

```typescript
static FLAVOR_REGEXP_STRING: string = "(?:\\[([^\\]]+)\\])"
```

A regular expression pattern which identifies optional term-level flavor text.  
Inherited from [RollTerm.FLAVOR_REGEXP_STRING](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp_string)

### MODIFIER_REGEXP (static)

```typescript
static MODIFIER_REGEXP: RegExp = ...
```

A regular expression used to separate individual modifiers.

### MODIFIERS (static)

```typescript
static MODIFIERS: Record<string, string | Function> = {}
```

Define the named modifiers that can be applied for this particular DiceTerm type.

### MODIFIERS_REGEXP_STRING (static)

```typescript
static MODIFIERS_REGEXP_STRING: string = "([^ (){}[\\]+\\-*/]+)"
```

A regular expression pattern which captures the full set of term modifiers. Anything until a space, group symbol, or arithmetic operator.

### REGEXP (static)

```typescript
static REGEXP: RegExp = ...
```

A regular expression used to match a term of this type.  
Overrides [RollTerm.REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#regexp)

### SERIALIZE_ATTRIBUTES (static)

```typescript
static SERIALIZE_ATTRIBUTES: string[] = ...
```

An array of additional attributes which should be retained when the term is serialized.  
Overrides [RollTerm.SERIALIZE_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#serialize_attributes)

---

## Accessors

### denomination

```typescript
get denomination(): string
```

The denomination of this DiceTerm instance.

**Returns:** `string`

### dice

```typescript
get dice(): DiceTerm[]
```

An array of additional DiceTerm instances involved in resolving this DiceTerm.

**Returns:** `DiceTerm[]`

### expression

```typescript
get expression(): string
```

A string representation of the formula expression for this RollTerm, prior to evaluation.  
Overrides RollTerm.expression

**Returns:** `string`

### faces

```typescript
get faces(): number | void
set faces(value: number | Roll): void
```

The number of faces on the die. Returns `undefined` if the faces are represented as a complex term that has not yet been evaluated.

**Parameters**

- **value**: `number` | [`Roll`](https://foundryvtt.com/api/classes/foundry.dice.Roll.html)

**Returns:** `void`

### flavor

```typescript
get flavor(): string
```

Optional flavor text which modifies and describes this term.  
Inherited from RollTerm.flavor

**Returns:** `string`

### formula

```typescript
get formula(): string
```

A string representation of the formula, including optional flavor text.  
Inherited from RollTerm.formula

**Returns:** `string`

### isDeterministic

```typescript
get isDeterministic(): boolean
```

Whether this term is entirely deterministic or contains some randomness.  
Overrides RollTerm.isDeterministic

**Returns:** `boolean`

### method

```typescript
get method(): string
```

The resolution method used to resolve this DiceTerm.

**Returns:** `string`

### number

```typescript
get number(): number | void
set number(value: number | Roll): void
```

The number of dice of this term to roll. Returns `undefined` if the number is a complex term that has not yet been evaluated.

**Parameters**

- **value**: `number` | [`Roll`](https://foundryvtt.com/api/classes/foundry.dice.Roll.html)

**Returns:** `void`

### resolver

```typescript
get resolver(): RollResolver
```

A reference to the [`RollResolver`](https://foundryvtt.com/api/classes/foundry.applications.dice.RollResolver.html) app being used to externally resolve this term.  
Inherited from RollTerm.resolver

**Returns:** `RollResolver`

### total

```typescript
get total(): undefined | number
```

A string or numeric representation of the final output for this term, after evaluation.  
Overrides RollTerm.total

**Returns:** `undefined` | `number`

### values

```typescript
get values(): number[]
```

Return an array of rolled values which are still active within this term.

**Returns:** `number[]`

---

## Methods

### _evaluate

```typescript
_evaluate(options?: {}): DiceTerm | Promise<DiceTerm>
```

Evaluate the term.

**Parameters**

- **options**: `{}` = `{}`  
Options which modify how the RollTerm is evaluated, see [RollTerm#evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#evaluate)

**Returns:** `DiceTerm` | `Promise<DiceTerm>`  
Returns a Promise if the term is non-deterministic.  
Overrides [RollTerm._evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_evaluate)

### alter

```typescript
alter(multiply: number, add: number): DiceTerm
```

Alter the DiceTerm by adding or multiplying the number of dice which are rolled.

**Parameters**

- **multiply**: `number`  
  A factor to multiply. Dice are multiplied before any additions.
- **add**: `number`  
  A number of dice to add. Dice are added after multiplication.

**Returns:** `DiceTerm`  
The altered term.

### evaluate

```typescript
evaluate(
    options?: {
        allowStrings?: boolean;
        maximize?: boolean;
        minimize?: boolean;
    },
): RollTerm | Promise<RollTerm>
```

Evaluate the term, processing its inputs and finalizing its total.

**Parameters**

- **options** (Optional):  
  - **allowStrings**?: `boolean`  
    If true, string terms will not throw an error when evaluated.
  - **maximize**?: `boolean`  
    Maximize the result, obtaining the largest possible value.
  - **minimize**?: `boolean`  
    Minimize the result, obtaining the smallest possible value.

**Returns:** `RollTerm` | `Promise<RollTerm>`  
Returns a Promise if the term is non-deterministic.  
Inherited from [RollTerm.evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#evaluate)

### getResultCSS

```typescript
getResultCSS(result: DiceTermResult): (null | string)[]
```

Get the CSS classes that should be used to display each rolled result.

**Parameters**

- **result**: `DiceTermResult`  
  The rolled result.

**Returns:** `(null | string)[]`  
The desired classes.

### getResultLabel

```typescript
getResultLabel(result: DiceTermResult): string
```

Return a string used as the label for each rolled result.

**Parameters**

- **result**: `DiceTermResult`  
  The rolled result.

**Returns:** `string`  
The result label.

### getTooltipData

```typescript
getTooltipData(): object
```

Render the tooltip HTML for a Roll instance.

**Returns:** `object`  
The data object used to render the default tooltip template for this DiceTerm.

### mapRandomFace

```typescript
mapRandomFace(randomUniform: number): number
```

Maps a randomly-generated value in the interval [0, 1) to a face value on the die.

**Parameters**

- **randomUniform**: `number`  
  A value to map. Must be in the interval [0, 1).

**Returns:** `number`  
The face value.

### randomFace

```typescript
randomFace(): number
```

Generate a random face value for this die using the configured PRNG.

**Returns:** `number`

### roll

```typescript
roll(
    options?: { maximize?: boolean; minimize?: boolean },
): Promise<DiceTermResult>
```

Roll the DiceTerm by mapping a random uniform draw against the faces of the dice term.

**Parameters**

- **options** (Optional):  
  - **maximize**?: `boolean`  
    Maximize the result, obtaining the largest possible value.  
  - **minimize**?: `boolean`  
    Minimize the result, obtaining the smallest possible value.

**Returns:** `Promise<DiceTermResult>`  
The produced result.

### toJSON

```typescript
toJSON(): RollTermData
```

Serialize the RollTerm to a JSON string which allows it to be saved in the database or embedded in text. This method should return an object suitable for passing to the `JSON.stringify` function.

**Returns:** `RollTermData`  
Overrides [RollTerm.toJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#tojson)

---

## Protected Methods

### _evaluateAsync

```typescript
_protected _evaluateAsync(options?: object): Promise<DiceTerm>
```

Evaluate this dice term asynchronously.

**Parameters**

- **options** (Optional): `object` = `{}`  
  Options forwarded to inner Roll evaluation.

**Returns:** `Promise<DiceTerm>`

### _evaluateSync

```typescript
_protected _evaluateSync(
    options?: { maximize?: boolean; minimize?: boolean; strict?: boolean },
): DiceTerm
```

Evaluate deterministic values of this term synchronously.

**Parameters**

- **options** (Optional):  
  - **maximize**?: `boolean`  
    Force the result to be maximized.
  - **minimize**?: `boolean`  
    Force the result to be minimized.
  - **strict**?: `boolean`  
    Throw an error if attempting to evaluate a die term in a way that cannot be done synchronously.

**Returns:** `DiceTerm`

### _roll

```typescript
_protected _roll(options?: object): Promise<number | void>
```

Generate a roll result value for this DiceTerm based on its fulfillment method.

**Parameters**

- **options** (Optional): `object` = `{}`  
  Options forwarded to the fulfillment method handler.

**Returns:** `Promise<number | void>`  
Returns a Promise that resolves to the fulfilled number, or undefined if it could not be fulfilled.

---

## Static Methods

### _applyCount

```typescript
static _applyCount(
    results: any,
    comparison: any,
    target: any,
    __namedParameters?: { flagFailure?: boolean; flagSuccess?: boolean },
): void
```

A reusable helper function to handle the identification and deduction of failures.

**Parameters**

- **results**: `any`
- **comparison**: `any`
- **target**: `any`
- **__namedParameters** (Optional):
  - **flagFailure**?: `boolean`
  - **flagSuccess**?: `boolean`

**Returns:** `void`

### _applyDeduct

```typescript
static _applyDeduct(
    results: any,
    comparison: any,
    target: any,
    __namedParameters?: { deductFailure?: boolean; invertFailure?: boolean },
): void
```

A reusable helper function to handle the identification and deduction of failures.

**Parameters**

- **results**: `any`
- **comparison**: `any`
- **target**: `any`
- **__namedParameters** (Optional):
  - **deductFailure**?: `boolean`
  - **invertFailure**?: `boolean`

**Returns:** `void`

### _fromData

```typescript
static _fromData(data: any): RollTerm
```

Define term-specific logic for how a de-serialized data object is restored as a functional RollTerm.

**Parameters**

- **data**: `any`  
  The de-serialized term data.

**Returns:** `RollTerm`  
The re-constructed RollTerm object.  
Overrides [RollTerm._fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_fromdata)

### _keepOrDrop

```typescript
static _keepOrDrop(
    results: object[],
    number: number,
    options?: { highest?: boolean; keep?: boolean },
): object[]
```

A helper method to modify the results array of a dice term by flagging certain results as kept or dropped.

**Parameters**

- **results**: `object[]`  
  The results array.
- **number**: `number`  
  The number to keep or drop.
- **options** (Optional):  
  - **highest**?: `boolean`  
    Keep the highest?
  - **keep**?: `boolean`  
    Keep results?

**Returns:** `object[]`  
The modified results array.

### compareResult

```typescript
static compareResult(result: number, comparison: string, target: number): boolean
```

A helper comparison function. Returns a boolean depending on whether the result compares favorably against the target.

**Parameters**

- **result**: `number`  
  The result being compared.
- **comparison**: `string`  
  The comparison operator in [=, <, <=, >, >=].
- **target**: `number`  
  The target value.

**Returns:** `boolean`  
Is the comparison true?

### fromData

```typescript
static fromData(data: RollTermData): RollTerm
```

Construct a RollTerm from a provided data object.

**Parameters**

- **data**: `RollTermData`  
  Provided data from an un-serialized term.

**Returns:** `RollTerm`  
The constructed RollTerm.  
Inherited from [RollTerm.fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromdata)

### fromJSON

```typescript
static fromJSON(json: string): RollTerm
```

Reconstruct a RollTerm instance from a provided JSON string.

**Parameters**

- **json**: `string`  
  A serialized JSON representation of a DiceTerm.

**Returns:** `RollTerm`  
A reconstructed RollTerm from the provided JSON.  
Inherited from [RollTerm.fromJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromjson)

### fromMatch

```typescript
static fromMatch(match: RegExpMatchArray): DiceTerm
```

Construct a term of this type given a matched regular expression array.

**Parameters**

- **match**: `RegExpMatchArray`  
  The matched regular expression array.

**Returns:** `DiceTerm`  
The constructed term.

### fromParseNode

```typescript
static fromParseNode(node: any): RollTerm
```

**Parameters**

- **node**: `any`

**Returns:** `RollTerm`  
Overrides [RollTerm.fromParseNode](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromparsenode)

### isDeterministic

```typescript
static isDeterministic(
    term: RollTerm,
    options?: { maximize?: boolean; minimize?: boolean },
): boolean
```

Determine if evaluating a given RollTerm with certain evaluation options can be done so deterministically.

**Parameters**

- **term**: `RollTerm`  
  The term.
- **options** (Optional):  
  - **maximize**?: `boolean`  
    Force the result to be maximized.
  - **minimize**?: `boolean`  
    Force the result to be minimized.

**Returns:** `boolean`  
Inherited from [RollTerm.isDeterministic](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isdeterministic-2)

### matchTerm

```typescript
static matchTerm(
    expression: string,
    options?: { imputeNumber?: boolean },
): null | RegExpMatchArray
```

Determine whether a string expression matches this type of term.

**Parameters**

- **expression**: `string`  
  The expression to parse.
- **options** (Optional):  
  - **imputeNumber**?: `boolean`  
    Allow the number of dice to be optional, i.e. "d6".

**Returns:** `null` | `RegExpMatchArray`

---

For more information and full API documentation, visit the [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html).