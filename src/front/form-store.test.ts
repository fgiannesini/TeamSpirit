import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, test } from 'vitest';
import { useFormStore } from './form-store.ts';

describe('Form store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test('should initialise the store', () => {
    const store = useFormStore();
    expect(store.$state).toMatchObject({
      teamMode: 'notSet',
    });
  });

  test('should store the team mode', () => {
    const store = useFormStore();
    store.setTeamMode('random');
    expect(store.$state).toMatchObject({
      teamMode: 'random',
    });
  });

  test('should generate a developper', () => {
    const store = useFormStore();
    store.generateDeveloper();
    expect(store.$state).toMatchObject({
      developers: [
        {
          id: 0,
        },
      ],
    });
  });

  test('Should generate two developers', () => {
    const store = useFormStore();
    store.generateDeveloper();
    store.generateDeveloper();
    expect(store.$state).toMatchObject({
      developers: [
        {
          id: 0,
        },
        {
          id: 1,
        },
      ],
    });
  });

  test('Should remove a developer card', () => {
    const store = useFormStore();
    store.$patch({
      developers: [
        {
          id: 0,
        },
        {
          id: 1,
        },
        {
          id: 2,
        },
      ],
    });
    store.removeDeveloper(1);
    expect(store.$state).toMatchObject({
      developers: [
        {
          id: 0,
        },
        {
          id: 2,
        },
      ],
    });
  });
});
