import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, test } from 'vitest';
import { useFormStore } from './form-store.ts';

describe('Form store', () => {
  test('should initialise the store', () => {
    setActivePinia(createPinia());
    const store = useFormStore();
    expect(store.$state).not.toBeNull();
  });
});
