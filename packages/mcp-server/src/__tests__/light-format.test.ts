import { describe, it, expect } from 'vitest';
import { formatLightListItem } from '../tools/light.js';

describe('formatLightListItem', () => {
    it('includes explicit isGlobal and hidden flags', () => {
        const text = formatLightListItem({
            id: 'light-1',
            sceneId: 'scene-1',
            dim: 20,
            bright: 10,
            isGlobal: true,
            hidden: false,
        });

        expect(text).toContain('isGlobal=yes');
        expect(text).toContain('hidden=no');
    });

    it('renders no/yes correctly for false/true', () => {
        const text = formatLightListItem({
            id: 'light-2',
            sceneId: 'scene-2',
            dim: 0,
            bright: 0,
            isGlobal: false,
            hidden: true,
        });

        expect(text).toContain('isGlobal=no');
        expect(text).toContain('hidden=yes');
    });
});
