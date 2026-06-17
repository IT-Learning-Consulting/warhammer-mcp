// Phase 8 (R8.4): the module-scene-atmosphere getToolDefinitions() inputSchema literal, extracted
// VERBATIM from scene-atmosphere.ts so the main file lands <=600 lines. Tool surface unchanged
// (HC8): the main tool's getToolDefinitions() returns this constant byte-for-byte.

export const SCENE_ATMOSPHERE_TOOL_DEFINITIONS = [
  {
    // String literal (not the TOOL_NAME const) so _tools/audit-skills.mjs --check
    // resolve — which regex-scans source for `name: '<literal>'` — resolves this tool.
    // Matches the module-sequencer / module-tagger convention. Runtime value is identical.
    name: 'module-scene-atmosphere',
    title: 'Scene atmosphere — visual FX, audio, transitions, and tile faces',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    description: `Scene atmosphere umbrella for WFRP4e. Controls visual FX (fxmaster, tokenmagic),
presentation (scenery variants, scene-transitions, multiface-tiles), and audio (dynamic-soundscapes).
Conditional: returns MODULE_NOT_ACTIVE per member when the relevant module is absent/inactive.
Returns COMPANION_NOT_ACTIVE for wound-* actions when tokenmagic-automatic-wounds is absent.
Returns SOCKETLIB_NOT_ACTIVE for play-transition/end-transition when socketlib is absent.
Pre-flight: use get-bundle-status to check which members are active.

Phase 2 (fxmaster) + Phase 3 (tokenmagic + wounds) + Phase 4B (scenery + scene-transitions + multiface-tiles) + Phase 5 (dynamic-soundscapes) live — 67 actions available.

SCENERY — scene background variations (requires scenery module active):
- list-variations             { sceneId? }                               — list all named variations + active index
- get-active-variation        { sceneId? }                               — get current variation details
- set-active-variation        { sceneId?, variationIndex?, variationName?, confirm:true } — switch active variation
- add-variation               { sceneId?, name, gmBackground, plBackground?, sceneData?, confirm:true } — add new variation
- delete-variation            { sceneId?, variationIndex?, variationName?, confirm:true } — delete variation (index 0 / Default is protected)
- set-variation-backgrounds   { sceneId?, variationIndex?, variationName?, gmBackground?, plBackground?, confirm:true } — update backgrounds (plBackground locked for index 0)
- reset-variation-scene-data  { sceneId?, variationIndex?, variationName?, confirm:true } — clear saved sceneData for variation
- check-scenery-module-active {}                                         — check if scenery module is active
- read-scenery-settings       {}                                         — read all scenery world settings

SCENE-TRANSITIONS — animated scene transitions (requires scene-transitions + socketlib active):
- play-transition       { transitionOptions: { sceneID?, content?, ... }, showMe? } — play a transition immediately
- end-transition        {}                                                            — end the current transition
- set-scene-transition  { subAction: "per-scene"|"world-default"|"show-journal", sceneId?, transitionOptions? } — store transition config
- get-scene-transition  { subAction: "per-scene"|"world-default", sceneId? }         — read stored transition config
- delete-scene-transition { sceneId, confirm:true }                                  — remove per-scene transition flag

Actual transitionOptions fields: sceneID · content · fontColor · fontSize · bgImg · bgPos · bgLoop · bgMuted · bgSize · bgColor · bgOpacity · fadeIn · delay · fadeOut · audio · volume · audioLoop · allowPlayersToEnd · gmEndAll · gmHide · showUI · activateScene · users (NEVER set fromSocket — the module sets it automatically)

MULTIFACE-TILES — tile image face cycling (requires multiface-tiles active):
- switch-tile-face       { tileId, facePath }  — switch active texture to a specific face path
- list-tile-faces        { tileId }            — list all faces: originalImage + altImages
- get-tile-original-face { tileId }            — get the originalImage tracking value
- get-tile-active-face   { tileId }            — get current texture.src + label
- reset-to-original-face { tileId }            — restore texture.src to originalImage
- add-tile-face          { tileId, facePath }  — append a path to altImages; sets originalImage on first add
- remove-tile-face       { tileId, facePath }  — remove a path from altImages (warns if face was active)
- cycle-tile-face        { tileId }            — advance to next face in sequence [originalImage, ...altImages] (MCP-authored — module stub only)
- clear-tile-faces       { tileId }            — reset altImages+originalImage to empty (wipe all tracking)
WARNING: both multiface-tiles and MATT write texture.src — use separate tiles to avoid conflicts.

TOKENMAGIC — per-token/tile/template/drawing/region filter FX (requires tokenmagic module active):
- tokenmagic-apply   { placeableId, placeableType, params[], replace? }  — addFilters; apply FX to any placeable
- tokenmagic-upsert  { placeableId, placeableType, params[] }            — addUpdateFilters; upsert (add or update by filterId)
- tokenmagic-remove  { placeableId, placeableType, filterId?, filterType? } — deleteFilters; selective or nuclear remove
- tokenmagic-query   { subAction, placeableId?, placeableType?, filterType?, filterId? } — reads: has-filter-type/id, get-filters, get-anime-info, get-filter-types, get-min-padding, get-settings
- tokenmagic-preset  { subAction, presetName?, params?, library?, path?, importOptions?, confirm? } — preset CRUD: get/list/add/delete/import-from-path/import-from-url/import-template-settings/reset-library

All 43 filterType keys: adjustment · ascii · bevel · blur · bulgepinch · crt · ddTint · distortion
  dot · electric · field · fire · flood · fog · fumes · globes · glow · images · liquid · oldfilm
  outline · pixel · polymorph · ray · replaceColor · rgbSplit · ripples · shadow · shockwave · smoke
  splash · sprite · spriteMask · twist · wave · web · xfire · xfog · xglow · xray · zapshadow · zoomblur · transform
Placeable types: Token · Tile · MeasuredTemplate · Drawing · Region

TOKENMAGIC AUTOMATIC WOUNDS — wound FX (requires tokenmagic-automatic-wounds companion active):
- tokenmagic-wound-create  { tokenId, damageFraction }   — createWoundOnToken; splash effect at damage level
- tokenmagic-wound-heal    { tokenId, healingFraction }  — healWoundsOnToken; shrink/remove wound filters
- tokenmagic-wound-remove  { tokenId }                   — removeWoundsOnToken; clear all wound FX
- tokenmagic-wound-reapply { tokenId }                   — reapplyWoundsBasedOnCurrentHp; recalculate from HP
- wound-toggle-disable  { actorId, disabled? }           — toggleDisableWounds; disable/enable per-actor (FLAG INVERSION: internal flag 'enabled-for-token'=true means DISABLED)
- wound-set-blood-color { tokenId, color }               — setBloodColor; hex color for wound splatter (e.g. '0x22aa22' for orc green)

WFRP4e idioms: splash='blood wound', glow='buff aura', fire='burning condition', blur='invisible', fog='fear aura', xglow='warpstone', electric='tempest spell'

FXMASTER — particle weather + scene filters (requires fxmaster module active):
- play-preset      { preset, options? }   — play a named preset (24 free: rain, snow, fog, thunderstorm, etc.)
- stop-preset      { preset, scene? }     — stop a named preset
- toggle-preset    { preset, options? }   — toggle preset on/off idempotently
- switch-preset    { preset|null, options? } — stop current + start new; null stops all active presets
- list-presets     {}                     — list all registered preset names
- list-active-presets { scene? }          — list currently active presets on the scene
- list-valid-presets  { topDown? }        — list presets playable with current modules
- play-particles   { particles[], scene?, skipFading?, apiToggleKey? } — play raw particle effects by type + options; returns IDs
- play-filters     { filters[], scene?, skipFading?, apiToggleKey? }   — play raw filter effects; returns IDs
- stop-effects     { particles?, filters?, effects?, scene?, skipFading? } — stop by returned IDs
- toggle-effects   { particles?, filters?, effects?, toggleKey?, scene? } — toggle named effect group
- clear-effects    { target?, scene?, confirm:true } — nuclear unsetFlag (CONFIRM required — irreversible)
- set-enabled      { disableAll, confirm? } — kill-switch: suspend/resume all FX rendering (confirm required for disableAll:true)
- set-region-particles   { regionId, particleType, options?, replace? } — add fxmaster particleEffectsRegion behavior to region
- set-region-filters     { regionId, filterType, options?, replace? }   — add fxmaster filterEffectsRegion behavior to region
- suppress-scene-particles { regionId, remove? } — add/remove suppressSceneParticles behavior on region
- suppress-scene-filters   { regionId, remove? } — add/remove suppressSceneFilters behavior on region

Free particle types: autumnleaves · bats · birds · bubbles · clouds · crows · eagles
                 embers · fog · hail · rain · rats · snow · snowstorm · spiders · stars
Free filter types:  bloom · color · fog · lightning · oldfilm · predator · underwater
fxmaster-plus types (require the fxmaster-plus add-on module active):
  particles: fireflies · ghosts · magiccrystals · sakurabloom · sakurablossoms
  filters:   sunlight
wfrp-fxmaster-custom types (require the wfrp-fxmaster-custom module active):
  particles: warpstonemotes · chaosembers · blightspores · soulwisps · fallingash
         warpfiresparks · censersmoke · daemoneyes · witchlight
  weather:   windgusts · dustgale · warpstorm · ashstorm
  filters:   corruption (pulsing warp taint) · grimdark (desaturated vignette) · warpshimmer (heat-haze distortion)
         waterflow (directional flowing-water refraction) · waterwaves (directional traveling waves)
         watervortex (whirlpool around centerX/centerY) · lightningbolt (random bolt strikes, topDown option + screen flash)
         (all custom filters accept region masking via filterEffectsRegion / set-region-filters)
Free presets (24): acid-rain · autumn-leaves · blizzard · blood-rain · cloudy · drizzle
  fog · hail · heat-wave · hurricane · ice-storm · mist · monsoon · nullfront · overcast
  partly-cloudy · rain · rolling-fog · sleet · snow · spore-cloud · sunshower · thunderstorm · wildfire-smoke
  (Gambit's FXMaster fork 8.1.x also registers 18 themed plus-only presets — aether-haze,
   meteor-shower, etc. — playable only with fxmaster-plus; use list-valid-presets to filter.)

DYNAMIC-SOUNDSCAPES — soundscape playlists with mood routing (requires dynamic-soundscapes module active):
updateState-delay: set-soundscape/stop-soundscape write the world setting immediately (server-persisted).
Audio output starts on the active GM client when RandomSoundController fires via onChange (~<1s delay).
- set-soundscape       { playlistId }                                — activate a soundscape (write playingPlaylist setting)
- stop-soundscape      {}                                            — stop all soundscape playback (clear playingPlaylist)
- set-mood             { mood: "moodA"|"moodB"|"moodC", playlistId? } — set mood flag on playing or named soundscape
- get-mood             { playlistId? }                               — read current mood (absent flag == "moodA")
- set-layer-enabled    { playlistId, soundId, enabled }              — enable/disable a sound layer (write enabled flag)
- set-layer-volume     { playlistId, soundId, volume }               — set layer volume 0.0–1.0
- list-soundscapes     {}                                            — list all soundscapes in "Soundscapes" folder
- list-blocks          { playlistId }                                — read blocks[] flag with sound names
- get-selected         {}                                            — read cosmetic UI-selected playlist (not playing)
- set-selected         { playlistId, confirm:true }                  — set cosmetic UI-selected playlist
- create-soundscape    { name }                                      — create new Playlist in Soundscapes folder (mode=DISABLED)
- delete-soundscape    { playlistId, confirm:true }                  — delete soundscape and all its sounds (stops if playing)
- add-sound            { playlistId, name, path, volume?, repeat? }  — add PlaylistSound layer (assign to block via update-blocks)
- remove-sound         { playlistId, soundId, confirm:true }         — delete layer + remove path=soundId from blocks[]
- update-blocks        { playlistId, blocks[], confirm:true }         — atomic overwrite of blocks[] flag (read list-blocks first)

Block shape: { title, id?, sounds?: string[], isOrphaned?, mode?: "ambient"|"soundboard"|"random",
           time?, variance?, size?, color?, conditions?: string[], conditionMode?: "all"|"any"|"none" }
Conditions: "inCombat" · "notInCombat" · "day" · "night" · "moodA" · "moodB" · "moodC" · "weather-<key>"
Mood idioms: moodA=calm/exploration, moodB=tension/fight, moodC=climax/boss

BUNDLE STATUS:
- get-bundle-status {}  — check which of the 6 atmosphere members are active
Members: fxmaster · tokenmagic · scenery · scene-transitions · multiface-tiles · dynamic-soundscapes

Examples:
- { action: "get-bundle-status" }
- { action: "play-preset", preset: "thunderstorm" }
- { action: "play-preset", preset: "rain", options: { topDown: true, density: "high" } }
- { action: "switch-preset", preset: null }
- { action: "play-particles", particles: [{ type: "rain", options: { density: 0.8 } }] }
- { action: "play-filters", filters: [{ type: "color", options: { brightness: 0.6 } }] }
- { action: "clear-effects", target: "both", confirm: true }
- { action: "set-enabled", disableAll: true, confirm: true }
- { action: "list-variations" }
- { action: "set-active-variation", variationIndex: 1, confirm: true }
- { action: "add-variation", name: "Ruined", gmBackground: "modules/scenery/bg_ruined.webp", confirm: true }
- { action: "play-transition", transitionOptions: { content: "<p>Scene Title</p>", fadeIn: 1000, fadeOut: 1000 }, showMe: true }
- { action: "set-scene-transition", subAction: "per-scene", sceneId: "abc123", transitionOptions: { content: "<p>Title</p>", bgColor: "#000000" } }
- { action: "list-tile-faces", tileId: "def456" }
- { action: "cycle-tile-face", tileId: "def456" }
- { action: "add-tile-face", tileId: "def456", facePath: "modules/mytiles/variant2.webp" }
- { action: "list-soundscapes" }
- { action: "set-soundscape", playlistId: "abc123" }
- { action: "set-mood", mood: "moodB" }
- { action: "set-mood", mood: "moodA", playlistId: "abc123" }
- { action: "get-mood" }
- { action: "stop-soundscape" }
- { action: "list-blocks", playlistId: "abc123" }
- { action: "set-layer-enabled", playlistId: "abc123", soundId: "snd001", enabled: false }
- { action: "set-layer-volume", playlistId: "abc123", soundId: "snd001", volume: 0.6 }
- { action: "create-soundscape", name: "Tavern Ambience" }
- { action: "add-sound", playlistId: "abc123", name: "Fireplace", path: "modules/soundscapes/fire.ogg" }
- { action: "update-blocks", playlistId: "abc123", blocks: [{ title: "Ambient", sounds: ["snd001"], mode: "ambient" }], confirm: true }`,
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            // Always available
            'get-bundle-status',
            // Phase 2: fxmaster
            'play-preset',
            'stop-preset',
            'toggle-preset',
            'switch-preset',
            'list-presets',
            'list-active-presets',
            'list-valid-presets',
            'play-particles',
            'play-filters',
            'stop-effects',
            'toggle-effects',
            'clear-effects',
            'set-enabled',
            'set-region-particles',
            'set-region-filters',
            'suppress-scene-particles',
            'suppress-scene-filters',
            // Phase 3: tokenmagic base
            'tokenmagic-apply',
            'tokenmagic-upsert',
            'tokenmagic-remove',
            'tokenmagic-query',
            'tokenmagic-preset',
            // Phase 3: tokenmagic-automatic-wounds companion
            'tokenmagic-wound-create',
            'tokenmagic-wound-heal',
            'tokenmagic-wound-remove',
            'tokenmagic-wound-reapply',
            'wound-toggle-disable',
            'wound-set-blood-color',
            // Phase 4B: scenery
            'list-variations',
            'get-active-variation',
            'set-active-variation',
            'add-variation',
            'delete-variation',
            'set-variation-backgrounds',
            'reset-variation-scene-data',
            'check-scenery-module-active',
            'read-scenery-settings',
            // Phase 4B: scene-transitions
            'play-transition',
            'end-transition',
            'set-scene-transition',
            'get-scene-transition',
            'delete-scene-transition',
            // Phase 4B: multiface-tiles
            'switch-tile-face',
            'list-tile-faces',
            'get-tile-original-face',
            'get-tile-active-face',
            'reset-to-original-face',
            'add-tile-face',
            'remove-tile-face',
            'cycle-tile-face',
            'clear-tile-faces',
            // Phase 5: dynamic-soundscapes
            'set-soundscape',
            'stop-soundscape',
            'set-mood',
            'get-mood',
            'set-layer-enabled',
            'set-layer-volume',
            'list-soundscapes',
            'list-blocks',
            'get-selected',
            'set-selected',
            'create-soundscape',
            'delete-soundscape',
            'add-sound',
            'remove-sound',
            'update-blocks',
          ],
          description: 'Scene atmosphere action. Pre-flight with get-bundle-status to check member availability.',
        },
        // ── fxmaster preset fields ────────────────────────────────────
        preset: {
          type: 'string',
          description: 'Preset name for play-preset/stop-preset/toggle-preset/switch-preset. Null for switch-preset to stop all.',
        },
        options: {
          type: 'object',
          description: 'Action-specific options (play-preset/toggle-preset/switch-preset: topDown, direction, color, speed, density, belowTokens, belowTiles, belowForeground, darknessActivationEnabled, scene, silent).',
        },
        scene: {
          type: 'string',
          description: 'Scene UUID or ID for cross-scene operations. Defaults to current canvas scene.',
        },
        // ── fxmaster effect fields ────────────────────────────────────
        particles: {
          type: 'array',
          description: 'Array of { type, options? } for play-particles. Also used as array of IDs for stop-effects/toggle-effects.',
          items: { type: 'object' },
        },
        filters: {
          type: 'array',
          description: 'Array of { type, options? } for play-filters. Also used as array of IDs for stop-effects/toggle-effects.',
          items: { type: 'object' },
        },
        effects: {
          type: 'array',
          description: 'Array of effect IDs for stop-effects/toggle-effects (auto-detects particle/filter).',
          items: { type: 'string' },
        },
        skipFading: {
          type: 'boolean',
          description: 'Skip fade-in/out transition for play/stop operations.',
        },
        apiToggleKey: {
          type: 'string',
          description: 'Named group key for toggling a set of effects together (play-particles/play-filters).',
        },
        toggleKey: {
          type: 'string',
          description: 'Toggle group key for toggle-effects.',
        },
        // ── clear-effects / set-enabled ───────────────────────────────
        target: {
          type: 'string',
          enum: ['particles', 'filters', 'both', 'stack'],
          description: 'What to clear for clear-effects: particles, filters, both (default), or stack.',
        },
        confirm: {
          type: 'boolean',
          description: 'Required for clear-effects and set-enabled with disableAll:true — confirms destructive/world-wide action. NOTE: add-variation, delete-variation, set-variation-backgrounds, reset-variation-scene-data, delete-scene-transition, set-selected, delete-soundscape, remove-sound, and update-blocks require exactly true (not just any truthy value).',
        },
        disableAll: {
          type: 'boolean',
          description: 'For set-enabled: true = suspend all FX rendering (kill-switch); false = re-enable.',
        },
        // ── region behavior fields ────────────────────────────────────
        regionId: {
          type: 'string',
          description: 'Foundry Region document ID for region behavior actions.',
        },
        particleType: {
          type: 'string',
          description: 'Free-tier particle type for set-region-particles.',
        },
        filterType: {
          type: 'string',
          description: 'Free-tier filter type for set-region-filters.',
        },
        replace: {
          type: 'boolean',
          description: 'For set-region-particles/set-region-filters: delete existing behaviors of the same type before creating.',
        },
        remove: {
          type: 'boolean',
          description: 'For suppress-scene-particles/suppress-scene-filters: remove the behavior instead of adding.',
        },
        // ── Phase 3: tokenmagic fields ────────────────────────────────
        placeableId: {
          type: 'string',
          description: 'Foundry document ID of the target placeable (Token, Tile, MeasuredTemplate, Drawing, or Region). Required for tokenmagic-apply/upsert/remove and tokenmagic-query placeable sub-actions.',
        },
        placeableType: {
          type: 'string',
          enum: ['Token', 'Tile', 'MeasuredTemplate', 'Drawing', 'Region'],
          description: 'Placeable type for tokenmagic actions. Determines which canvas collection to resolve the ID against.',
        },
        params: {
          type: 'array',
          description: 'Filter params array for tokenmagic-apply/upsert. Each entry must include filterType (one of 43 types). Optional: filterId, rank, enabled, animated, randomized, users, padding, zOrder, plus filter-type-specific params.',
          items: { type: 'object' },
        },
        filterId: {
          type: 'string',
          description: 'Filter ID for tokenmagic-remove (remove a specific filter by ID) and tokenmagic-query has-filter-type/id.',
        },
        filterInternalId: {
          type: 'string',
          description: 'Internal tokenmagic filter id (rarely needed; prefer filterId) for tokenmagic-remove.',
        },
        subAction: {
          type: 'string',
          description: 'Sub-action for tokenmagic-query (has-filter-type/id, get-filters, get-anime-info, get-filter-types, get-min-padding, get-settings) and tokenmagic-preset (get/list/add/delete/import-from-path/import-from-url/import-template-settings/reset-library).',
        },
        presetName: {
          type: 'string',
          description: 'Preset name for tokenmagic-preset get/add/delete. Can be a string or adjustment object {name, library?, ...overrides}.',
        },
        library: {
          type: 'string',
          description: 'Preset library name for tokenmagic-preset list/add/delete. Defaults to \'tmfx-main\'. Also \'tmfx-template\' for template presets.',
        },
        path: {
          type: 'string',
          description:
            'File path (Foundry-relative) or URL. ' +
            'tokenmagic-preset: import-from-path/import-from-url/import-template-settings. ' +
            'add-sound (dynamic-soundscapes): audio file path for the new sound layer.',
        },
        importOptions: {
          type: 'object',
          description: 'Import options for tokenmagic-preset import actions: { overwrite: boolean, replaceLibrary: boolean }.',
        },
        // ── Phase 3: tokenmagic wound fields ──────────────────────────
        tokenId: {
          type: 'string',
          description: 'Token document ID on the current scene for wound-* actions.',
        },
        damageFraction: {
          type: 'number',
          description: 'Damage as fraction of max HP (0.0–1.0) for tokenmagic-wound-create.',
        },
        healingFraction: {
          type: 'number',
          description: 'Healing as fraction of max HP (0.0–1.0) for tokenmagic-wound-heal.',
        },
        actorId: {
          type: 'string',
          description: 'Actor document ID for wound-toggle-disable.',
        },
        disabled: {
          type: 'boolean',
          description: 'For wound-toggle-disable: true = disable wounds, false = enable wounds. Omit to unconditionally toggle current state. NOTE: the internal companion flag \'enabled-for-token\'=true means DISABLED — this param uses clear naming.',
        },
        color: {
          type: 'string',
          description: 'Hex color for wound-set-blood-color. Format: \'0xRRGGBB\' (e.g. \'0x990505\' = dark red, \'0x22aa22\' = orc green).',
        },
        // ── Phase 4B: scenery fields ──────────────────────────────────
        sceneId: {
          type: 'string',
          description: 'Scene document ID or UUID for scenery/scene-transitions actions. Defaults to active canvas scene if omitted.',
        },
        variationIndex: {
          type: 'number',
          description: 'Zero-based variation index for scenery actions. Index 0 is the protected Default variation.',
        },
        variationName: {
          type: 'string',
          description: 'Variation name (alternative to variationIndex) for scenery set-active/delete/set-backgrounds/reset actions.',
        },
        name: {
          type: 'string',
          description:
            'Name string. add-variation (scenery): variation name. ' +
            'create-soundscape: new soundscape display name. ' +
            'add-sound: sound layer display name.',
        },
        gmBackground: {
          type: 'string',
          description: 'GM background image path for scenery add-variation/set-variation-backgrounds.',
        },
        plBackground: {
          type: 'string',
          description: 'Player background image path for scenery add-variation/set-variation-backgrounds. Locked to scene.background.src for index 0.',
        },
        sceneData: {
          type: 'object',
          description: 'Optional sceneData snapshot to embed in a variation (add-variation). Object with scene flags/settings to restore when variation is activated.',
        },
        // ── Phase 4B: scene-transitions fields ───────────────────────
        showJournal: {
          type: 'boolean',
          description: 'Toggle for set-scene-transition subAction:show-journal.',
        },
        showMe: {
          type: 'boolean',
          description: 'For play-transition: whether to show the transition to all connected clients (default: true).',
        },
        transitionOptions: {
          type: 'object',
          description: 'Transition options for play-transition/set-scene-transition. Fields: sceneID, content, fontColor, fontSize, bgImg, bgPos, bgLoop, bgMuted, bgSize, bgColor, bgOpacity, fadeIn, delay, fadeOut, audio, volume, audioLoop, allowPlayersToEnd, gmEndAll, gmHide, showUI, activateScene, users. NEVER include fromSocket.',
        },
        // ── Phase 4B: multiface-tiles fields ─────────────────────────
        tileId: {
          type: 'string',
          description: 'Tile document ID for multiface-tiles actions.',
        },
        facePath: {
          type: 'string',
          description: 'Image file path for switch-tile-face, add-tile-face, remove-tile-face.',
        },
        // ── Phase 5: dynamic-soundscapes fields ───────────────────────
        //
        // Fields shared with earlier phases (path, name, enabled, volume, repeat, confirm)
        // are documented on the existing entries above — updated to cover both uses.
        playlistId: {
          type: 'string',
          description:
            'Playlist document ID for dynamic-soundscapes actions. ' +
            'set-soundscape: soundscape to activate (must be in "Soundscapes" folder). ' +
            'set-mood/get-mood: defaults to currently playing soundscape if omitted. ' +
            'set-layer-enabled/set-layer-volume/list-blocks/delete-soundscape/add-sound/remove-sound/update-blocks: required. ' +
            'set-selected: playlist to show in the mixer UI sidebar.',
        },
        mood: {
          type: 'string',
          enum: ['moodA', 'moodB', 'moodC'],
          description:
            'Mood for set-mood: "moodA" (default/calm), "moodB" (tension/fight), "moodC" (climax/special). ' +
            'moodA is the module default when the flag is absent — only write explicitly to change from B or C.',
        },
        soundId: {
          type: 'string',
          description: 'PlaylistSound document ID for set-layer-enabled, set-layer-volume, remove-sound.',
        },
        enabled: {
          type: 'boolean',
          description: 'Layer enable flag for set-layer-enabled: true = active, false = muted/disabled.',
        },
        volume: {
          type: 'number',
          description: 'Layer volume 0.0–1.0 for set-layer-volume.',
        },
        repeat: {
          type: 'boolean',
          description: 'Whether the sound loops; default true (ambient mode) for add-sound.',
        },
        blocks: {
          type: 'array',
          description:
            'Full replacement Block[] array for update-blocks. ' +
            'Each block: { title, id?, sounds?: string[], isOrphaned?, mode?: "ambient"|"soundboard"|"random", ' +
            'time?, variance?, size?, color?, conditions?: string[], conditionMode?: "all"|"any"|"none" }. ' +
            'Always read list-blocks first — this is an atomic overwrite of the entire array.',
          items: { type: 'object' },
        },
      },
      required: ['action'],
    },
  },
];
