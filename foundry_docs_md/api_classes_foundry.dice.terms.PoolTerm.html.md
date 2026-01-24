# PoolTerm

A type of `RollTerm` which encloses a pool of multiple inner Rolls which are evaluated jointly.

A dice pool represents a set of Roll expressions which are collectively modified to compute an effective total across all Rolls in the pool. The final total for the pool is defined as the sum over kept rolls, relative to any success count or margin.

**Example: Keep the highest of the 3 roll expressions**

```typescript
let pool = new PoolTerm({
  terms: ["4d6", "3d8 - 1", "2d10 + 3"],
  modifiers: ["kh"]
});
pool.evaluate();
```

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.dice.terms.PoolTerm))  
<i>RollTerm</i>  
**PoolTerm**

---

## Properties

### isIntermediate

```typescript
isIntermediate: boolean = false
```

Is this term intermediate, and should be evaluated first as part of the simplification process?  
Inherited from [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isintermediate).

### modifiers

```typescript
modifiers: string[]
```

The string modifiers applied to resolve the pool.

### options

```typescript
options: object
```

An object of additional options which describes and modifies the term.  
Inherited from [RollTerm.options](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#options).

### results

```typescript
results: DiceTermResult[]
```

The array of dice pool results which have been rolled.

### rolls

```typescript
rolls: Roll[]
```

Each component term of the dice pool as a `Roll` instance.

### terms

```typescript
terms: string[]
```

The original provided terms to the Dice Pool.

---

## Static Properties

### CLOSE_REGEXP

```typescript
CLOSE_REGEXP: RegExp = ...
```

A regular expression pattern used to identify the closing of a dice pool expression.

### FLAVOR_REGEXP

```typescript
FLAVOR_REGEXP: RegExp = ...
```

A regular expression which identifies term-level flavor text.  
Inherited from [RollTerm.FLAVOR_REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp).

### FLAVOR_REGEXP_STRING

```typescript
FLAVOR_REGEXP_STRING: string = "(?:\\[([^\\]]+)\\])"
```

A regular expression pattern which identifies optional term-level flavor text.  
Inherited from [RollTerm.FLAVOR_REGEXP_STRING](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp_string).

### MODIFIERS

```typescript
MODIFIERS: Record<string, string | Function> = ...
```

Defines the modifiers that can be used for this particular DiceTerm type.

### OPEN_REGEXP

```typescript
OPEN_REGEXP: RegExp = ...
```

The regular expression pattern used to identify the opening of a dice pool expression.

### REGEXP

```typescript
REGEXP: RegExp = ...
```

A regular expression pattern used to match the entirety of a DicePool expression.  
Overrides [RollTerm.REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#regexp).

### SERIALIZE_ATTRIBUTES

```typescript
SERIALIZE_ATTRIBUTES: string[] = ...
```

An array of additional attributes which should be retained when the term is serialized.  
Overrides [RollTerm.SERIALIZE_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#serialize_attributes).

---

## Accessors

### dice

```typescript
get dice(): DiceTerm[]
```

Return an Array of each individual `DiceTerm` instances contained within the PoolTerm.

**Returns:** `DiceTerm[]`

### expression

```typescript
get expression(): string
```

A string representation of the formula expression for this RollTerm, prior to evaluation.

**Returns:** `string`  
Overrides RollTerm.expression

### flavor

```typescript
get flavor(): string
```

Optional flavor text which modifies and describes this term.

**Returns:** `string`  
Inherited from RollTerm.flavor

### formula

```typescript
get formula(): string
```

A string representation of the formula, including optional flavor text.

**Returns:** `string`  
Inherited from RollTerm.formula

### isDeterministic

```typescript
get isDeterministic(): boolean
```

Whether this term is entirely deterministic or contains some randomness.

**Returns:** `boolean`  
Overrides RollTerm.isDeterministic

### resolver

```typescript
get resolver(): RollResolver
```

A reference to the `RollResolver` app being used to externally resolve this term.

**Returns:** `RollResolver`  
Inherited from RollTerm.resolver

### total

```typescript
get total(): undefined | number
```

A string or numeric representation of the final output for this term, after evaluation.

**Returns:** `undefined | number`  
Overrides RollTerm.total

### values

```typescript
get values(): number[]
```

Return an array of rolled values which are still active within the PoolTerm.

**Returns:** `number[]`

---

## Methods

### _evaluate

```typescript
_evaluate(options?: {}): PoolTerm | Promise<PoolTerm>
```

Evaluate the term.

**Parameters:**

- **options**: `{}` = {}  
  Options which modify how the RollTerm is evaluated, see RollTerm#evaluate

**Returns:** `PoolTerm | Promise<PoolTerm>`  
Returns a Promise if the term is non-deterministic.  
Overrides [RollTerm._evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_evaluate).

### alter

```typescript
alter(...args: any[]): PoolTerm
```

Alter the DiceTerm by adding or multiplying the number of dice which are rolled.

**Parameters:**

- **...args**: `any[]`  
  Arguments passed to each contained Roll#alter method.

**Returns:** `PoolTerm`  
The altered pool.

### countFailures

```typescript
countFailures(modifier: string): undefined | false
```

Count the number of failed results which occurred in a given result set. Failures are counted relative to some target, or relative to the lowest possible value if no target is given. Applying a count-failures modifier to the results re-casts all results to 1 (failure) or 0 (non-failure).

Examples:  
- `6d6cf` Count the number of dice which rolled a 1 as failures  
- `6d6cf<=3` Count the number of dice which rolled less than 3 as failures  
- `6d6cf>4` Count the number of dice which rolled greater than 4 as failures

**Parameters:**

- **modifier**: `string`  
  The matched modifier query

**Returns:** `undefined | false`

### countSuccess

```typescript
countSuccess(modifier: string): undefined | false
```

Count the number of successful results which occurred in the pool. Successes are counted relative to some target, or relative to the maximum possible value if no target is given. Applying a count-success modifier to the results re-casts all results to 1 (success) or 0 (failure).

Examples:  
- `20d20cs` Count the number of dice which rolled a 20  
- `20d20cs>10` Count the number of dice which rolled higher than 10  
- `20d20cs<10` Count the number of dice which rolled less than 10

**Parameters:**

- **modifier**: `string`  
  The matched modifier query

**Returns:** `undefined | false`

### drop

```typescript
drop(modifier: string): undefined | false
```

Keep a certain number of highest or lowest dice rolls from the result set.

Examples:  
- `{1d6,1d8,1d10,1d12}dl3` Drop the 3 worst results in the pool  
- `{1d12,6}dh` Drop the highest result in the pool

**Parameters:**

- **modifier**: `string`  
  The matched modifier query

**Returns:** `undefined | false`

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

- **options?** (optional):  
  - **allowStrings?**: `boolean` - If true, string terms will not throw an error when evaluated.  
  - **maximize?**: `boolean` - Maximize the result, obtaining the largest possible value.  
  - **minimize?**: `boolean` - Minimize the result, obtaining the smallest possible value.

**Returns:** `RollTerm | Promise<RollTerm>`  
Returns a Promise if the term is non-deterministic.  
Inherited from [RollTerm.evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#evaluate).

### keep

```typescript
keep(modifier: string): undefined | false
```

Keep a certain number of highest or lowest dice rolls from the result set.

Examples:  
- `{1d6,1d8,1d10,1d12}kh2` Keep the 2 best rolls from the pool  
- `{1d12,6}kl` Keep the lowest result in the pool

**Parameters:**

- **modifier**: `string`  
  The matched modifier query

**Returns:** `undefined | false`

### toJSON

```typescript
toJSON(): RollTermData
```

Serialize the RollTerm to a JSON string which allows it to be saved in the database or embedded in text. This method should return an object suitable for passing to the `JSON.stringify` function.

**Returns:** `RollTermData`  
Overrides [RollTerm.toJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#tojson).

---

## Protected Methods

### _evaluateAsync

```typescript
_protected _evaluateAsync(options?: object): Promise<PoolTerm>
```

Evaluate this pool term when it contains any non-deterministic sub-terms.

**Parameters:**

- **options** (optional): `object` = {}

**Returns:** `Promise<PoolTerm>`

### _evaluateSync

```typescript
protected _evaluateSync(options?: object): PoolTerm
```

Evaluate this pool term when it contains only deterministic sub-terms.

**Parameters:**

- **options** (optional): `object` = {}

**Returns:** `PoolTerm`

---

## Static Methods

### _fromData

```typescript
static _fromData(data: any): RollTerm
```

Define term-specific logic for how a de-serialized data object is restored as a functional RollTerm.

**Parameters:**

- **data**: `any` - The de-serialized term data.

**Returns:** `RollTerm`  
Overrides [RollTerm._fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_fromdata).

### fromData

```typescript
static fromData(data: RollTermData): RollTerm
```

Construct a RollTerm from a provided data object.

**Parameters:**

- **data**: `RollTermData` - Provided data from an un-serialized term.

**Returns:** `RollTerm`  
Inherited from [RollTerm.fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromdata).

### fromExpression

```typescript
static fromExpression(formula: string, options?: object): null | PoolTerm
```

Given a string formula, create and return an evaluated PoolTerm object.

**Parameters:**

- **formula**: `string` - The string formula to parse.  
- **options** (optional): `object` = {} - Additional options applied to the PoolTerm.

**Returns:** `null | PoolTerm`  
The evaluated PoolTerm object or null if the formula is invalid.

### fromJSON

```typescript
static fromJSON(json: string): RollTerm
```

Reconstruct a RollTerm instance from a provided JSON string.

**Parameters:**

- **json**: `string` - A serialized JSON representation of a DiceTerm.

**Returns:** `RollTerm`  
Inherited from [RollTerm.fromJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromjson).

### fromParseNode

```typescript
static fromParseNode(node: any): RollTerm
```

Create a RollTerm from a parse node.

**Parameters:**

- **node**: `any`

**Returns:** `RollTerm`  
Overrides [RollTerm.fromParseNode](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromparsenode).

### fromRolls

```typescript
static fromRolls(rolls?: Roll[]): PoolTerm
```

Create a PoolTerm by providing an array of existing Roll objects.

**Parameters:**

- **rolls**: `Roll[]` = [] - An array of Roll objects from which to create the pool.

**Returns:** `PoolTerm`  
The constructed PoolTerm comprised of the provided rolls.

### isDeterministic

```typescript
static isDeterministic(
  term: RollTerm,
  options?: { maximize?: boolean; minimize?: boolean }
): boolean
```

Determine if evaluating a given RollTerm with certain evaluation options can be done so deterministically.

**Parameters:**

- **term**: `RollTerm` - The term.  
- **options** (optional):  
  - **maximize?**: `boolean` - Force the result to be maximized.  
  - **minimize?**: `boolean` - Force the result to be minimized.

**Returns:** `boolean`  
Inherited from [RollTerm.isDeterministic](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isdeterministic-2).

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)