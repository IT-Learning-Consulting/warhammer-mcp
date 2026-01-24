# SceneManager | Foundry Virtual Tabletop - API Documentation - Version 13

A framework for imbuing special scripted behaviors into a single specific Scene. Managed scenes are registered in `CONFIG.Canvas.managedScenes`.

The SceneManager instance is called at various points in the Scene rendering life-cycle.

This also provides a framework for registering additional hook events which are required only for the life-cycle of the managed Scene.

**Example: Registering a custom SceneManager**

```typescript
// Define a custom SceneManager subclass
class MyCustomSceneManager extends SceneManager {
  async _onInit() {
    console.log(`Initializing managed Scene "${this.scene.name}"`);
  }

  async _onDraw() {
    console.log(`Drawing managed Scene "${this.scene.name}"`);
  }

  async _onReady() {
    console.log(`Readying managed Scene "${this.scene.name}"`);
  }

  async _onTearDown() {
    console.log(`Deconstructing managed Scene "${this.scene.name}"`);
  }

  _registerHooks() {
    this.registerHook("updateToken", this.#onUpdateToken.bind(this));
  }

  #onUpdateToken(document, updateData, options, userId) {
    console.log("Updating a token within the managed Scene");
  }
}

// Register MyCustomSceneManager to be used for a specific Scene
CONFIG.Canvas.sceneManagers = {
  [sceneId]: MyCustomSceneManager
}
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

---

## Constructors

### `constructor`

```typescript
new SceneManager(scene: Scene): SceneManager
```

The SceneManager is constructed by passing a reference to the active Scene document.

**Parameters:**

- **scene**: `Scene` — The active Scene document to be managed.

**Returns:**  
`SceneManager`

---

## Accessors

### `scene`

```typescript
get scene(): Scene
```

The managed Scene.

**Returns:**  
`Scene`

---

## Methods

### `registerHook`

```typescript
registerHook(hookName: string, handler: Function): void
```

Register additional hook functions which are only used while this Scene is active and are automatically deactivated.

**Parameters:**

- **hookName**: `string` — The name of the hook to register.
- **handler**: `Function` — The function to call when the hook is triggered.

**Returns:**  
`void`