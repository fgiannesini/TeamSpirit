import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, test } from 'vitest';
import { type State, useFormStore } from './form-store.ts';

describe('Form store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test('should initialise the store', () => {
    const store = useFormStore();
    expect(store.$state).toMatchObject<Partial<State>>({
      teamMode: 'notSet',
    });
  });

  describe('Developers', () => {
    test('should generate a developper', () => {
      const store = useFormStore();
      store.generateDeveloper();
      expect(store.$state).toMatchObject<Partial<State>>({
        developers: [
          {
            id: 0,
            experience: 3,
          },
        ],
      });
    });

    test('Should generate two developers', () => {
      const store = useFormStore();
      store.generateDeveloper();
      store.generateDeveloper();
      expect(store.$state).toMatchObject<Partial<State>>({
        developers: [
          {
            id: 0,
            experience: 3,
          },
          {
            id: 1,
            experience: 3,
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
            experience: 3,
          },
          {
            id: 1,
            experience: 3,
          },
          {
            id: 2,
            experience: 3,
          },
        ],
      });
      store.removeDeveloper(1);
      expect(store.$state).toMatchObject<Partial<State>>({
        developers: [
          {
            id: 0,
            experience: 3,
          },
          {
            id: 2,
            experience: 3,
          },
        ],
      });
    });

    test('Should add a developer after the last one', () => {
      const store = useFormStore();
      store.$patch({
        developers: [
          {
            id: 1,
            experience: 3,
          },
        ],
      });
      store.generateDeveloper();

      expect(store.$state).toMatchObject<Partial<State>>({
        developers: [
          {
            id: 1,
            experience: 3,
          },
          {
            id: 2,
            experience: 3,
          },
        ],
      });
    });
  });

  describe('Team Modifications', () => {
    test('should generate a team modification', () => {
      const store = useFormStore();
      store.generateTeamModification();
      expect(store.$state).toMatchObject<Partial<State>>({
        teamModificators: [
          {
            id: 0,
          },
        ],
      });
    });

    test('Should generate two team modifications', () => {
      const store = useFormStore();
      store.generateTeamModification();
      store.generateTeamModification();
      expect(store.$state).toMatchObject<Partial<State>>({
        teamModificators: [
          {
            id: 0,
          },
          {
            id: 1,
          },
        ],
      });
    });

    test('Should remove a team modification', () => {
      const store = useFormStore();
      store.$patch({
        teamModificators: [
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
      store.removeTeamModification(1);
      expect(store.$state).toMatchObject<Partial<State>>({
        teamModificators: [
          {
            id: 0,
          },
          {
            id: 2,
          },
        ],
      });
    });

    test('Should add a team modification after the last one', () => {
      const store = useFormStore();
      store.$patch({
        teamModificators: [
          {
            id: 1,
          },
        ],
      });
      store.generateTeamModification();

      expect(store.$state).toMatchObject<Partial<State>>({
        teamModificators: [
          {
            id: 1,
          },
          {
            id: 2,
          },
        ],
      });
    });
  });
});
