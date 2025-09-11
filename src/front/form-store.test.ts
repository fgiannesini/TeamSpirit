import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, test } from 'vitest';
import { useFormStore } from './form-store.ts';

describe('Form store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test('should initialise the store', () => {
    const store = useFormStore();
    expect(store.$state).toEqual({
      teamMode: 'notSet',
    });
  });

  test('should store the team mode', () => {
    const store = useFormStore();
    store.setTeamMode('random');
    expect(store.$state).toEqual({
      teamMode: 'random',
    });
  });
});
