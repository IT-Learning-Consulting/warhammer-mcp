import { MODULE_ID } from '../constants.js';

/**
 * Register a Hooks.on('createChatMessage') listener that relays WFRP4e test
 * results back to the mcp-server pending-event registry when a roll was
 * requested with awaitResult: true.
 *
 * WFRP4e test messages have message.type === 'test' and store results in
 * message.system.testData.result.{outcome, SL}.
 *
 * For simple roll buttons (not WFRP4e actor tests), the relay is handled
 * directly in the click handler (attachRollButtonHandlers in data-access.ts).
 */
export function registerRollRelayHook(): void {
  Hooks.on('createChatMessage', (message: any) => {
    try {
      if (message.type !== 'test') return;

      // Check for a requestId set when the roll request was created.
      const requestId = message.flags?.[MODULE_ID]?.requestId as string | undefined;
      if (!requestId) return;

      const testData = message.system?.testData;
      if (!testData) return;

      const outcome: string = testData.result?.outcome ?? 'unknown';
      const SL: number = Number(testData.result?.SL ?? 0);
      const success = outcome === 'success';

      const emitRollEvent = (window as any).foundryMCPBridge?.emitRollEvent;
      if (typeof emitRollEvent === 'function') {
        emitRollEvent(requestId, { outcome, SL, success });
      }
    } catch (err) {
      console.warn(`[${MODULE_ID}] createChatMessage roll-relay hook error:`, err);
    }
  });
}
