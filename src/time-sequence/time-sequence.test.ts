import { beforeEach, describe, expect, test, vi } from 'vitest';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { saveTimeEvents } from '../flow/storage/session-storage.ts';

describe('Time sequence', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      assign: vi.fn(),
      search: '?id=e4567-e89b-12d3-a456-426614174000',
    } as unknown as Location);
    const htmlPath = resolve(__dirname, './time-sequence.html');
    document.body.innerHTML = readFileSync(htmlPath, 'utf-8');
    vi.useFakeTimers();
  });

  test('Should render the page without time events', async () => {
    saveTimeEvents([], 'e4567-e89b-12d3-a456-426614174000');
    await import('./time-sequence.ts');

    const threads = document.querySelector('#user-stories');
    expect(threads).not.toBeNull();
  });
});
