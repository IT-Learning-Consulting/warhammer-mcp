// Actor update-notification summary builder — extracted VERBATIM from FoundryDataAccess.updateActor
// (Phase 7.2/7.3.2, R7.2 amended).
//
// This is the ~228-line notification-formatting block (formatFieldName / formatValue / isInternalField /
// a WFRP-leaf-aware local flattenObject + the description-assembly) that updateActor used to inline. It
// is pure + side-effect-free: given the write patch + the captured previous values, it returns the
// human-readable summary string that updateActor passes to notify.updated({ summary }).
//
// R7.2 AMENDMENT (user-approved 2026-06-16; journal ADR): the PRD's prescribed resolveStatus/Xp/Career
// helpers do NOT exist as code seams (field-domain resolution lives in the calling skills /wfrp-advance,
// /wfrp-status, which pre-merge one updateData patch). The REAL seam is this formatter. Extracting it
// drops the updateActor orchestrator from ~357 → ~90 lines (R7.2's intent: shrink the longest function).
//
// PLACEMENT (Phase 7 user decision, 2026-06-16): services/shared/ — caps-exempt under the lint-ratchet
// `**/services/**` glob, so the 123-line formatFieldName stays FULLY VERBATIM (NO decomposition). This is
// strictly safer for HC1/HC3 than the plan's original utils/-cap-forced split: the byte-identity oracle
// (da-actor-update.snap.test.ts) trivially holds because the code is literally unchanged.
//
// HC1: bodies are byte-identical to the data-access originals. The only change is the signature
// (free function taking updateData + previousValues, returning the summary string) + `data.updateData`
// → the `updateData` parameter.

export function formatActorUpdateSummary(
  updateData: Record<string, any>,
  previousValues: Record<string, any>,
): string {
  // Format field names in a human-readable way
  const formatFieldName = (key: string): string => {
    // Ensure key is a string
    if (typeof key !== 'string') {
      console.warn(`[Warhammer MCP] Non-string field key:`, key);
      return String(key);
    }

    try {
      const parts = key.split('.');

      if (parts.includes('characteristics')) {
        const charIndex = parts.indexOf('characteristics');

        // Validate array bounds
        if (charIndex + 1 >= parts.length) {
          return 'Unknown Characteristic';
        }

        const char = parts[charIndex + 1];

        // Validate char exists and is string
        if (!char || typeof char !== 'string') {
          return 'Unknown Characteristic';
        }

        const charName: Record<string, string> = {
          'ws': 'Weapon Skill',
          'bs': 'Ballistic Skill',
          's': 'Strength',
          't': 'Toughness',
          'i': 'Initiative',
          'ag': 'Agility',
          'dex': 'Dexterity',
          'int': 'Intelligence',
          'wp': 'Willpower',
          'fel': 'Fellowship'
        };

        const result = charName[char];
        return result || `${char.toUpperCase()} characteristic`;
      } else if (parts.includes('status')) {
        const statIndex = parts.indexOf('status');

        // Validate array bounds
        if (statIndex + 1 >= parts.length) {
          return 'Unknown Status';
        }

        const stat = parts[statIndex + 1];

        if (!stat || typeof stat !== 'string') {
          return 'Unknown Status';
        }

        const statName: Record<string, string> = {
          'wounds': 'Wounds',
          'fortune': 'Fortune',
          'fate': 'Fate',
          'resilience': 'Resilience',
          'resolve': 'Resolve',
          'corruption': 'Corruption',
          'armour': 'Armor Points'
        };

        const result = statName[stat];
        return result || stat;
      } else if (parts.includes('details')) {
        const detailIndex = parts.indexOf('details');

        // Validate array bounds
        if (detailIndex + 1 >= parts.length) {
          return 'Unknown Detail';
        }

        const detail = parts[detailIndex + 1];

        if (!detail || typeof detail !== 'string') {
          return 'Unknown Detail';
        }

        const detailName: Record<string, string> = {
          'age': 'Age',
          'height': 'Height',
          'weight': 'Weight',
          'gender': 'Gender',
          'haircolour': 'Hair Colour',
          'eyecolour': 'Eye Colour',
          'distinguishingmark': 'Distinguishing Mark',
          'starsign': 'Star Sign',
          'move': 'Movement',
          'motivation': 'Motivation',
          'gmnotes': 'GM Notes',
          'personal-ambitions': 'Ambitions',
          'biography': 'Biography',
          'experience': 'Experience'
        };

        const result = detailName[detail];
        return result || detail;
      } else if (parts.includes('experience') || key.includes('experience')) {
        // Handle experience-related fields
        if (parts.includes('log')) {
          return 'Experience Log';
        }
        if (parts.includes('total')) {
          return 'Total XP';
        }
        if (parts.includes('spent')) {
          return 'Spent XP';
        }
        if (parts.includes('current')) {
          return 'Available XP';
        }
        return 'Experience';
      }

      // Default: return last part of path
      const lastPart = parts[parts.length - 1];
      return lastPart || 'Unknown Field';
    } catch (error) {
      console.warn(`[Warhammer MCP] Error formatting field name "${key}":`, error);
      return 'Unknown Field';
    }
  };

  // Helper function to format a value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
      // Truncate long strings
      return value.length > 30 ? value.substring(0, 27) + '...' : value;
    }
    if (Array.isArray(value)) {
      return `[${value.length} items]`;
    }
    if (typeof value === 'object') {
      // For objects, just show "updated" rather than JSON dump
      return '[object]';
    }
    return String(value);
  };

  // Filter out internal fields that shouldn't be shown in notifications
  const isInternalField = (key: string): boolean => {
    const internalPatterns = ['_id', 'type', 'flags', 'ownership', 'folder', 'sort', 'permission'];
    const lowerKey = key.toLowerCase();
    return internalPatterns.some(pattern => lowerKey === pattern || lowerKey.endsWith('.' + pattern));
  };

  // Helper function to flatten nested objects into dot-notation paths
  const flattenObject = (obj: Record<string, any>, prefix = ''): Record<string, any> => {
    const result: Record<string, any> = {};

    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      // Skip internal fields
      if (isInternalField(key) || isInternalField(fullKey)) {
        continue;
      }

      // If value is a plain object (not array, not null), recurse
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Check if it's a "leaf" value object (has 'value' property that's primitive)
        if ('value' in value && (typeof value.value !== 'object' || value.value === null)) {
          // This is likely a WFRP field like {value: 15}, extract the value
          result[fullKey + '.value'] = value.value;
        } else {
          // Recurse into nested object
          Object.assign(result, flattenObject(value, fullKey));
        }
      } else {
        // Primitive value or array - keep as is
        result[fullKey] = value;
      }
    }

    return result;
  };

  // Flatten the updateData to get actual field paths
  const flattenedUpdates = flattenObject(updateData || {});
  const flattenedPrevious = flattenObject(previousValues || {});

  // Create a clear, readable summary of what was updated with before/after values
  const allKeys = Object.keys(flattenedUpdates);
  const userFacingKeys = allKeys.filter(key => !isInternalField(key));

  const fieldDescriptions = userFacingKeys.map((key, index) => {
    try {
      const formatted = formatFieldName(key);
      const oldValue = flattenedPrevious[key];
      const newValue = flattenedUpdates[key];

      // Show before → after format
      let description: string;
      if (oldValue !== undefined && oldValue !== newValue) {
        description = `${formatted}: ${formatValue(oldValue)} → ${formatValue(newValue)}`;
      } else {
        // If we don't have previous value or it's the same, just show new value
        description = `${formatted}: ${formatValue(newValue)}`;
      }

      return description;
    } catch (error) {
      console.warn(`[Warhammer MCP] Error formatting field at index ${index} (key: "${key}"):`, error);
      return `${String(key)}: ${formatValue(flattenedUpdates[key])}`;
    }
  });

  // Filter out any non-strings just in case
  const cleanDescriptions = fieldDescriptions.filter(d => typeof d === 'string');

  // Limit to first 4 items if there are many updates
  const maxItemsToShow = 4;
  let updateSummary: string;
  if (cleanDescriptions.length === 0) {
    updateSummary = 'various fields';
  } else if (cleanDescriptions.length <= maxItemsToShow) {
    updateSummary = cleanDescriptions.join(', ');
  } else {
    const shown = cleanDescriptions.slice(0, maxItemsToShow).join(', ');
    const remaining = cleanDescriptions.length - maxItemsToShow;
    updateSummary = `${shown}, and ${remaining} more field${remaining > 1 ? 's' : ''}`;
  }

  return updateSummary;
}
