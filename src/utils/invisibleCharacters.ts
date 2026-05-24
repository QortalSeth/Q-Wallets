export function hasInvisibleCharacters(str: string) {
  const normalized = str.normalize('NFKC');

  return /[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180E\u2000-\u200F\u2028-\u202F\u205F-\u206F\u2800\u3164\uFE00-\uFE0F\uFEFF\uFFA0]/u.test(
    normalized
  );
}
