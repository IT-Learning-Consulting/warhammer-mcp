# HTMLEnrichedContentElement | Foundry Virtual Tabletop - API Documentation - Version 13

A custom HTMLElement that is used to wrap enriched content that requires additional  
interactivity.

## Hierarchy

- *HTMLElement*
- **HTMLEnrichedContentElement**

## Properties

### Static

**observedAttributes**  
`observedAttributes: string[] = ...`  
Attributes requiring change notifications.

### Static

**tagName**  
`tagName: string = "enriched-content"`  
The HTML tag named used by this element.

## Methods

### attributeChangedCallback

```typescript
attributeChangedCallback(
    attrName: string,
    oldValue: null | string,
    newValue: null | string,
): void
```

Fire a callback on change to an observed attribute.

**Parameters**

- **attrName**: `string`  
  The name of the attribute
- **oldValue**: `null | string`  
  The old value: null indicates the attribute was not present.
- **newValue**: `null | string`  
  The new value: null indicates the attribute is removed.

**Returns** `void`

### connectedCallback

```typescript
connectedCallback(): void
```

Invoke the enricher onRender callback when it is added to the DOM.

**Returns** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [applications](https://foundryvtt.com/api/modules/foundry.applications.html) / [elements](https://foundryvtt.com/api/modules/foundry.applications.elements.html) / [HTMLEnrichedContentElement](https://foundryvtt.com/api/classes/foundry.applications.elements.HTMLEnrichedContentElement.html)