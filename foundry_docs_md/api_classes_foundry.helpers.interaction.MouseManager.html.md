# MouseManager | Foundry Virtual Tabletop - API Documentation - Version 13

Management class for Mouse events.

**See**

[foundry.Game#mouse](https://foundryvtt.com/api/classes/foundry.Game.html#mouse)

## Static Properties

### `MOUSE_WHEEL_RATE_LIMIT`

- Type: `number`
- Default: `50`

Specify a rate limit for mouse wheel to gate repeated scrolling. This is especially important for continuous scrolling mice which emit hundreds of events per second. This designates a minimum number of milliseconds which must pass before another wheel event is handled.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)