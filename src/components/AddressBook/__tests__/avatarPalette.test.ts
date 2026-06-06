import { describe, it, expect } from 'vitest';
import {
  addressBookAvatarColors,
  getAddressBookAvatarColor,
  getAddressBookAvatarSx,
} from '../avatarPalette';

describe('avatarPalette', () => {
  describe('getAddressBookAvatarColor', () => {
    it('always returns a colour from the palette', () => {
      for (const seed of ['Alice', 'Bob', 'QAbc123', '', '   ', '🙂']) {
        expect(addressBookAvatarColors).toContain(
          getAddressBookAvatarColor(seed)
        );
      }
    });

    it('is deterministic for the same seed', () => {
      expect(getAddressBookAvatarColor('Alice')).toBe(
        getAddressBookAvatarColor('Alice')
      );
    });

    it('falls back to the fallback index when the seed is blank', () => {
      // Blank seed -> String(fallbackIndex); both forms must agree.
      expect(getAddressBookAvatarColor('   ', 0)).toBe(
        getAddressBookAvatarColor('0')
      );
      expect(getAddressBookAvatarColor('', 3)).toBe(
        getAddressBookAvatarColor('3')
      );
    });

    it('distributes different seeds across more than one colour', () => {
      const seeds = Array.from({ length: 50 }, (_, i) => `contact-${i}`);
      const distinct = new Set(seeds.map((s) => getAddressBookAvatarColor(s)));
      expect(distinct.size).toBeGreaterThan(1);
    });
  });

  describe('getAddressBookAvatarSx', () => {
    it('builds an sx object that uses the supplied colour', () => {
      const sx = getAddressBookAvatarSx('#AEB7FF');
      expect(sx.bgcolor).toBe('#AEB7FF');
      expect(sx.boxShadow).toContain('#AEB7FF');
      expect(typeof sx.color).toBe('string');
    });
  });
});
