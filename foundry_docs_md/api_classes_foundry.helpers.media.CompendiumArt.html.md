# CompendiumArt

A class responsible for managing package-provided art and applying it to Documents in compendium packs.

## Hierarchy

*Map*  
**CompendiumArt**

---

## Constructors

### constructor

```typescript
new CompendiumArt(
    iterable?: null | Iterable<[string, CompendiumArtInfo], any, any>,
): CompendiumArt
```

**Parameters**

- **iterable**: `null` | `Iterable<[string, CompendiumArtInfo]>` (optional)  
  An optional iterable of string keys and `CompendiumArtInfo` values.

**Returns**  
`CompendiumArt`

---

## Properties

### enabled

```typescript
enabled: boolean = true
```

Whether art application is enabled. This should be switched off when performing client-side compendium migrations in order to avoid persisting injected data.

---

### FLAG

```typescript
FLAG: string = "compendiumArtMappings"
```

The key for the package manifest flag used to store the mapping information.

---

### SETTING

```typescript
SETTING: string = "compendiumArtConfiguration"
```

The key for the setting used to store the World's art preferences.

---

## Methods

### getPackages

```typescript
getPackages(): CompendiumArtDescriptor[]
```

Retrieve all active packages that provide art mappings in priority order.

**Returns**  
`CompendiumArtDescriptor[]`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

[Map](https://foundryvtt.com/api/modules/foundry.helpers.html)  
[CompendiumArtInfo](https://foundryvtt.com/api/interfaces/foundry.helpers.types.CompendiumArtInfo.html)  
[CompendiumArtDescriptor](https://foundryvtt.com/api/interfaces/foundry.helpers.types.CompendiumArtDescriptor.html)