// Module Integration v1 Phase 6 — module-scene-atmosphere server-side typing aid.
//
// Flat z.object schema (NO .strict()) used only for TypeScript type inference on
// the mcp-server side. The real validation happens in the foundry-module handler
// (discriminated union with .strict()). This file keeps the server-side BaseTool
// subclass typed without duplicating every variant.
//
// Phase 1: only `action` is present. Member phases extend as needed.
//
// CCR-5: module-specific schemas stay package-local.

import { z } from 'zod';

export const ModuleSceneAtmosphereServerInput = z.object({
  action: z.string(),
  // Member phases add their own optional fields here as the enum grows.
  // Example: moduleId: z.string().optional(),
});

export type ModuleSceneAtmosphereServerInputType = z.infer<typeof ModuleSceneAtmosphereServerInput>;
