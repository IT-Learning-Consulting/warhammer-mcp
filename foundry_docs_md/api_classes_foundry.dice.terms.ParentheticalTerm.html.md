# ParentheticalTerm | Foundry Virtual Tabletop - API Documentation - Version 13

A type of `RollTerm` used to enclose a parenthetical expression to be recursively evaluated.

## Hierarchy
- [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html)
- **ParentheticalTerm**

## Properties

### isIntermediate  
**Type:** `boolean`  
**Default:** `true`  
Is this term intermediate, and should be evaluated first as part of the simplification process?  
Overrides [RollTerm.isIntermediate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isintermediate)

### options  
**Type:** `object`  
An object of additional options which describes and modifies the term.  
Inherited from [RollTerm.options](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#options)

### roll  
**Type:** [Roll](https://foundryvtt.com/api/classes/foundry.dice.Roll.html)  
An already-evaluated Roll instance used instead of the string term.

### term  
**Type:** `string`  
The original provided string term used to construct the parenthetical.

### CLOSE_REGEXP *(Static)*  
**Type:** `RegExp`  
A regular expression pattern used to identify the closing of a parenthetical expression.

### FLAVOR_REGEXP *(Static)*  
**Type:** `RegExp`  
A regular expression which identifies term-level flavor text.  
Inherited from [RollTerm.FLAVOR_REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp)

### FLAVOR_REGEXP_STRING *(Static)*  
**Type:** `string`  
**Value:** `"(?:\\[([^\\]]+)\\])"`  
A regular expression pattern which identifies optional term-level flavor text.  
Inherited from [RollTerm.FLAVOR_REGEXP_STRING](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp_string)

### OPEN_REGEXP *(Static)*  
**Type:** `RegExp`  
The regular expression pattern used to identify the opening of a parenthetical expression.  
This could also identify the opening of a math function.

### REGEXP *(Static)*  
**Type:** `RegExp \| undefined`  
A regular expression used to match a term of this type.  
Inherited from [RollTerm.REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#regexp)

### SERIALIZE_ATTRIBUTES *(Static)*  
**Type:** `string[]`  
An array of additional attributes which should be retained when the term is serialized.  
Overrides [RollTerm.SERIALIZE_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#serialize_attributes)

## Accessors

### dice  
```typescript
get dice(): DiceTerm[]
```
**Returns:** `[DiceTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html)[]`  
An array of evaluated DiceTerm instances that should be bubbled up to the parent Roll.

### expression  
```typescript
get expression(): string
```
**Returns:** `string`  
A string representation of the formula expression for this RollTerm, prior to evaluation.  
Overrides RollTerm.expression

### flavor  
```typescript
get flavor(): string
```
**Returns:** `string`  
Optional flavor text which modifies and describes this term.  
Inherited from RollTerm.flavor

### formula  
```typescript
get formula(): string
```
**Returns:** `string`  
A string representation of the formula, including optional flavor text.  
Inherited from RollTerm.formula

### isDeterministic  
```typescript
get isDeterministic(): boolean
```
**Returns:** `boolean`  
Whether this term is entirely deterministic or contains some randomness.  
Overrides RollTerm.isDeterministic

### resolver  
```typescript
get resolver(): RollResolver
```
**Returns:** [RollResolver](https://foundryvtt.com/api/classes/foundry.applications.dice.RollResolver.html)  
A reference to the RollResolver app being used to externally resolve this term.  
Inherited from RollTerm.resolver

### total  
```typescript
get total(): number
```
**Returns:** `number`  
A string or numeric representation of the final output for this term, after evaluation.  
Overrides RollTerm.total

## Methods

### _evaluate  
```typescript
_evaluate(options?: {}): RollTerm | Promise<RollTerm>
```
Evaluate the term.

**Parameters:**
- **options?**: `{}` = `{}`  
  Options which modify how the RollTerm is evaluated, see RollTerm#evaluate

**Returns:** `RollTerm | Promise<RollTerm>`  
Returns a Promise if the term is non-deterministic.  
Overrides [RollTerm._evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_evaluate)

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

**Parameters:**
- **options?**:  
  - **allowStrings?**: `boolean` - If true, string terms will not throw an error when evaluated.  
  - **maximize?**: `boolean` - Maximize the result, obtaining the largest possible value.  
  - **minimize?**: `boolean` - Minimize the result, obtaining the smallest possible value.

**Returns:** `RollTerm | Promise<RollTerm>`  
Returns a Promise if the term is non-deterministic.  
Inherited from [RollTerm.evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#evaluate)

### toJSON  
```typescript
toJSON(): RollTermData
```
Serialize the RollTerm to a JSON string which allows it to be saved in the database or embedded in text. This method should return an object suitable for passing to the `JSON.stringify` function.

**Returns:** [RollTermData](https://foundryvtt.com/api/interfaces/foundry.dice.terms.RollTermData.html)  
Inherited from [RollTerm.toJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#tojson)

### _evaluateAsync *(Protected)*  
```typescript
_evaluateAsync(roll: Roll, options?: object): Promise<RollTerm>
```
Evaluate this parenthetical when it contains any non-deterministic sub-terms.

**Parameters:**
- **roll**: [Roll](https://foundryvtt.com/api/classes/foundry.dice.Roll.html)  
  The inner Roll instance to evaluate.
- **options?**: `object` = `{}`

**Returns:** `Promise<RollTerm>`

### _evaluateSync *(Protected)*  
```typescript
_evaluateSync(roll: Roll, options?: object): RollTerm
```
Evaluate this parenthetical when it contains only deterministic sub-terms.

**Parameters:**
- **roll**: [Roll](https://foundryvtt.com/api/classes/foundry.dice.Roll.html)  
  The inner Roll instance to evaluate.
- **options?**: `object` = `{}`

**Returns:** `RollTerm`

### fromData *(Static)*  
```typescript
static fromData(data: RollTermData): RollTerm
```
Construct a RollTerm from a provided data object.

**Parameters:**
- **data**: [RollTermData](https://foundryvtt.com/api/interfaces/foundry.dice.terms.RollTermData.html)  
  Provided data from an un-serialized term.

**Returns:** `RollTerm`  
The constructed RollTerm.  
Inherited from [RollTerm.fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromdata)

### fromJSON *(Static)*  
```typescript
static fromJSON(json: string): RollTerm
```
Reconstruct a RollTerm instance from a provided JSON string.

**Parameters:**
- **json**: `string`  
  A serialized JSON representation of a DiceTerm.

**Returns:** `RollTerm`  
A reconstructed RollTerm from the provided JSON.  
Inherited from [RollTerm.fromJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromjson)

### fromParseNode *(Static)*  
```typescript
static fromParseNode(node: any): RollTerm
```
Overrides [RollTerm.fromParseNode](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromparsenode)

**Parameters:**
- **node**: `any`

**Returns:** `RollTerm`

### fromTerms *(Static)*  
```typescript
static fromTerms(terms: RollTerm[], options?: object): ParentheticalTerm
```
Construct a ParentheticalTerm from an array of component terms which should be wrapped inside the parentheses.

**Parameters:**
- **terms**: `RollTerm[]`  
  The array of terms to use as internal parts of the parenthetical.
- **options?**: `object`  
  Additional options passed to the ParentheticalTerm constructor.

**Returns:** `ParentheticalTerm`  
The constructed ParentheticalTerm instance.

**Example: Create a Parenthetical Term from an array of component RollTerm instances**
```typescript
const d6 = new Die({number: 4, faces: 6});
const plus = new OperatorTerm({operator: "+"});
const bonus = new NumericTerm({number: 4});
const t = ParentheticalTerm.fromTerms([d6, plus, bonus]);
t.formula;  // (4d6 + 4)
```

### isDeterministic *(Static)*  
```typescript
static isDeterministic(
    term: RollTerm,
    options?: { maximize?: boolean; minimize?: boolean },
): boolean
```
Determine if evaluating a given RollTerm with certain evaluation options can be done so deterministically.

**Parameters:**
- **term**: `RollTerm`  
  The term.
- **options?**:  
  - **maximize?**: `boolean` - Force the result to be maximized.  
  - **minimize?**: `boolean` - Force the result to be minimized.

**Returns:** `boolean`  
Inherited from [RollTerm.isDeterministic](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isdeterministic-2)

### _fromData *(Static, Protected)*  
```typescript
static _fromData(data: RollTermData): RollTerm
```
Define term-specific logic for how a de-serialized data object is restored as a functional RollTerm.

**Parameters:**
- **data**: [RollTermData](https://foundryvtt.com/api/interfaces/foundry.dice.terms.RollTermData.html)  
  The de-serialized term data.

**Returns:** `RollTerm`  
The re-constructed RollTerm object.  
Inherited from [RollTerm._fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_fromdata)