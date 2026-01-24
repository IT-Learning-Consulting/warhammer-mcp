# ClientIssues

A class responsible for tracking issues in the current world.

## Accessors

### packageCompatibilityIssues

```typescript
get packageCompatibilityIssues(): Record<string, PackageCompatibilityIssue>
```

Retrieve package compatibility issues.

**Returns**  
`Record<string, PackageCompatibilityIssue>`

[PackageCompatibilityIssue interface](https://foundryvtt.com/api/interfaces/foundry.PackageCompatibilityIssue.html)

---

### usabilityIssues

```typescript
get usabilityIssues(): Record<string, UsabilityIssue>
```

Retrieve the tracked usability issues.

**Returns**  
`Record<string, UsabilityIssue>`

[UsabilityIssue interface](https://foundryvtt.com/api/interfaces/foundry.UsabilityIssue.html)

---

### validationFailures

```typescript
get validationFailures(): object
```

Retrieve the tracked validation failures.

**Returns**  
`object`

---

## Methods

### getAllSubTypeCounts

```typescript
getAllSubTypeCounts(): Iterator<string, ModuleSubTypeCounts, any>
```

Retrieve all sub-type counts in the world.

**Returns**  
`Iterator<string, ModuleSubTypeCounts, any>`

[ModuleSubTypeCounts type](https://foundryvtt.com/api/types/foundry.ModuleSubTypeCounts.html)

---

### getSubTypeCountsFor

```typescript
getSubTypeCountsFor(module: any): ModuleSubTypeCounts
```

Get the Document sub-type counts for a given module.

**Parameters**

- **module**: `any`  
  The module or its ID.

**Returns**  
`ModuleSubTypeCounts`

[ModuleSubTypeCounts type](https://foundryvtt.com/api/types/foundry.ModuleSubTypeCounts.html)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)