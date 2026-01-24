# Roll | Foundry Virtual Tabletop - API Documentation - Version 13

An interface and API for constructing and evaluating dice rolls. The basic structure for a dice roll is a string formula and an object of data against which to parse it.

## Example: Attack with advantage

```typescript
// Construct the Roll instance
let r = new Roll("2d20kh + @prof + @strMod", {prof: 2, strMod: 4});

// The parsed terms of the roll formula
console.log(r.terms);    // [Die, OperatorTerm, NumericTerm, OperatorTerm, NumericTerm]

// Execute the roll
await r.evaluate();

// The resulting equation after it was rolled
console.log(r.result);   // 16 + 2 + 4

// The total resulting from the roll
console.log(r.total);    // 22
```

Reference: [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

---

## Constructors

### `constructor`

```typescript
new Roll(formula: string, data?: object, options?: RollOptions): Roll
```

**Parameters**

- **formula**: `string`  
  The string formula to parse

- **data**: `object = {}` (Optional)  
  The data object against which to parse attributes within the formula

- **options**: `RollOptions = {}` (Optional)  
  Options modifying or describing the Roll

**Returns**  
`Roll` — The constructed Roll instance

---

## Properties

### `data`

`object`  
The original provided data object which substitutes into attributes of the roll formula.

### `options`

`RollOptions`  
Options modifying or describing the Roll.

### `terms`

`RollTerm[]`  
The identified terms of the Roll.

---

## Static Properties

### `CHAT_TEMPLATE`

`string = "templates/dice/roll.hbs"`  
The HTML template path used to render a complete Roll object to the chat log.

### `DICE_CONFIGURATION_SETTING`

`"diceConfiguration"` (readonly)  
Dice Configuration setting name.

### `MATH_PROXY`

`Math`  
A Proxy environment for safely evaluating a string using only available Math functions.

### `RESOLVERS`

`Map<Roll, RollResolver>`  
A mapping of Roll instances to currently-active resolvers.

### `TOOLTIP_TEMPLATE`

`string = "templates/dice/tooltip.hbs"`  
The HTML template used to render an expanded Roll tooltip to the chat log.

---

## Accessors

### `dice`

```typescript
get dice(): DiceTerm[]
```

Return an array of the individual `DiceTerm` instances contained within this Roll.

**Returns**  
`DiceTerm[]`

### `formula`

```typescript
get formula(): string
```

Return a standardized representation for the displayed formula associated with this Roll.

**Returns**  
`string`

### `isDeterministic`

```typescript
get isDeterministic(): boolean
```

Whether this Roll contains entirely deterministic terms or whether there is some randomness.

**Returns**  
`boolean`

### `product`

```typescript
get product(): any
```

Return the arbitrary product of evaluating this Roll.

**Returns**  
`any`

### `result`

```typescript
get result(): string
```

The resulting arithmetic expression after rolls have been evaluated.

**Returns**  
`string`

### `total`

```typescript
get total(): number
```

Return the total result of the Roll expression if it has been evaluated.

**Returns**  
`number`

### `defaultImplementation`

```typescript
static get defaultImplementation(): typeof Roll
```

Get the default configured Roll class.

**Returns**  
`typeof Roll`

### `resolverImplementation`

```typescript
static get resolverImplementation(): typeof RollResolver
```

Retrieve the appropriate resolver implementation based on the user's configuration.

**Returns**  
`typeof RollResolver`

---

## Methods

### `alter`

```typescript
alter(multiply: number, add: number, multiplyNumeric?: boolean): Roll
```

Alter the Roll expression by adding or multiplying the number of dice which are rolled.

**Parameters**

- **multiply**: `number`  
  A factor to multiply. Dice are multiplied before any additions.

- **add**: `number`  
  A number of dice to add. Dice are added after multiplication.

- **multiplyNumeric**: `boolean = {}` (Optional)  
  Apply multiplication factor to numeric scalar terms.

**Returns**  
`Roll` — The altered Roll expression.

---

### `clone`

```typescript
clone(): Roll
```

Clone the Roll instance, returning a new Roll instance that has not yet been evaluated.

**Returns**  
`Roll`

---

### `evaluate`

```typescript
evaluate(
    options?: {
        allowInteractive?: boolean;
        allowStrings?: boolean;
        maximize?: boolean;
        minimize?: boolean;
    },
): Promise<Roll>
```

Execute the Roll asynchronously, replacing dice and evaluating the total result.

**Parameters**

- **options**: (Optional)  
  - **allowInteractive?**: `boolean` — If false, force the use of non-interactive rolls and do not prompt the user to make manual rolls.  
  - **allowStrings?**: `boolean` — If true, string terms will not cause an error to be thrown during evaluation.  
  - **maximize?**: `boolean` — Maximize the result, obtaining the largest possible value.  
  - **minimize?**: `boolean` — Minimize the result, obtaining the smallest possible value.

**Returns**  
`Promise<Roll>` — The evaluated Roll instance.

**Example**

```typescript
let r = new Roll("2d6 + 4 + 1d4");
await r.evaluate();
console.log(r.result);  // e.g. "5 + 4 + 2"
console.log(r.total);   // e.g. 11
```

---

### `evaluateSync`

```typescript
evaluateSync(
    options?: {
        allowStrings?: boolean;
        maximize?: boolean;
        minimize?: boolean;
        strict?: boolean;
    },
): Roll
```

Execute the Roll synchronously, replacing dice and evaluating the total result.

**Parameters**

- **options**: (Optional)  
  - **allowStrings?**: `boolean` — If true, string terms will not cause an error to be thrown during evaluation.  
  - **maximize?**: `boolean` — Maximize the result, obtaining the largest possible value.  
  - **minimize?**: `boolean` — Minimize the result, obtaining the smallest possible value.  
  - **strict?**: `boolean` — Throw an Error if the Roll contains non-deterministic terms that cannot be evaluated synchronously. If this is set to false, non-deterministic terms will be ignored.

**Returns**  
`Roll` — The evaluated Roll instance.

---

### `getTooltip`

```typescript
getTooltip(): Promise<string>
```

Render the tooltip HTML for a Roll instance.

**Returns**  
`Promise<string>` — The rendered HTML tooltip as a string.

---

### `propagateFlavor`

```typescript
propagateFlavor(flavor: string): void
```

Propagate flavor text across all terms that do not have any.

**Parameters**

- **flavor**: `string`  
  The flavor text.

**Returns**  
`void`

---

### `render`

```typescript
render(
    options?: {
        flavor?: string;
        isPrivate?: boolean;
        template?: string;
    },
): Promise<string>
```

Render a Roll instance to HTML.

**Parameters**

- **options**: (Optional)  
  - **flavor?**: `string` — Flavor text to include.  
  - **isPrivate?**: `boolean` — Is the Roll displayed privately?  
  - **template?**: `string` — A custom HTML template path.

**Returns**  
`Promise<string>` — The rendered HTML template as a string.

---

### `reroll`

```typescript
reroll(options?: object): Promise<Roll>
```

Create a new Roll object using the original provided formula and data. Each roll is immutable, so this method returns a new Roll instance using the same data.

**Parameters**

- **options**: `object = {}` (Optional)  
  Evaluation options passed to `Roll#evaluate`.

**Returns**  
`Promise<Roll>` — A new Roll object, rolled using the same formula and data.

---

### `resetFormula`

```typescript
resetFormula(): string
```

Recompile the formula string that represents this Roll instance from its component terms.

**Returns**  
`string` — The re-compiled formula.

---

### `roll`

```typescript
roll(options?: object): Promise<Roll>
```

Alias for `evaluate`.

**Parameters**

- **options**: `object = {}` (Optional)  
  Options passed to `Roll#evaluate`.

**Returns**  
`Promise<Roll>`

---

### `toAnchor`

```typescript
toAnchor(
    options?: {
        attrs?: Record<string, string>;
        classes?: string[];
        dataset?: Record<string, string>;
        icon?: string;
        label?: string;
    },
): HTMLAnchorElement
```

Construct an inline roll link for this Roll.

**Parameters**

- **options**: (Optional)  
  - **attrs?**: `Record<string, string>` — Attributes to set on the link.  
  - **classes?**: `string[]` — Additional classes to add to the link. The classes `inline-roll` and `inline-result` are added by default.  
  - **dataset?**: `Record<string, string>` — Custom data attributes to set on the link.  
  - **icon?**: `string` — A font-awesome icon class to use as the icon instead of a d20.  
  - **label?**: `string` — A custom label for the total.

**Returns**  
`HTMLAnchorElement`

---

### `toJSON`

```typescript
toJSON(): object
```

Represent the data of the Roll as an object suitable for JSON serialization.

**Returns**  
`object` — Structured data which can be serialized into JSON.

---

### `toMessage`

```typescript
toMessage(
    messageData?: object,
    options?: { create?: boolean; rollMode?: string },
): Promise<any>
```

Transform a Roll instance into a ChatMessage, displaying the roll result. This function can either create the ChatMessage directly, or return the data object that will be used to create it.

**Parameters**

- **messageData**: `object = {}` (Optional)  
  The data object to use when creating the message.

- **options**: (Optional)  
  - **create?**: `boolean` — Whether to automatically create the chat message, or only return the prepared `chatData` object.  
  - **rollMode?**: `string` — The template roll mode to use for the message from `CONFIG.Dice.rollModes`.

**Returns**  
`Promise<any>` — A promise which resolves to the created ChatMessage document if `create` is true, or the Object of prepared chatData otherwise.

---

### `toString`

```typescript
toString(): string
```

**Returns**  
`string`

---

### `_evaluate` (Protected)

```typescript
protected _evaluate(
    options?: {
        allowInteractive?: boolean;
        allowStrings?: boolean;
        maximize?: boolean;
        minimize?: boolean;
    },
): Promise<Roll>
```

Evaluate the roll asynchronously.

**Parameters**

- **options**: (Optional)  
  - **allowInteractive?**: `boolean` — If false, force the use of digital rolls and do not prompt the user to make manual rolls.  
  - **allowStrings?**: `boolean` — If true, string terms will not cause an error to be thrown during evaluation.  
  - **maximize?**: `boolean` — Force the result to be maximized.  
  - **minimize?**: `boolean` — Force the result to be minimized.

**Returns**  
`Promise<Roll>`

---

### `_evaluateASTAsync` (Protected)

```typescript
protected _evaluateASTAsync(
    node: RollParseNode | RollTerm,
    options?: { allowStrings?: boolean; maximize?: boolean; minimize?: boolean },
): Promise<string | number>
```

Evaluate an AST asynchronously.

**Parameters**

- **node**: `RollParseNode | RollTerm`  
  The root node or term.

- **options**: (Optional)  
  - **allowStrings?**: `boolean` — If true, string terms will not cause an error during evaluation.  
  - **maximize?**: `boolean` — Force the result to be maximized.  
  - **minimize?**: `boolean` — Force the result to be minimized.

**Returns**  
`Promise<string | number>`

---

### `_evaluateASTSync` (Protected)

```typescript
protected _evaluateASTSync(
    node: RollParseNode | RollTerm,
    options?: { allowStrings?: boolean; maximize?: boolean; minimize?: boolean; strict?: boolean },
): string | number
```

Evaluate an AST synchronously.

**Parameters**

- **node**: `RollParseNode | RollTerm`  
  The root node or term.

- **options**: (Optional)  
  - **allowStrings?**: `boolean` — If true, string terms will not cause an error during evaluation.  
  - **maximize?**: `boolean` — Force the result to be maximized.  
  - **minimize?**: `boolean` — Force the result to be minimized.  
  - **strict?**: `boolean` — Throw an error if encountering a term that cannot be synchronously evaluated.

**Returns**  
`string | number`

---

### `_evaluateSync` (Protected)

```typescript
protected _evaluateSync(
    options?: { allowStrings?: boolean; maximize?: boolean; minimize?: boolean; strict?: boolean },
): Roll
```

Evaluate the roll synchronously.

**Parameters**

- **options**: (Optional)  
  - **allowStrings?**: `boolean` — If true, string terms will not cause an error to be thrown during evaluation.  
  - **maximize?**: `boolean` — Force the result to be maximized.  
  - **minimize?**: `boolean` — Force the result to be minimized.  
  - **strict?**: `boolean` — Throw an error if encountering a term that cannot be synchronously evaluated.

**Returns**  
`Roll`

---

### `_evaluateTotal` (Protected)

```typescript
protected _evaluateTotal(): number
```

Safely evaluate the final total result for the Roll using its component terms.

**Returns**  
`number` — The evaluated total.

---

### `_prepareChatRenderContext` (Protected)

```typescript
protected _prepareChatRenderContext(
    options?: { flavor?: string; isPrivate?: boolean },
): Promise<{ object: any }>
```

Prepare context data used to render the `CHAT_TEMPLATE` for this roll.

**Parameters**

- **options**: (Optional)  
  - **flavor?**: `string`  
  - **isPrivate?**: `boolean`

**Returns**  
`Promise<{ object: any }>`

---

### `_prepareData` (Protected)

```typescript
protected _prepareData(data: object): object
```

Prepare the data structure used for the Roll. This is factored out to allow for custom Roll classes to do special data preparation using provided input.

**Parameters**

- **data**: `object`  
  Provided roll data.

**Returns**  
`object` — The prepared data object.

---

## Static Methods

### `collapseInlineResult`

```typescript
static collapseInlineResult(a: HTMLAnchorElement): void
```

Collapse an expanded inline roll to conceal its tooltip.

**Parameters**

- **a**: `HTMLAnchorElement`  
  The inline-roll button.

**Returns**  
`void`

---

### `create`

```typescript
static create(formula: string, data?: object, options?: object): Roll
```

A factory method which constructs a Roll instance using the default configured Roll class.

**Parameters**

- **formula**: `string`  
  The formula used to create the Roll instance.

- **data**: `object = {}` (Optional)  
  The data object which provides component data for the formula.

- **options**: `object = {}` (Optional)  
  Additional options which modify or describe this Roll.

**Returns**  
`Roll` — The constructed Roll instance.

---

### `expandInlineResult`

```typescript
static expandInlineResult(a: HTMLAnchorElement): Promise<void>
```

Expand an inline roll element to display its contained dice result as a tooltip.

**Parameters**

- **a**: `HTMLAnchorElement`  
  The inline-roll button.

**Returns**  
`Promise<void>`

---

### `fromData`

```typescript
static fromData(data: object): Roll
```

Recreate a Roll instance using a provided data object.

**Parameters**

- **data**: `object`  
  Unpacked data representing the Roll.

**Returns**  
`Roll` — A reconstructed Roll instance.

---

### `fromJSON`

```typescript
static fromJSON(json: string): Roll
```

Recreate a Roll instance using a provided JSON string.

**Parameters**

- **json**: `string`  
  Serialized JSON data representing the Roll.

**Returns**  
`Roll` — A reconstructed Roll instance.

---

### `fromTerms`

```typescript
static fromTerms(terms: RollTerm[], options?: object): Roll
```

Manually construct a Roll object by providing an explicit set of input terms.

**Parameters**

- **terms**: `RollTerm[]`  
  The array of terms to use as the basis for the Roll.

- **options**: `object = {}` (Optional)  
  Additional options passed to the Roll constructor.

**Returns**  
`Roll` — The constructed Roll instance.

**Example**

```typescript
const t1 = new Die({ number: 4, faces: 8 });
const plus = new OperatorTerm({ operator: "+" });
const t2 = new NumericTerm({ number: 8 });
const roll = Roll.fromTerms([t1, plus, t2]);
console.log(roll.formula); // "4d8 + 8"
```

---

### `getFormula`

```typescript
static getFormula(terms: RollTerm[]): string
```

Transform an array of RollTerm objects into a cleaned string formula representation.

**Parameters**

- **terms**: `RollTerm[]`  
  An array of terms to represent as a formula.

**Returns**  
`string` — The string representation of the formula.

---

### `identifyFulfillableTerms`

```typescript
static identifyFulfillableTerms(terms: RollTerm[]): DiceTerm[]
```

Determine which of the given terms require external fulfillment.

**Parameters**

- **terms**: `RollTerm[]`  
  The terms.

**Returns**  
`DiceTerm[]`

---

### `instantiateAST`

```typescript
static instantiateAST(ast: RollParseNode): RollTerm[]
```

Instantiate the nodes in an AST sub-tree into RollTerm instances.

**Parameters**

- **ast**: `RollParseNode`  
  The root of the AST sub-tree.

**Returns**  
`RollTerm[]`

---

### `parse`

```typescript
static parse(formula: string, data: object): RollTerm[]
```

Parse a formula expression using the compiled peggy grammar.

**Parameters**

- **formula**: `string`  
  The original string expression to parse.

- **data**: `object`  
  A data object used to substitute for attributes in the formula.

**Returns**  
`RollTerm[]`

---

### `registerResult`

```typescript
static registerResult(
    method: string,
    denomination: string,
    result: number,
): boolean | void
```

Register an externally-fulfilled result with an active RollResolver.

**Parameters**

- **method**: `string`  
  The fulfillment method.

- **denomination**: `string`  
  The die denomination being fulfilled.

- **result**: `number`  
  The obtained result.

**Returns**  
`boolean | void` — Whether the result was consumed. Returns `undefined` if no resolver was available.

---

### `replaceFormulaData`

```typescript
static replaceFormulaData(
    formula: string,
    data: object,
    options?: { missing?: string; warn?: boolean },
): string
```

Replace referenced data attributes in the roll formula with values from the provided data. Data references in the formula use the `@attr` syntax and reference the corresponding attr key.

**Parameters**

- **formula**: `string`  
  The original formula within which to replace.

- **data**: `object`  
  The data object which provides replacements.

- **options**: (Optional)  
  - **missing?**: `string` — The value that should be assigned to any unmatched keys. If `null`, the unmatched key is left as-is.  
  - **warn?**: `boolean` — Display a warning notification when encountering an un-matched key.

**Returns**  
`string`

---

### `safeEval`

```typescript
static safeEval(expression: string): number
```

A sandbox-safe evaluation function to execute user-input code with access to scoped Math methods.

**Parameters**

- **expression**: `string`  
  The input string expression.

**Returns**  
`number` — The numeric evaluated result.

---

### `simplifyTerms`

```typescript
static simplifyTerms(terms: RollTerm[]): RollTerm[]
```

After parenthetical and arithmetic terms have been resolved, simplify the remaining expression. Any remaining string terms need to be combined with adjacent non-operators in order to construct parsable terms.

**Parameters**

- **terms**: `RollTerm[]`  
  An array of terms which is eligible for simplification.

**Returns**  
`RollTerm[]` — An array of simplified terms.

---

### `simulate`

```typescript
static simulate(formula: string, n?: number): Promise<number[]>
```

Simulate a roll and evaluate the distribution of returned results.

**Parameters**

- **formula**: `string`  
  The Roll expression to simulate.

- **n**: `number = 10000` (Optional)  
  The number of simulations.

**Returns**  
`Promise<number[]>` — The rolled totals.

---

### `validate`

```typescript
static validate(formula: string): boolean
```

Validate that a provided roll formula can represent a valid.

**Parameters**

- **formula**: `string`  
  A candidate formula to validate.

**Returns**  
`boolean` — Is the provided input a valid dice formula?