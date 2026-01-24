# Class Die

A type of [DiceTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html) used to represent rolling a fair n-sided die.

Example: Roll four six-sided dice

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.dice.terms.Die), Expand)

- DiceTerm  
- **Die**  

---

## Constructors

### constructor

```typescript
new Die(
    termData: {
        faces?: number | Roll;
        method: string;
        modifiers?: string[];
        number?: number | Roll;
        options?: object;
        results?: DiceTermResult[];
    },
): Die
```

**Parameters**

- **termData**: Object used to create the Dice Term, including the following:
  - **faces?**: `number | Roll`  
    The number of faces on each die of this type, or a Roll instance that will be evaluated to a number.
  - **method**: `string`  
    The resolution method used to resolve DiceTerm.
  - **modifiers?**: `string[]`  
    An array of modifiers applied to the results.
  - **number?**: `number | Roll`  
    The number of dice of this term to roll, before modifiers are applied, or a Roll instance that will be evaluated to a number.
  - **options?**: `object`  
    Additional options that modify the term.
  - **results?**: `DiceTermResult[]`  
    An optional array of pre-cast results for the term.

---

## Properties

### isIntermediate

```typescript
isIntermediate: boolean = false
```

Is this term intermediate, and should be evaluated first as part of the simplification process?

(Inherited from [DiceTerm.isIntermediate](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#isintermediate))

---

### modifiers

```typescript
modifiers: string[]
```

An Array of dice term modifiers which are applied.

(Inherited from [DiceTerm.modifiers](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#modifiers))

---

### options

```typescript
options: object
```

An object of additional options which describes and modifies the term.

(Inherited from [DiceTerm.options](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#options))

---

### results

```typescript
results: DiceTermResult[]
```

The array of dice term results which have been rolled.

(Inherited from [DiceTerm.results](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#results))

---

### _faces (protected)

```typescript
_faces: number | Roll
```

The number of faces on the die, or a Roll instance that will be evaluated to a number.

(Inherited from [DiceTerm._faces](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_faces))

---

### _number (protected)

```typescript
_number: number | Roll
```

The number of dice of this term to roll, before modifiers are applied, or a Roll instance that will be evaluated to a number.

(Inherited from [DiceTerm._number](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_number))

---

### DENOMINATION (static)

```typescript
static DENOMINATION: string = "d"
```

Define the denomination string used to register this DiceTerm type in CONFIG.Dice.terms.

Overrides [DiceTerm.DENOMINATION](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#denomination)

---

### FLAVOR_REGEXP (static)

```typescript
static FLAVOR_REGEXP: RegExp = ...
```

A regular expression which identifies term-level flavor text.

(Inherited from [DiceTerm.FLAVOR_REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#flavor_regexp))

---

### FLAVOR_REGEXP_STRING (static)

```typescript
static FLAVOR_REGEXP_STRING: string = "(?:\\[([^\\]]+)\\])"
```

A regular expression pattern which identifies optional term-level flavor text.

(Inherited from [DiceTerm.FLAVOR_REGEXP_STRING](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#flavor_regexp_string))

---

### MODIFIER_REGEXP (static)

```typescript
static MODIFIER_REGEXP: RegExp = ...
```

A regular expression used to separate individual modifiers.

(Inherited from [DiceTerm.MODIFIER_REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#modifier_regexp))

---

### MODIFIERS (static)

```typescript
static MODIFIERS: {
    cf: string;
    cs: string;
    d: string;
    df: string;
    dh: string;
    dl: string;
    even: string;
    k: string;
    kh: string;
    kl: string;
    max: string;
    min: string;
    ms: string;
    odd: string;
    r: string;
    rr: string;
    sf: string;
    x: string;
    xo: string;
}
```

Define the named modifiers that can be applied for this particular DiceTerm type.

Overrides [DiceTerm.MODIFIERS](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#modifiers-1)

---

### MODIFIERS_REGEXP_STRING (static)

```typescript
static MODIFIERS_REGEXP_STRING: string = "([^ (){}[\\]+\\-*/]+)"
```

A regular expression pattern which captures the full set of term modifiers — anything until a space, group symbol, or arithmetic operator.

(Inherited from [DiceTerm.MODIFIERS_REGEXP_STRING](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#modifiers_regexp_string))

---

### REGEXP (static)

```typescript
static REGEXP: RegExp = ...
```

A regular expression used to match a term of this type.

(Inherited from [DiceTerm.REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#regexp))

---

### SERIALIZE_ATTRIBUTES (static)

```typescript
static SERIALIZE_ATTRIBUTES: string[] = ...
```

An array of additional attributes which should be retained when the term is serialized.

(Inherited from [DiceTerm.SERIALIZE_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#serialize_attributes))

---

## Accessors

### denomination

```typescript
get denomination(): string
```

The denomination of this DiceTerm instance.

Overrides DiceTerm.denomination

---

### dice

```typescript
get dice(): DiceTerm[]
```

An array of additional DiceTerm instances involved in resolving this DiceTerm.

Returns: `DiceTerm[]`

Inherited from DiceTerm.dice

---

### expression

```typescript
get expression(): string
```

A string representation of the formula expression for this RollTerm, prior to evaluation.

Returns: `string`

Inherited from DiceTerm.expression

---

### faces

```typescript
get faces(): number | void
set faces(value: number | Roll): void
```

The number of faces on the die. Returns undefined if the faces are represented as a complex term that has not yet been evaluated.

**Parameters**

- **value**: `number | Roll`

Returns: `void`

Inherited from DiceTerm.faces

---

### flavor

```typescript
get flavor(): string
```

Optional flavor text which modifies and describes this term.

Returns: `string`

Inherited from DiceTerm.flavor

---

### formula

```typescript
get formula(): string
```

A string representation of the formula, including optional flavor text.

Returns: `string`

Inherited from DiceTerm.formula

---

### isDeterministic

```typescript
get isDeterministic(): boolean
```

Whether this term is entirely deterministic or contains some randomness.

Returns: `boolean`

Inherited from DiceTerm.isDeterministic

---

### method

```typescript
get method(): string
```

The resolution method used to resolve this DiceTerm.

Returns: `string`

Inherited from DiceTerm.method

---

### number

```typescript
get number(): number | void
set number(value: number | Roll): void
```

The number of dice of this term to roll. Returns undefined if the number is a complex term that has not yet been evaluated.

**Parameters**

- **value**: `number | Roll`

Returns: `void`

Inherited from DiceTerm.number

---

### resolver

```typescript
get resolver(): RollResolver
```

A reference to the RollResolver app being used to externally resolve this term.

Returns: `RollResolver`

Inherited from DiceTerm.resolver

---

### total

```typescript
get total(): undefined | number
```

A string or numeric representation of the final output for this term, after evaluation.

Returns: `undefined | number`

Overrides DiceTerm.total

---

### values

```typescript
get values(): number[]
```

Return an array of rolled values which are still active within this term.

Returns: `number[]`

Inherited from DiceTerm.values

---

## Methods

### _evaluate

```typescript
_evaluate(options?: {}): DiceTerm | Promise<DiceTerm>
```

Evaluate the term.

**Parameters**

- **options**: `{}` = {}  
  Options which modify how the RollTerm is evaluated, see RollTerm#evaluate

**Returns**

`DiceTerm | Promise<DiceTerm>`

Returns a Promise if the term is non-deterministic.

Inherited from [DiceTerm._evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_evaluate)

---

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

**Returns**

The altered term: `DiceTerm`

Inherited from [DiceTerm.alter](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#alter)

---

### countEven

```typescript
countEven(modifier: string): void
```

Count the number of even results which occurred in a given result set.  
Even numbers are marked as a success and counted as 1  
Odd numbers are marked as a non-success and counted as 0.

Example: `6d6even` - Count the number of even numbers rolled.

**Parameters**

- **modifier**: `string`  
  The matched modifier query (unused here, but passed to overrides anyway)

Returns: `void`

---

### countFailures

```typescript
countFailures(modifier: string): undefined | false
```

Count the number of failed results which occurred in a given result set. Failures are counted relative to some target, or relative to the lowest possible value if no target is given. Applying a count-failures modifier to the results re-casts all results to 1 (failure) or 0 (non-failure).

Examples:  
- `6d6cf` Count the number of dice which rolled a 1 as failures  
- `6d6cf<=3` Count the number of dice which rolled less than 3 as failures  
- `6d6cf>4` Count the number of dice which rolled greater than 4 as failures

**Parameters**

- **modifier**: `string`  
  The matched modifier query

Returns: `undefined | false`

---

### countOdd

```typescript
countOdd(modifier: string): void
```

Count the number of odd results which occurred in a given result set.  
Odd numbers are marked as a success and counted as 1  
Even numbers are marked as a non-success and counted as 0.

Example: `6d6odd` - Count the number of odd numbers rolled.

**Parameters**

- **modifier**: `string`  
  The matched modifier query (unused here, but passed to overrides anyway)

Returns: `void`

---

### countSuccess

```typescript
countSuccess(modifier: string): undefined | false
```

Count the number of successful results which occurred in a given result set. Successes are counted relative to some target, or relative to the maximum possible value if no target is given. Applying a count-success modifier to the results re-casts all results to 1 (success) or 0 (failure).

Examples:  
- `20d20cs` Count the number of dice which rolled a 20  
- `20d20cs>10` Count the number of dice which rolled higher than 10  
- `20d20cs<10` Count the number of dice which rolled less than 10

**Parameters**

- **modifier**: `string`  
  The matched modifier query

Returns: `undefined | false`

---

### deductFailures

```typescript
deductFailures(modifier: string): undefined | false
```

Deduct the number of failures from the dice result, counting each failure as -1. Failures are identified relative to some target, or relative to the lowest possible value if no target is given. Applying a deduct-failures modifier to the results counts all failed results as -1.

Examples:  
- `6d6df` Subtract the number of dice which rolled a 1 from the non-failed total.  
- `6d6cs>3df` Subtract the number of dice which rolled a 3 or less from the non-failed count.  
- `6d6cf<3df` Subtract the number of dice which rolled less than 3 from the non-failed count.

**Parameters**

- **modifier**: `string`  
  The matched modifier query

Returns: `undefined | false`

---

### drop

```typescript
drop(modifier: string): undefined | false
```

Drop a certain number of highest or lowest dice rolls from the result set.

Examples:  
- `20d20d` Drop the 1 lowest die  
- `20d20dh` Drop the 1 highest die  
- `20d20dl` Drop the 1 lowest die  
- `20d20dh10` Drop the 10 highest dice  
- `20d20dl10` Drop the 10 lowest dice

**Parameters**

- **modifier**: `string`  
  The matched modifier query

Returns: `undefined | false`

---

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

- Optional **options**:
  - **allowStrings?**: `boolean` - If true, string terms will not throw an error when evaluated.
  - **maximize?**: `boolean` - Maximize the result, obtaining the largest possible value.
  - **minimize?**: `boolean` - Minimize the result, obtaining the smallest possible value.

**Returns**

`RollTerm | Promise<RollTerm>`

Returns a Promise if the term is non-deterministic.

(Inherited from [DiceTerm.evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#evaluate))

---

### explode

```typescript
explode(modifier: string, recursive?: boolean): Promise<false | void>
```

Explode the Die, rolling additional results for any values which match the target set. If no target number is specified, explode the highest possible result. Explosion can be a "small explode" using a lower-case x or a "big explode" using an upper-case "X".

**Parameters**

- **modifier**: `string`  
  The matched modifier query.
- **recursive?**: `boolean` = false  
  Explode recursively, such that new rolls can also explode?

**Returns**

`Promise<false | void>`

---

### explodeOnce

```typescript
explodeOnce(modifier: string): Promise<false | void>
```

Explode non-recursively.

**Parameters**

- **modifier**: `string`

**Returns**

`Promise<false | void>`

See also: [Die#explode](https://foundryvtt.com/api/classes/foundry.dice.terms.Die.html#explode)

---

### getResultCSS

```typescript
getResultCSS(result: DiceTermResult): (null | string)[]
```

Get the CSS classes that should be used to display each rolled result.

**Parameters**

- **result**: `DiceTermResult`  
  The rolled result.

**Returns**

An array of strings or null values representing the desired CSS classes.

(Inherited from [DiceTerm.getResultCSS](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#getresultcss))

---

### getResultLabel

```typescript
getResultLabel(result: DiceTermResult): string
```

Return a string used as the label for each rolled result.

**Parameters**

- **result**: `DiceTermResult`  
  The rolled result.

**Returns**

The result label.

(Inherited from [DiceTerm.getResultLabel](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#getresultlabel))

---

### getTooltipData

```typescript
getTooltipData(): object
```

Render the tooltip HTML for a Roll instance.

**Returns**

The data object used to render the default tooltip template for this DiceTerm.

(Inherited from [DiceTerm.getTooltipData](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#gettooltipdata))

---

### keep

```typescript
keep(modifier: string): undefined | false
```

Keep a certain number of highest or lowest dice rolls from the result set.

Examples:  
- `20d20k` Keep the 1 highest die  
- `20d20kh` Keep the 1 highest die  
- `20d20kh10` Keep the 10 highest dice  
- `20d20kl` Keep the 1 lowest die  
- `20d20kl10` Keep the 10 lowest dice

**Parameters**

- **modifier**: `string`  
  The matched modifier query.

Returns: `undefined | false`

---

### mapRandomFace

```typescript
mapRandomFace(randomUniform: number): number
```

Maps a randomly-generated value in the interval [0, 1) to a face value on the die.

**Parameters**

- **randomUniform**: `number`  
  A value to map. Must be in the interval [0, 1).

**Returns**

The face value.

(Inherited from [DiceTerm.mapRandomFace](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#maprandomface))

---

### marginSuccess

```typescript
marginSuccess(modifier: string): undefined | false
```

Subtract the total value of the DiceTerm from a target value, treating the difference as the final total.

Example: `6d6ms>12` - Roll 6d6 and subtract 12 from the resulting total.

**Parameters**

- **modifier**: `string`  
  The matched modifier query.

Returns: `undefined | false`

---

### maximum

```typescript
maximum(modifier: string): undefined | false
```

Constrain each rolled result to be at most some maximum value.

Example: `6d6max5` - Roll 6d6, each result must be at most 5.

**Parameters**

- **modifier**: `string`

Returns: `undefined | false`

---

### minimum

```typescript
minimum(modifier: string): undefined | false
```

Constrain each rolled result to be at least some minimum value.

Example: `6d6min2` - Roll 6d6, each result must be at least 2.

**Parameters**

- **modifier**: `string`

Returns: `undefined | false`

---

### randomFace

```typescript
randomFace(): number
```

Generate a random face value for this die using the configured PRNG.

**Returns**

`number`

(Inherited from [DiceTerm.randomFace](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#randomface))

---

### reroll

```typescript
reroll(modifier: string, recursive?: boolean): Promise<false | void>
```

Re-roll the Die, rolling additional results for any values which fall within a target set. If no target number is specified, re-roll the lowest possible result.

Examples:  
- `20d20r` reroll all 1s  
- `20d20r1` reroll all 1s  
- `20d20r=1` reroll all 1s  
- `20d20r1=1` reroll a single 1

**Parameters**

- **modifier**: `string`  
  The matched modifier query.
- **recursive?**: `boolean` = false  
  Reroll recursively, continuing to reroll until the condition is no longer met.

**Returns**

`Promise<false | void>`

---

### rerollRecursive

```typescript
rerollRecursive(modifier: string): Promise<false | void>
```

Reroll recursively.

**Parameters**

- **modifier**: `string`

**Returns**

`Promise<false | void>`

See also [Die#reroll](https://foundryvtt.com/api/classes/foundry.dice.terms.Die.html#reroll)

---

### roll

```typescript
roll(
    options?: {
        maximize?: boolean;
        minimize?: boolean;
    },
): Promise<DiceTermResult>
```

Roll the DiceTerm by mapping a random uniform draw against the faces of the dice term.

**Parameters**

- Optional **options**:
  - **maximize?**: `boolean` - Maximize the result, obtaining the largest possible value.
  - **minimize?**: `boolean` - Minimize the result, obtaining the smallest possible value.

**Returns**

`Promise<DiceTermResult>`

(Inherited from [DiceTerm.roll](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#roll))

---

### subtractFailures

```typescript
subtractFailures(modifier: string): undefined | false
```

Subtract the value of failed dice from the non-failed total, where each failure counts as its negative value. Failures are identified relative to some target, or relative to the lowest possible value if no target is given. Applying a deduct-failures modifier to the results counts all failed results as -1.

Example: `6d6df<3` - Subtract the value of results which rolled less than 3 from the non-failed total.

**Parameters**

- **modifier**: `string`

Returns: `undefined | false`

---

### toJSON

```typescript
toJSON(): RollTermData
```

Serialize the RollTerm to a JSON string which allows it to be saved in the database or embedded in text. This method should return an object suitable for passing to the `JSON.stringify` function.

**Returns**

`RollTermData`

(Inherited from [DiceTerm.toJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#tojson))

---

### _evaluateAsync (protected)

```typescript
protected _evaluateAsync(options?: object): Promise<DiceTerm>
```

Evaluate this dice term asynchronously.

**Parameters**

- Optional **options**: `object` = {}  
  Options forwarded to inner Roll evaluation.

**Returns**

`Promise<DiceTerm>`

(Inherited from [DiceTerm._evaluateAsync](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_evaluateasync))

---

### _evaluateSync (protected)

```typescript
protected _evaluateSync(
    options?: { maximize?: boolean; minimize?: boolean; strict?: boolean },
): DiceTerm
```

Evaluate deterministic values of this term synchronously.

**Parameters**

- Optional **options**:
  - **maximize?**: `boolean` - Force the result to be maximized.
  - **minimize?**: `boolean` - Force the result to be minimized.
  - **strict?**: `boolean` - Throw an error if attempting to evaluate a die term in a way that cannot be done synchronously.

**Returns**

`DiceTerm`

(Inherited from [DiceTerm._evaluateSync](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_evaluatesync))

---

### _roll (protected)

```typescript
protected _roll(options?: object): Promise<number | void>
```

Generate a roll result value for this DiceTerm based on its fulfillment method.

**Parameters**

- Optional **options**: `object` = {}  
  Options forwarded to the fulfillment method handler.

**Returns**

`Promise<number | void>`

(Inherited from [DiceTerm._roll](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_roll))

---

### _applyCount (static)

```typescript
static _applyCount(
    results: any,
    comparison: any,
    target: any,
    { flagFailure, flagSuccess }?: { flagFailure?: boolean; flagSuccess?: boolean },
): void
```

A reusable helper function to handle the identification and deduction of failures.

**Parameters**

- **results**: `any`  
- **comparison**: `any`  
- **target**: `any`  
- **flagFailure?**: `boolean`  
- **flagSuccess?**: `boolean`

Returns: `void`

(Inherited from [DiceTerm._applyCount](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_applycount))

---

### _applyDeduct (static)

```typescript
static _applyDeduct(
    results: any,
    comparison: any,
    target: any,
    { deductFailure, invertFailure }?: { deductFailure?: boolean; invertFailure?: boolean },
): void
```

A reusable helper function to handle the identification and deduction of failures.

**Parameters**

- **results**: `any`  
- **comparison**: `any`  
- **target**: `any`  
- **deductFailure?**: `boolean`  
- **invertFailure?**: `boolean`

Returns: `void`

(Inherited from [DiceTerm._applyDeduct](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_applydeduct))

---

### _fromData (static)

```typescript
static _fromData(data: any): RollTerm
```

Define term-specific logic for how a de-serialized data object is restored as a functional RollTerm.

**Parameters**

- **data**: `any`  
  The de-serialized term data.

**Returns**

The re-constructed RollTerm object.

(Inherited from [DiceTerm._fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_fromdata))

---

### _keepOrDrop (static)

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
- **options?**:  
  - **highest?**: `boolean` - Keep the highest?  
  - **keep?**: `boolean` - Keep results?

**Returns**

The modified results array.

(Inherited from [DiceTerm._keepOrDrop](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_keepordrop))

---

### compareResult (static)

```typescript
static compareResult(result: number, comparison: string, target: number): boolean
```

A helper comparison function. Returns a boolean depending on whether the result compares favorably against the target.

**Parameters**

- **result**: `number`  
  The result being compared.
- **comparison**: `string`  
  The comparison operator in `[=, <, <=, >, >=]`.
- **target**: `number`  
  The target value.

**Returns**

`boolean`

(Inherited from [DiceTerm.compareResult](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#compareresult))

---

### fromData (static)

```typescript
static fromData(data: RollTermData): RollTerm
```

Construct a RollTerm from a provided data object.

**Parameters**

- **data**: `RollTermData`  
  Provided data from an un-serialized term.

**Returns**

The constructed RollTerm.

(Inherited from [DiceTerm.fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#fromdata))

---

### fromJSON (static)

```typescript
static fromJSON(json: string): RollTerm
```

Reconstruct a RollTerm instance from a provided JSON string.

**Parameters**

- **json**: `string`  
  A serialized JSON representation of a DiceTerm.

**Returns**

A reconstructed RollTerm from the provided JSON.

(Inherited from [DiceTerm.fromJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#fromjson))

---

### fromMatch (static)

```typescript
static fromMatch(match: RegExpMatchArray): DiceTerm
```

Construct a term of this type given a matched regular expression array.

**Parameters**

- **match**: `RegExpMatchArray`  
  The matched regular expression array.

**Returns**

The constructed term.

(Inherited from [DiceTerm.fromMatch](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#frommatch))

---

### fromParseNode (static)

```typescript
static fromParseNode(node: any): RollTerm
```

Construct a RollTerm from a parse node.

**Parameters**

- **node**: `any`

**Returns**

`RollTerm`

(Inherited from [DiceTerm.fromParseNode](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#fromparsenode))

---

### isDeterministic (static)

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
- Optional **options**:
  - **maximize?**: `boolean` - Force the result to be maximized.
  - **minimize?**: `boolean` - Force the result to be minimized.

**Returns**

`boolean`

(Inherited from [DiceTerm.isDeterministic](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#isdeterministic-2))

---

### matchTerm (static)

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
- Optional **options**:
  - **imputeNumber?**: `boolean`  
    Allow the number of dice to be optional, i.e. "d6".

**Returns**

`null | RegExpMatchArray`

(Inherited from [DiceTerm.matchTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#matchterm))