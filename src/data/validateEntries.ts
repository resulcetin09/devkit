import type { Entry, EntryCategory } from '../types/entry';

const REQUIRED_FIELDS: (keyof Entry)[] = [
  'id',
  'name',
  'shortDescription',
  'fullDescription',
  'category',
  'tags',
  'sourceUrl',
];

const VALID_CATEGORIES: EntryCategory[] = ['skill', 'mcp-server'];

// Hoist RegExp outside function per js-hoist-regexp
const URL_PATTERN = /^https?:\/\/.+/;

function isValidUrl(value: unknown): boolean {
  if (typeof value !== 'string' || value.trim() === '') return false;
  try {
    new URL(value);
    return URL_PATTERN.test(value);
  } catch {
    return false;
  }
}

export function isValidEntry(item: unknown): item is Entry {
  if (typeof item !== 'object' || item === null) return false;

  const obj = item as Record<string, unknown>;

  // Check all required fields are present and non-empty
  for (const field of REQUIRED_FIELDS) {
    const value = obj[field];
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
  }

  // Validate category is a known enum value
  if (!VALID_CATEGORIES.includes(obj.category as EntryCategory)) return false;

  // Validate tags is a non-empty array of non-empty strings
  if (!Array.isArray(obj.tags)) return false;
  if ((obj.tags as unknown[]).some((t) => typeof t !== 'string' || t.trim() === '')) return false;

  // Validate sourceUrl is a valid URL
  if (!isValidUrl(obj.sourceUrl)) return false;

  // Validate optional iconUrl when present
  if (obj.iconUrl !== undefined && !isValidUrl(obj.iconUrl)) return false;

  return true;
}

export function validateEntries(raw: unknown[]): Entry[] {
  const valid: Entry[] = [];
  for (const item of raw) {
    if (!isValidEntry(item)) {
      console.warn('[Devkit] Skipping invalid entry:', item);
      continue;
    }
    valid.push(item);
  }
  return valid;
}
