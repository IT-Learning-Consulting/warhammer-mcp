# Coin

A type of DiceTerm used to represent flipping a two-sided coin.

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [dice](https://foundryvtt.com/api/modules/foundry.dice.html) / [terms](https://foundryvtt.com/api/modules/foundry.dice.terms.html) / [Coin](https://foundryvtt.com/api/classes/foundry.dice.terms.Coin.html)

## Hierarchy  
- [DiceTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html)  
- Coin

---

## Properties

### isIntermediate

**Type:** `boolean` = `false`

Is this term intermediate, and should be evaluated first as part of the simplification process?  
Inherited from [DiceTerm.isIntermediate](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#isintermediate)

---

### modifiers

**Type:** `string[]`

An Array of dice term modifiers which are applied  
Inherited from [DiceTerm.modifiers](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#modifiers)

---

### options

**Type:** `object`

An object of additional options which describes and modifies the term.  
Inherited from [DiceTerm.options](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#options)

---

### results

**Type:** [`DiceTermResult`](https://foundryvtt.com/api/interfaces/foundry.dice.DiceTermResult.html)[]

The array of dice term results which have been rolled  
Inherited from [DiceTerm.results](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#results)

---

### _faces (Protected)

**Type:** `number` | [Roll](https://foundryvtt.com/api/classes/foundry.dice.Roll.html)

The number of faces on the die, or a Roll instance that will be evaluated to a number.  
Inherited from [DiceTerm._faces](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_faces)

---

### _number (Protected)

**Type:** `number` | [Roll](https://foundryvtt.com/api/classes/foundry.dice.Roll.html)

The number of dice of this term to roll, before modifiers are applied, or a Roll instance that will be evaluated to a number.  
Inherited from [DiceTerm._number](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_number)

---

### DENOMINATION (Static)

**Type:** `string` = `"c"`

Define the denomination string used to register this DiceTerm type in `CONFIG.Dice.terms`  
Overrides [DiceTerm.DENOMINATION](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#denomination)

---

### FLAVOR_REGEXP (Static)

**Type:** `RegExp`

A regular expression which identifies term-level flavor text  
Inherited from [DiceTerm.FLAVOR_REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#flavor_regexp)

---

### FLAVOR_REGEXP_STRING (Static)

**Type:** `string` = `"(?:\[([^\]]+)\])"`

A regular expression pattern which identifies optional term-level flavor text  
Inherited from [DiceTerm.FLAVOR_REGEXP_STRING](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#flavor_regexp_string)

---

### MODIFIER_REGEXP (Static)

**Type:** `RegExp`

A regular expression used to separate individual modifiers  
Inherited from [DiceTerm.MODIFIER_REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#modifier_regexp)

---

### MODIFIERS (Static)

**Type:** `{ c: string }`

Define the named modifiers that can be applied for this particular DiceTerm type.  
Overrides [DiceTerm.MODIFIERS](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#modifiers-1)

---

### MODIFIERS_REGEXP_STRING (Static)

**Type:** `string` = `"([^ (){}\[\]+\-\*/]+)"`

A regular expression pattern which captures the full set of term modifiers. Anything until a space, group symbol, or arithmetic operator  
Inherited from [DiceTerm.MODIFIERS_REGEXP_STRING](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#modifiers_regexp_string)

---

### REGEXP (Static)

**Type:** `RegExp`

A regular expression used to match a term of this type  
Inherited from [DiceTerm.REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#regexp)

---

### SERIALIZE_ATTRIBUTES (Static)

**Type:** `string[]`

An array of additional attributes which should be retained when the term is serialized  
Inherited from [DiceTerm.SERIALIZE_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#serialize_attributes)

---

## Accessors

### denomination

```typescript
get denomination(): string
```

The denomination of this DiceTerm instance.  
Returns: `string`  
Inherited from DiceTerm.denomination

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

- **Parameters**
  - `value`: `number` | `Roll`
  
Returns: `number | void`  
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

- **Parameters**
  - `value`: `number` | `Roll`

Returns: `number | void`  
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
Inherited from DiceTerm.total

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

- **Parameters**
  - `options` (optional): `{}`
    - Options which modify how the RollTerm is evaluated, see RollTerm#evaluate

Returns: `DiceTerm` or `Promise<DiceTerm>`  
Returns a Promise if the term is non-deterministic.  
Inherited from [DiceTerm._evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_evaluate)

---

### alter

```typescript
alter(multiply: number, add: number): DiceTerm
```

Alter the DiceTerm by adding or multiplying the number of dice which are rolled

- **Parameters**
  - `multiply`: `number` - A factor to multiply. Dice are multiplied before any additions.
  - `add`: `number` - A number of dice to add. Dice are added after multiplication.

Returns: `DiceTerm` - The altered term  
Inherited from [DiceTerm.alter](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#alter)

---

### call

```typescript
call(modifier: string): undefined | false
```

Call the result of the coin flip, marking any coins that matched the called target as a success.  
Example:  
- `3dcc1` Flip 3 coins and treat "heads" as successes  
- `2dcc0` Flip 2 coins and treat "tails" as successes

- **Parameters**
  - `modifier`: `string` - The matched modifier query

Returns: `undefined` or `false`

---

### evaluate

```typescript
evaluate(
    options?: {
        allowStrings?: boolean;
        maximize?: boolean;
        minimize?: boolean;
    }
): RollTerm | Promise<RollTerm>
```

Evaluate the term, processing its inputs and finalizing its total.

- **Parameters**
  - `options` (optional): 
    - `allowStrings?`: `boolean` - If true, string terms will not throw an error when evaluated.
    - `maximize?`: `boolean` - Maximize the result, obtaining the largest possible value.
    - `minimize?`: `boolean` - Minimize the result, obtaining the smallest possible value.

Returns: `RollTerm` or `Promise<RollTerm>`  
Returns a Promise if the term is non-deterministic.  
Inherited from [DiceTerm.evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#evaluate)

---

### getResultCSS

```typescript
getResultCSS(result: any): (null | string)[]
```

Get the CSS classes that should be used to display each rolled result

- **Parameters**
  - `result`: `any` - The rolled result

Returns: `(null | string)[]` - The desired classes  
Overrides [DiceTerm.getResultCSS](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#getresultcss)

---

### getResultLabel

```typescript
getResultLabel(result: any): any
```

Return a string used as the label for each rolled result

- **Parameters**
  - `result`: `any` - The rolled result

Returns: `any` - The result label  
Overrides [DiceTerm.getResultLabel](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#getresultlabel)

---

### getTooltipData

```typescript
getTooltipData(): object
```

Render the tooltip HTML for a Roll instance

Returns: `object` - The data object used to render the default tooltip template for this DiceTerm  
Inherited from [DiceTerm.getTooltipData](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#gettooltipdata)

---

### mapRandomFace

```typescript
mapRandomFace(randomUniform: any): number
```

- **Parameters**
  - `randomUniform`: `any`

Returns: `number`  
Overrides [DiceTerm.mapRandomFace](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#maprandomface)

---

### randomFace

```typescript
randomFace(): number
```

Generate a random face value for this die using the configured PRNG.

Returns: `number`  
Inherited from [DiceTerm.randomFace](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#randomface)

---

### roll

```typescript
roll(
    __namedParameters?: { maximize?: boolean; minimize?: boolean },
): Promise<result>
```

Roll the DiceTerm by mapping a random uniform draw against the faces of the dice term.

- **Parameters**
  - `__namedParameters` (optional): 
    - `maximize?`: `boolean`
    - `minimize?`: `boolean`

Returns: `Promise<result>` - The produced result  
Overrides [DiceTerm.roll](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#roll)

---

### toJSON

```typescript
toJSON(): RollTermData
```

Serialize the RollTerm to a JSON string which allows it to be saved in the database or embedded in text.  
This method should return an object suitable for passing to the `JSON.stringify` function.

Returns: `RollTermData`  
Inherited from [DiceTerm.toJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#tojson)

---

### _evaluateAsync (Protected)

```typescript
_evaluateAsync(options?: object): Promise<DiceTerm>
```

Evaluate this dice term asynchronously.

- **Parameters**
  - `options` (optional): `object`  
    Options forwarded to inner Roll evaluation.

Returns: `Promise<DiceTerm>`  
Inherited from [DiceTerm._evaluateAsync](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_evaluateasync)

---

### _evaluateSync (Protected)

```typescript
_evaluateSync(
    options?: { maximize?: boolean; minimize?: boolean; strict?: boolean },
): DiceTerm
```

Evaluate deterministic values of this term synchronously.

- **Parameters**
  - `options` (optional):
    - `maximize?`: `boolean` - Force the result to be maximized.
    - `minimize?`: `boolean` - Force the result to be minimized.
    - `strict?`: `boolean` - Throw an error if attempting to evaluate a die term in a way that cannot be done synchronously.

Returns: `DiceTerm`  
Inherited from [DiceTerm._evaluateSync](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_evaluatesync)

---

### _roll (Protected)

```typescript
_roll(options?: object): Promise<number | void>
```

Generate a roll result value for this DiceTerm based on its fulfillment method.

- **Parameters**
  - `options` (optional): `object`  
    Options forwarded to the fulfillment method handler.

Returns: `Promise<number | void>`  
Returns a Promise that resolves to the fulfilled number, or undefined if it could not be fulfilled.  
Inherited from [DiceTerm._roll](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_roll)

---

### _applyCount (Static)

```typescript
_applyCount(
    results: any,
    comparison: any,
    target: any,
    __namedParameters?: { flagFailure?: boolean; flagSuccess?: boolean },
): void
```

A reusable helper function to handle the identification and deduction of failures.

- **Parameters**
  - `results`: `any`
  - `comparison`: `any`
  - `target`: `any`
  - `__namedParameters` (optional):
    - `flagFailure?`: `boolean`
    - `flagSuccess?`: `boolean`

Returns: `void`  
Inherited from [DiceTerm._applyCount](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_applycount)

---

### _applyDeduct (Static)

```typescript
_applyDeduct(
    results: any,
    comparison: any,
    target: any,
    __namedParameters?: { deductFailure?: boolean; invertFailure?: boolean },
): void
```

A reusable helper function to handle the identification and deduction of failures.

- **Parameters**
  - `results`: `any`
  - `comparison`: `any`
  - `target`: `any`
  - `__namedParameters` (optional):
    - `deductFailure?`: `boolean`
    - `invertFailure?`: `boolean`

Returns: `void`  
Inherited from [DiceTerm._applyDeduct](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_applydeduct)

---

### _fromData (Static)

```typescript
_fromData(data: any): RollTerm
```

Define term-specific logic for how a de-serialized data object is restored as a functional RollTerm

- **Parameters**
  - `data`: `any` - The de-serialized term data

Returns: `RollTerm` - The re-constructed RollTerm object  
Inherited from [DiceTerm._fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_fromdata)

---

### _keepOrDrop (Static)

```typescript
_keepOrDrop(
    results: object[],
    number: number,
    options?: { highest?: boolean; keep?: boolean },
): object[]
```

A helper method to modify the results array of a dice term by flagging certain results are kept or dropped.

- **Parameters**
  - `results`: `object[]` - The results array
  - `number`: `number` - The number to keep or drop
  - `options` (optional):
    - `highest?`: `boolean` - Keep the highest?
    - `keep?`: `boolean` - Keep results?

Returns: `object[]` - The modified results array  
Inherited from [DiceTerm._keepOrDrop](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#_keepordrop)

---

### compareResult (Static)

```typescript
compareResult(result: number, comparison: string, target: number): boolean
```

A helper comparison function. Returns a boolean depending on whether the result compares favorably against the target.

- **Parameters**
  - `result`: `number` - The result being compared
  - `comparison`: `string` - The comparison operator in `[=, <, <=, >, >=]`
  - `target`: `number` - The target value

Returns: `boolean` - Is the comparison true?  
Inherited from [DiceTerm.compareResult](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#compareresult)

---

### fromData (Static)

```typescript
fromData(data: RollTermData): RollTerm
```

Construct a RollTerm from a provided data object

- **Parameters**
  - `data`: `RollTermData` - Provided data from an un-serialized term

Returns: `RollTerm` - The constructed RollTerm  
Inherited from [DiceTerm.fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#fromdata)

---

### fromJSON (Static)

```typescript
fromJSON(json: string): RollTerm
```

Reconstruct a RollTerm instance from a provided JSON string

- **Parameters**
  - `json`: `string` - A serialized JSON representation of a DiceTerm

Returns: `RollTerm` - A reconstructed RollTerm from the provided JSON  
Inherited from [DiceTerm.fromJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#fromjson)

---

### fromMatch (Static)

```typescript
fromMatch(match: RegExpMatchArray): DiceTerm
```

Construct a term of this type given a matched regular expression array.

- **Parameters**
  - `match`: `RegExpMatchArray` - The matched regular expression array

Returns: `DiceTerm` - The constructed term  
Inherited from [DiceTerm.fromMatch](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#frommatch)

---

### fromParseNode (Static)

```typescript
fromParseNode(node: any): RollTerm
```

- **Parameters**
  - `node`: `any`

Returns: `RollTerm`  
Inherited from [DiceTerm.fromParseNode](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#fromparsenode)

---

### isDeterministic (Static)

```typescript
isDeterministic(
    term: RollTerm,
    options?: { maximize?: boolean; minimize?: boolean },
): boolean
```

Determine if evaluating a given RollTerm with certain evaluation options can be done so deterministically.

- **Parameters**
  - `term`: `RollTerm` - The term.
  - `options` (optional):
    - `maximize?`: `boolean` - Force the result to be maximized.
    - `minimize?`: `boolean` - Force the result to be minimized.

Returns: `boolean`  
Inherited from [DiceTerm.isDeterministic](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#isdeterministic-2)

---

### matchTerm (Static)

```typescript
matchTerm(
    expression: string,
    options?: { imputeNumber?: boolean },
): null | RegExpMatchArray
```

Determine whether a string expression matches this type of term

- **Parameters**
  - `expression`: `string` - The expression to parse
  - `options` (optional):
    - `imputeNumber?`: `boolean` - Allow the number of dice to be optional, i.e. `"d6"`

Returns: `null | RegExpMatchArray`  
Inherited from [DiceTerm.matchTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html#matchterm)