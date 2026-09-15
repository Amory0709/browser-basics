import { randomName } from './types';

const DISPLAY_NAME_KEY = 'bb-display-name';

export function getPreferredDisplayName(): string {
  try {
    const saved = sessionStorage.getItem(DISPLAY_NAME_KEY)?.trim();
    if (saved) return saved;
  } catch {
    // ignore storage errors
  }

  const generated = randomName();
  savePreferredDisplayName(generated);
  return generated;
}

export function savePreferredDisplayName(name: string): void {
  try {
    sessionStorage.setItem(DISPLAY_NAME_KEY, name.trim());
  } catch {
    // ignore storage errors
  }
}
