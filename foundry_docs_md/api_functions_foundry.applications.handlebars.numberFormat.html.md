# numberFormat | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `numberFormat`

```typescript
numberFormat(
    value: string | number,
    options: { decimals?: number; sign?: boolean },
): SafeString
```

A string formatting helper to display a number with a certain fixed number of decimals and an explicit sign.

**Parameters**

- **value**: `string | number`  
  A numeric value to format

- **options**: `{ decimals?: number; sign?: boolean }`  
  Additional options which customize the resulting format

  - **decimals**?: `number`  
    The number of decimal places to include in the resulting string

  - **sign**?: `boolean`  
    Whether to include an explicit "+" sign for positive numbers

**Returns**  
`SafeString`  
The formatted string to be included in a template

**Example**

```handlebars
{{numberFormat 5.5}}            <!-- 5.5 -->
{{numberFormat 5.5 decimals=2}} <!-- 5.50 -->
{{numberFormat 5.5 decimals=2 sign=true}} <!-- +5.50 -->
{{numberFormat null decimals=2 sign=false}} <!-- NaN -->
{{numberFormat undefined decimals=0 sign=true}} <!-- NaN -->
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)