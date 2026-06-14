import { describe, it, expect } from 'vitest';
import { hasInvisibleCharacters } from '../invisibleCharacters';

describe('hasInvisibleCharacters', () => {
  it('returns false for plain ASCII text', () => {
    expect(hasInvisibleCharacters('Alice')).toBe(false);
    expect(hasInvisibleCharacters('bob_jones-123')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(hasInvisibleCharacters('')).toBe(false);
  });

  it('returns false for ordinary whitespace (space, tab, newline)', () => {
    expect(hasInvisibleCharacters('Bob Jones')).toBe(false);
    expect(hasInvisibleCharacters('line1\nline2\tend')).toBe(false);
  });

  it('returns false for visible non-ASCII / accented characters', () => {
    expect(hasInvisibleCharacters('José')).toBe(false); // José
    expect(hasInvisibleCharacters('日本語')).toBe(false); // 日本語
  });

  it.each([
    ['soft hyphen U+00AD', 'al­ice'],
    ['zero-width space U+200B', 'al​ice'],
    ['zero-width non-joiner U+200C', 'al‌ice'],
    ['left-to-right mark U+200E', 'al‎ice'],
    ['right-to-left mark U+200F', 'al‏ice'],
    ['byte order mark U+FEFF', 'al﻿ice'],
    ['Hangul filler U+3164', 'alㅤice'],
    ['braille blank U+2800', 'al⠀ice'],
    ['Arabic letter mark U+061C', 'al؜ice'],
  ])('detects %s', (_label, value) => {
    expect(hasInvisibleCharacters(value)).toBe(true);
  });

  it('normalizes with NFKC before checking, so an ideographic space (U+3000) collapses to a plain space and is not flagged', () => {
    expect(hasInvisibleCharacters('a　b')).toBe(false);
  });
});
