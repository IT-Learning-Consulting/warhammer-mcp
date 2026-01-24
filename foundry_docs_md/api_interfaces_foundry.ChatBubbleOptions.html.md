# ChatBubbleOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ChatBubbleOptions {
    cssClasses?: string[];
    pan?: boolean;
    requireVisible?: boolean;
}
```

## Properties

### **Optional** **cssClasses**

- **Type:** `string[]`
- An optional array of CSS classes to apply to the resulting bubble.

### **Optional** **pan**

- **Type:** `boolean`
- Pan to the token speaker for this bubble, if allowed by the client.

### **Optional** **requireVisible**

- **Type:** `boolean`
- Require that the token be visible in order for the bubble to be rendered.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)