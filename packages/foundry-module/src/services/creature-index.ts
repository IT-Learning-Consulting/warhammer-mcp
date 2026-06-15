// services/creature-index.ts — MCP Code-Quality Hardening v1, Phase 3 (R3.1).
// PersistentCreatureIndex extracted verbatim from data-access.ts; zero behavioral change (hooks, the
// BUG-268 build-serialization promise, the BUG-180/269/357 derivation all preserved). Shared DTOs + the
// CreatureIndexReader contract live in ../service-interfaces.ts (outside services/ for the boundary rule).

import { MODULE_ID } from '../constants.js';
import { notify } from '../notify.js';
import type { CreatureIndexReader, EnhancedCreatureIndex, PersistentEnhancedIndex, PackFingerprint } from '../service-interfaces.js';

/**
 * Persistent Enhanced Creature Index System
 * Stores pre-computed creature data in JSON file within Foundry world directory for instant filtering
 * Uses file-based storage following Foundry best practices for large data sets
 */
export class PersistentCreatureIndex implements CreatureIndexReader {
  private moduleId: string = MODULE_ID;
  // BUG-180 (bumped 2026-05-24): the creatureType derivation in extractEnhancedCreatureData now
  // applies SPECIES_TO_CREATURE_TYPE (species display-name → filter enum, e.g. 'Goblin'→'greenskin').
  // The enhanced index is persisted to worlds/<id>/enhanced-creature-index.json and only rebuilt
  // when this version (or a pack fingerprint) changes — so any change to the index derivation MUST
  // bump this version, or the stale pre-fix index keeps being served and creatureType filters miss.
  // BUG-269: bumped from 1.1.0 — challengeRating now uses TB (floor(T/10)) not raw T value.
  // BUG-357: bumped to 1.3.0 — the index now includes creature-type actors (doc.type ==='creature'),
  // not just npc/character; without this bump worlds keep serving the stale index that omits
  // bestiary creatures like the Goblin, so creatureType:'greenskin' misses it.
  private readonly INDEX_VERSION = '1.3.0';
  private readonly INDEX_FILENAME = 'enhanced-creature-index.json';
  // BUG-268: in-flight build promise — serializes index builds so exactly one
  // savePersistedIndex writer runs at a time (see buildEnhancedIndex).
  private buildPromise: Promise<EnhancedCreatureIndex[]> | null = null;
  private hooksRegistered = false;

  constructor() {
    this.registerFoundryHooks();
  }

  /** Get the file path for the enhanced creature index */
  private getIndexFilePath(): string {
    // BUG-276: path must start with '/' so fetch resolves to /worlds/... not relative to /game.
    return `/worlds/${game.world.id}/${this.INDEX_FILENAME}`;
  }

  /** Get or build the enhanced creature index */
  async getEnhancedIndex(): Promise<EnhancedCreatureIndex[]> {
    // Check if we have a valid persistent index
    const existingIndex = await this.loadPersistedIndex();

    if (existingIndex && this.isIndexValid(existingIndex)) {
      return existingIndex.creatures;
    }

    // Build new index if needed
    return await this.buildEnhancedIndex();
  }

  /** Force rebuild of the enhanced index */
  async rebuildIndex(): Promise<EnhancedCreatureIndex[]> {
    return await this.buildEnhancedIndex(true);
  }

  /** Load persisted index from JSON file */
  private async loadPersistedIndex(): Promise<PersistentEnhancedIndex | null> {
    try {
      const filePath = this.getIndexFilePath();

      // Check if file exists using Foundry's FilePicker
      let fileExists = false;
      try {
        const browseResult = await (foundry as any).applications.apps.FilePicker.implementation.browse('data', `worlds/${game.world.id}`);
        fileExists = browseResult.files.some((f: any) => f.endsWith(this.INDEX_FILENAME));
      } catch (error) {
        // Directory doesn't exist or other error, return null
        return null;
      }

      if (!fileExists) {
        return null;
      }

      // Load file content
      const response = await fetch(filePath);
      if (!response.ok) {
        console.warn(`[${this.moduleId}] Failed to load index file: ${response.status}`);
        return null;
      }

      const rawData = await response.json();


      // Convert Map data back from JSON
      const metadata = rawData.metadata;
      if (metadata && metadata.packFingerprints) {
        metadata.packFingerprints = new Map(metadata.packFingerprints);
      }

      return rawData;
    } catch (error) {
      console.warn(`[${this.moduleId}] Failed to load persisted index from file:`, error);
      return null;
    }
  }

  /** Save enhanced index to JSON file */
  private async savePersistedIndex(index: PersistentEnhancedIndex): Promise<void> {
    try {
      // Convert Map to Array for JSON serialization
      const saveData = {
        ...index,
        metadata: {
          ...index.metadata,
          packFingerprints: Array.from(index.metadata.packFingerprints.entries())
        }
      };

      const jsonContent = JSON.stringify(saveData, null, 2);

      // Create a File object and upload it using Foundry's file system
      const file = new File([jsonContent], this.INDEX_FILENAME, { type: 'application/json' });

      // Upload the file to the world directory
      const uploadResponse = await (foundry as any).applications.apps.FilePicker.implementation.upload('data', `worlds/${game.world.id}`, file);

      if (uploadResponse) {
      } else {
        throw new Error('File upload failed');
      }
    } catch (error) {
      console.error(`[${this.moduleId}] Failed to save enhanced index to file:`, error);
      throw error;
    }
  }

  /** Check if existing index is valid (all packs unchanged) */
  private isIndexValid(existingIndex: PersistentEnhancedIndex): boolean {
    if (existingIndex.metadata.version !== this.INDEX_VERSION) {
      return false;
    }

    // Check each pack fingerprint
    const actorPacks = Array.from(game.packs?.values() || []).filter((pack: any) => pack.metadata?.type === 'Actor');

    for (const pack of actorPacks) {
      const currentFingerprint = this.generatePackFingerprint(pack as any);
      const savedFingerprint = existingIndex.metadata.packFingerprints.get((pack as any).metadata?.id);

      if (!savedFingerprint) {
        return false;
      }

      if (!this.fingerprintsMatch(currentFingerprint, savedFingerprint)) {
        return false;
      }
    }

    // Check if any saved packs no longer exist
    for (const [packId] of existingIndex.metadata.packFingerprints) {
      if (!game.packs.get(packId)) {
        return false;
      }
    }

    return true;
  }

  /** Register Foundry hooks for real-time pack change detection */
  private registerFoundryHooks(): void {
    if (this.hooksRegistered) return;

    // Listen for compendium document changes
    Hooks.on('createDocument', (document: any) => {
      if (document.pack && (document.type === 'npc' || document.type === 'character')) {
        void this.invalidateIndex();
      }
    });

    Hooks.on('updateDocument', (document: any) => {
      if (document.pack && (document.type === 'npc' || document.type === 'character')) {
        void this.invalidateIndex();
      }
    });

    Hooks.on('deleteDocument', (document: any) => {
      if (document.pack && (document.type === 'npc' || document.type === 'character')) {
        void this.invalidateIndex();
      }
    });

    // Listen for pack creation/deletion
    Hooks.on('createCompendium', (pack: any) => {
      if (pack.metadata.type === 'Actor') {
        void this.invalidateIndex();
      }
    });

    Hooks.on('deleteCompendium', (pack: any) => {
      if (pack.metadata.type === 'Actor') {
        void this.invalidateIndex();
      }
    });

    this.hooksRegistered = true;
  }

  /** Invalidate the current index (mark for rebuild on next access) */
  private async invalidateIndex(): Promise<void> {
    try {
      // Check if auto-rebuild is enabled
      const autoRebuild = game.settings.get(this.moduleId, 'autoRebuildIndex');

      if (!autoRebuild) {
        return;
      }

      // Delete the index file to force rebuild
      const filePath = this.getIndexFilePath();

      try {
        // Check if file exists first by trying to browse to the world directory
        const browseResult = await (foundry as any).applications.apps.FilePicker.implementation.browse('data', `worlds/${game.world.id}`);
        const fileExists = browseResult.files.some((f: any) => f.endsWith(this.INDEX_FILENAME));

        if (fileExists) {
          // File exists, delete it using fetch with DELETE method
          await fetch(filePath, { method: 'DELETE' });
          // File deletion completed (or failed silently)
        }
      } catch (error) {
        // File doesn't exist or deletion failed - that's okay
      }
    } catch (error) {
      console.warn(`[${this.moduleId}] Failed to invalidate index:`, error);
    }
  }

  /**
   * Generate fingerprint for pack change detection with improved accuracy
   */
  private generatePackFingerprint(pack: any): PackFingerprint {
    // Get actual modification time if available
    let lastModified = Date.now();
    if (pack.metadata?.lastModified) {
      lastModified = new Date(pack.metadata.lastModified).getTime();
    }

    return {
      packId: pack.metadata?.id || '',
      packLabel: pack.metadata?.label || '',
      lastModified: lastModified,
      documentCount: pack.index?.size || 0,
      checksum: this.generatePackChecksum(pack)
    };
  }

  /**
   * Generate checksum for pack contents
   */
  private generatePackChecksum(pack: any): string {
    // Simple checksum based on pack metadata and size
    const data = `${pack.metadata?.id || ''}-${pack.metadata?.label || ''}-${pack.index?.size || 0}`;
    return btoa(data).slice(0, 16); // Simple hash for demonstration
  }

  /**
   * Compare two pack fingerprints
   */
  private fingerprintsMatch(current: PackFingerprint, saved: PackFingerprint): boolean {
    return current.documentCount === saved.documentCount &&
      current.checksum === saved.checksum;
  }

  /**
   * Build enhanced creature index from all Actor packs with detailed progress tracking.
   * BUG-268: builds are serialized through buildPromise — non-forced callers join the
   * in-flight build; forced rebuilds chain after it (never race it), so exactly one
   * savePersistedIndex writer runs at a time.
   */
  private async buildEnhancedIndex(force = false): Promise<EnhancedCreatureIndex[]> {
    if (this.buildPromise && !force) {
      return this.buildPromise;
    }

    const previous = this.buildPromise;
    const run = (async () => {
      if (previous) {
        // Forced rebuild: wait out the in-flight build (its failure is not ours) first.
        await previous.catch(() => undefined);
      }
      return this.runEnhancedIndexBuild();
    })();
    this.buildPromise = run;

    // Clear the slot once this build settles so later invalidations rebuild fresh.
    run.then(
      () => { if (this.buildPromise === run) this.buildPromise = null; },
      () => { if (this.buildPromise === run) this.buildPromise = null; }
    );

    return run;
  }

  /** The actual index build — only ever invoked via buildEnhancedIndex's serialization. */
  private async runEnhancedIndexBuild(): Promise<EnhancedCreatureIndex[]> {
    const startTime = Date.now();
    let progressHandle: ReturnType<typeof notify.progress> | null = null;
    let progressDone = false;
    let totalErrors = 0; // Track extraction errors

    try {

      const actorPacks = Array.from(game.packs?.values() || []).filter((pack: any) => pack.metadata?.type === 'Actor');
      const enhancedCreatures: EnhancedCreatureIndex[] = [];
      const packFingerprints = new Map<string, PackFingerprint>();

      // Single updating progress bar via notify.progress (replaces the prior
      // chain of disposable ui.notifications.info toasts).
      progressHandle = notify.progress(`Starting enhanced creature index build from ${actorPacks.length} packs...`);

      for (let i = 0; i < actorPacks.length; i++) {
        const pack = actorPacks[i] as any;
        const progressPercent = i / actorPacks.length;

        // Update progress notification every few packs or for important packs
        if (i % 3 === 0 || pack.metadata?.label?.toLowerCase().includes('monster')) {
          progressHandle?.update(
            progressPercent,
            `Building creature index... ${Math.round(progressPercent * 100)}% (${i + 1}/${actorPacks.length}) Processing: ${pack.metadata?.label || 'Unknown'}`,
          );
        }


        try {
          // Ensure pack index is loaded
          if (!pack.indexed) {
            await pack.getIndex({});
          }

          // Generate pack fingerprint for change detection
          packFingerprints.set(pack.metadata?.id || '', this.generatePackFingerprint(pack));

          // Show pack processing details for large packs
          const packSize = pack.index?.size || 0;
          if (packSize > 50) {
            progressHandle?.update(
              progressPercent,
              `Processing large pack: ${pack.metadata.label} (${packSize} documents)...`,
            );
          }

          // Process creatures in this pack
          const packResult = await this.extractEnhancedDataFromPack(pack);
          enhancedCreatures.push(...packResult.creatures);
          totalErrors += packResult.errors;

          // Pack processing completed: ${pack.metadata.label} - ${packResult.creatures.length} creatures extracted

          // Show milestone notifications for significant progress
          if (i === 0 || (i + 1) % 5 === 0 || i === actorPacks.length - 1) {
            const totalCreaturesSoFar = enhancedCreatures.length;
            progressHandle?.update(
              (i + 1) / actorPacks.length,
              `Index Progress: ${i + 1}/${actorPacks.length} packs complete, ${totalCreaturesSoFar} creatures indexed`,
            );
          }

        } catch (error) {
          console.warn(`[${this.moduleId}] Failed to process pack ${pack.metadata.label}:`, error);
          // Show separate warn toast for pack failures — doesn't disturb the
          // running progress bar.
          notify.warn(`Failed to index pack "${pack.metadata.label}" — continuing with other packs`);
        }
      }

      // Final save step.
      progressHandle?.update(0.95, `Saving enhanced index to world database... (${enhancedCreatures.length} creatures)`);

      // Create persistent index structure
      const persistentIndex: PersistentEnhancedIndex = {
        metadata: {
          version: this.INDEX_VERSION,
          timestamp: Date.now(),
          packFingerprints,
          totalCreatures: enhancedCreatures.length
        },
        creatures: enhancedCreatures
      };

      // Save to world flags
      await this.savePersistedIndex(persistentIndex);

      const buildTimeSeconds = Math.round((Date.now() - startTime) / 1000);
      const errorText = totalErrors > 0 ? ` (${totalErrors} extraction errors)` : '';
      const successMessage = `Enhanced creature index complete! ${enhancedCreatures.length} creatures indexed from ${actorPacks.length} packs in ${buildTimeSeconds}s${errorText}`;

      progressHandle?.done(successMessage);
      progressDone = true;

      return enhancedCreatures;

    } catch (error) {
      const errorMessage = `Failed to build enhanced creature index: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`[${this.moduleId}] ${errorMessage}`);
      progressHandle?.fail(error instanceof Error ? error : errorMessage);
      progressDone = true;

      throw error;

    } finally {
      // Defensive: clear progress bar if neither done() nor fail() ran.
      if (progressHandle && !progressDone) {
        progressHandle.done();
      }
    }
  }

  /**
   * Extract enhanced data from all documents in a pack
   */
  private async extractEnhancedDataFromPack(pack: any): Promise<{ creatures: EnhancedCreatureIndex[], errors: number }> {
    const creatures: EnhancedCreatureIndex[] = [];
    let errors = 0;

    try {
      // Load all documents from pack
      const documents = await pack.getDocuments();

      for (const doc of documents) {
        try {
          // Process NPCs, characters, AND creatures. BUG-357: creature-type bestiary actors
          // (e.g. the core Goblin, whose species.value is "Goblin" → greenskin) were excluded
          // here, so creatureType filters like greenskin never surfaced them.
          if (doc.type !== 'npc' && doc.type !== 'character' && doc.type !== 'creature') {
            continue;
          }

          const result = this.extractEnhancedCreatureData(doc, pack);
          if (result) {
            creatures.push(result.creature);
            errors += result.errors;
          }

        } catch (error) {
          console.warn(`[${this.moduleId}] Failed to extract data from ${doc.name} in ${pack.metadata.label}:`, error);
          errors++;
        }
      }

    } catch (error) {
      console.warn(`[${this.moduleId}] Failed to load documents from ${pack.metadata.label}:`, error);
      errors++;
    }

    return { creatures, errors };
  }

  /**
   * Extract enhanced creature data from a single document
   * WFRP 4e specific implementation
   */
  private extractEnhancedCreatureData(doc: any, pack: any): { creature: EnhancedCreatureIndex, errors: number } | null {
    try {
      const system = doc.system || {};

      // Detect game system - only WFRP 4e supported
      const gameSystem = game.system?.id || '';
      const isWFRP = gameSystem.includes('wfrp');

      if (!isWFRP) {
        console.warn(`[${this.moduleId}] Non-WFRP system detected: ${gameSystem}. Skipping creature.`);
        return null;
      }

      // Extract threat rating - WFRP uses characteristics-based assessment
      let challengeRating = 0;
      const tRaw = system.characteristics?.t?.value ?? system.characteristics?.t?.initial ?? 0;
      const wounds = system.status?.wounds?.max ?? system.status?.wounds?.value ?? 0;
      // BUG-269: use Toughness Bonus (TB = floor(T/10)) not raw T value.
      // Authoritative bonus field preferred; fall back to manual floor if absent.
      const toughnessBonus269 = system.characteristics?.t?.bonus ?? Math.floor(tRaw / 10);
      challengeRating = toughnessBonus269 + Math.floor(wounds / 10);

      // Handle null values
      if (challengeRating === null || challengeRating === undefined) {
        challengeRating = 0;
      }

      // Ensure it's a number
      challengeRating = Number(challengeRating) || 0;

      // Extract creature type with proper type checking
      let creatureType = 'unknown';

      // WFRP uses species for creatures; fall back to the Foundry doc type
      creatureType = system.details?.species?.value ??
        system.details?.species ??
        doc.type ??
        'unknown';

      // Handle null/undefined values properly
      if (creatureType === null || creatureType === undefined || creatureType === '') {
        creatureType = 'unknown';
      }

      // Ensure creatureType is a string before calling toLowerCase()
      if (typeof creatureType !== 'string') {
        creatureType = String(creatureType || 'unknown');
      }

      // BUG-180: Map species names to the filter enum values used by search-compendium.
      // WFRP species field stores display names ('Goblin', 'Orc') but the filter enum
      // uses category keys ('greenskin'). Without this map, creatureType:'greenskin' returns 0.
      const SPECIES_TO_CREATURE_TYPE: Record<string, string> = {
        goblin: 'greenskin', orc: 'greenskin', gnoblar: 'greenskin',
        'night goblin': 'greenskin', 'forest goblin': 'greenskin',
        skaven: 'chaos', beastman: 'beastman', gor: 'beastman', ungor: 'beastman',
        zombie: 'undead', skeleton: 'undead', wight: 'undead', ghoul: 'undead', vampire: 'undead',
        daemon: 'daemon', 'chaos spawn': 'chaos',
        human: 'human', halfling: 'halfling', dwarf: 'dwarf',
        elf: 'elf', 'wood elf': 'elf', 'high elf': 'elf', 'dark elf': 'elf',
      };
      const mappedType = SPECIES_TO_CREATURE_TYPE[creatureType.toLowerCase()];
      if (mappedType) creatureType = mappedType;

      // Extract size (WFRP specific)
      let size = 'average';
      size = system.details?.size?.value || system.details?.size || 'average';

      // Ensure size is a string
      if (typeof size !== 'string') {
        size = String(size || 'average');
      }

      // Extract wounds (WFRP specific)
      const woundsValue = system.status?.wounds?.max || system.status?.wounds?.value ||
        system.wounds?.max || system.wounds?.value || 0;

      // Extract toughness bonus + armor (WFRP defense calculation)
      // WFRP: armour comes from equipped armour Items, not system.* paths
      // BUG-269: prefer authoritative .bonus field; fall back to floor(value/10).
      const toughnessBonus = system.characteristics?.t?.bonus ?? Math.floor((system.characteristics?.t?.value ?? 0) / 10);
      const equippedArmour = (doc.items ?? []).filter((i: any) =>
        i.type === 'armour' && i.system?.equipped?.value);
      const armorPoints = equippedArmour.reduce((sum: number, a: any) =>
        sum + (a.system?.currentAP?.value ?? 0), 0);
      const toughnessValue = toughnessBonus + armorPoints;

      // WFRP: spells/prayers/traits are embedded Items, not system subobjects
      const hasSpells = doc.items?.some((i: any) =>
        i.type === 'spell' || i.type === 'prayer') ?? false;
      const hasSpecialAbilities = doc.items?.some((i: any) =>
        i.type === 'trait') ?? false;

      // Successful extraction
      return {
        creature: {
          id: doc._id,
          name: doc.name,
          type: doc.type,
          pack: pack.metadata.id,
          packLabel: pack.metadata.label,
          challengeRating: challengeRating,
          creatureType: creatureType.toLowerCase(),
          size: size.toLowerCase(),
          wounds: woundsValue,
          toughness: toughnessValue,
          hasSpells: hasSpells,
          hasSpecialAbilities: hasSpecialAbilities,
          description: doc.system?.details?.biography || doc.system?.description || '',
          img: doc.img
        },
        errors: 0
      };

    } catch (error) {
      console.warn(`[${this.moduleId}] Failed to extract enhanced data from ${doc.name}:`, error);

      // Return a basic fallback record with error count instead of null to avoid losing creatures
      return {
        creature: {
          id: doc._id,
          name: doc.name,
          type: doc.type,
          pack: pack.metadata.id,
          packLabel: pack.metadata.label,
          challengeRating: 0,
          creatureType: 'unknown',
          size: 'average',
          wounds: 1,
          toughness: 10,
          hasSpells: false,
          hasSpecialAbilities: false,
          description: 'Data extraction failed',
          img: doc.img || ''
        },
        errors: 1
      };
    }
  }
}
