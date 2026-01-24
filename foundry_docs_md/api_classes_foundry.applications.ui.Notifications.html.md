# Notifications

A common framework for displaying notifications to the client. Submitted notifications are added to a queue, and up to **Notifications.MAX_ACTIVE** notifications are displayed at once. Each notification is displayed for **Notifications.LIFETIME_MS** milliseconds before being removed, at which point further notifications are pulled from the queue.

## Examples

### Displaying Notification Messages

```typescript
ui.notifications.error("This is a permanent error message", {permanent: true});
ui.notifications.warn("LOCALIZED.WARNING.MESSAGE", {localize: true});
ui.notifications.success("This is a success message, not logged to the console", {console: false});
ui.notifications.info("LOCALIZED.FORMAT.STRING", {format: {key1: "foo", key2: "bar"}});
```

### Progress Bar Notification

```typescript
const progress = ui.notifications.info("Thing Happening!", {progress: true});
progress.update({pct: 0.25, message: "Still happening!"});
progress.update({pct: 0.50, message: "Almost there!"});
progress.update({pct: 0.75, message: "Stay on target!"});
progress.update({pct: 1.0, message: "Done!"});
```

---

## Properties

### Static

#### LIFETIME_MS

```typescript
LIFETIME_MS: number = 5000
```

Notification lifetime in milliseconds.

#### MAX_ACTIVE

```typescript
MAX_ACTIVE: number = 5
```

The maximum number of active notifications.

---

## Methods

### clear

```typescript
clear(): void
```

Clear all notifications.

**Returns:** `void`

---

### error

```typescript
error(
  message: string | object,
  options?: NotificationOptions,
): Readonly<Notification>
```

Display a notification with the `"error"` type.

**Parameters:**

- **message**: `string | object`  
  The content of the error message.

- **options** (optional): [`NotificationOptions`](https://foundryvtt.com/api/interfaces/foundry.NotificationOptions.html)  
  Notification options passed to the notify function.

**Returns:** `Readonly<Notification>`  
The registered notification.

**See:** [notify](#notify)

---

### info

```typescript
info(
  message: string | object,
  options?: NotificationOptions,
): Readonly<Notification>
```

Display a notification with the `"info"` type.

**Parameters:**

- **message**: `string | object`  
  The content of the info message.

- **options** (optional): [`NotificationOptions`](https://foundryvtt.com/api/interfaces/foundry.NotificationOptions.html)  
  Notification options passed to the notify function.

**Returns:** `Readonly<Notification>`  
The registered notification.

**See:** [notify](#notify)

---

### notify

```typescript
notify(
  message: string | object,
  type?: string,
  options?: NotificationOptions,
): Notification
```

Push a new notification into the queue.

**Parameters:**

- **message**: `string | object`  
  The content of the notification message. A passed object should have a meaningful override of the `toString` method. If the object is an `Error` and console logging is requested, the stack trace will be included.

- **type** (optional, default: `"info"`): `string`  
  The type of notification, `"info"`, `"warning"`, and `"error"` are supported.

- **options** (optional, default: `{}`): [`NotificationOptions`](https://foundryvtt.com/api/interfaces/foundry.NotificationOptions.html)  
  Additional options which affect the notification.

**Returns:** `Notification`  
The registered notification.

---

### remove

```typescript
remove(notification: number | Notification): void
```

Remove the notification linked to the ID.

**Parameters:**

- **notification**: `number | Notification`  
  The Notification instance or ID to remove.

**Returns:** `void`

---

### success

```typescript
success(
  message: string | object,
  options?: NotificationOptions,
): Readonly<Notification>
```

Display a notification with the `"success"` type.

**Parameters:**

- **message**: `string | object`  
  The content of the success message.

- **options** (optional): [`NotificationOptions`](https://foundryvtt.com/api/interfaces/foundry.NotificationOptions.html)  
  Notification options passed to the notify function.

**Returns:** `Readonly<Notification>`  
The registered notification.

**See:** [notify](#notify)

---

### update

```typescript
update(
  notification: number | Notification,
  update?: {
    clean?: string;
    escape?: string;
    format?: Record<string, string>;
    localize?: string;
    message?: string;
    pct?: number;
  },
): void
```

Update the progress of the notification.

**Parameters:**

- **notification**: `number | Notification`  
  A Notification instance or ID to update.

- **update** (optional): Object containing incremental progress update fields:

  - **clean**?: `string`  
    See [`NotificationOptions#clean`](https://foundryvtt.com/api/interfaces/foundry.NotificationOptions.html#clean)

  - **escape**?: `string`  
    See [`NotificationOptions#escape`](https://foundryvtt.com/api/interfaces/foundry.NotificationOptions.html#escape)

  - **format**?: `Record<string, string>`  
    A mapping of formatting strings passed to `Localization#format`.

  - **localize**?: `string`  
    Localize updates to presented progress text.

  - **message**?: `string`  
    An update to the string message.

  - **pct**?: `number`  
    An update to the completion percentage.

**Returns:** `void`

---

### warn

```typescript
warn(
  message: string | object,
  options?: NotificationOptions,
): Readonly<Notification>
```

Display a notification with the `"warning"` type.

**Parameters:**

- **message**: `string | object`  
  The content of the warning message.

- **options** (optional): [`NotificationOptions`](https://foundryvtt.com/api/interfaces/foundry.NotificationOptions.html)  
  Notification options passed to the notify function.

**Returns:** `Readonly<Notification>`  
The registered notification.

**See:** [notify](#notify)

---

# Links

- Foundry Virtual Tabletop - API Documentation - Version 13: [https://foundryvtt.com/api/index.html](https://foundryvtt.com/api/index.html)  
- [`NotificationOptions`](https://foundryvtt.com/api/interfaces/foundry.NotificationOptions.html)  
- [`Notification`](https://foundryvtt.com/api/interfaces/foundry.Notification.html)