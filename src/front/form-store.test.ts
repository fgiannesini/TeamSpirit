import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type State, useFormStore } from './form-store.ts';
import { teamModification, userStory } from './front-factory-for-test.ts';

describe('Form store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers({
      now: new Date('2025-12-25'),
    });
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
          teamModification({
            id: 0,
          }),
        ],
      });
    });

    test('Should generate two team modifications', () => {
      const store = useFormStore();
      store.generateTeamModification();
      store.generateTeamModification();
      expect(store.$state).toMatchObject<Partial<State>>({
        teamModificators: [
          teamModification({
            id: 0,
          }),
          teamModification({
            id: 1,
          }),
        ],
      });
    });

    test('Should remove a team modification', () => {
      const store = useFormStore();
      store.$patch({
        teamModificators: [
          teamModification({
            id: 0,
          }),
          teamModification({
            id: 1,
          }),
          teamModification({
            id: 2,
          }),
        ],
      });
      store.removeTeamModification(1);
      expect(store.$state).toMatchObject<Partial<State>>({
        teamModificators: [
          teamModification({
            id: 0,
          }),
          teamModification({
            id: 2,
          }),
        ],
      });
    });

    test('Should add a team modification after the last one', () => {
      const store = useFormStore();
      store.$patch({
        teamModificators: [
          teamModification({
            id: 1,
          }),
        ],
      });
      store.generateTeamModification();

      expect(store.$state).toMatchObject<Partial<State>>({
        teamModificators: [
          teamModification({
            id: 1,
          }),
          teamModification({
            id: 2,
          }),
        ],
      });
    });
  });

  describe('User stories', () => {
    test('should generate a user story', () => {
      const store = useFormStore();
      store.generateUserStory();
      expect(store.$state).toMatchObject<Partial<State>>({
        userStories: [
          userStory({
            id: 0,
          }),
        ],
      });
    });

    test('Should generate two user stories', () => {
      const store = useFormStore();
      store.generateUserStory();
      store.generateUserStory();
      expect(store.$state).toMatchObject<Partial<State>>({
        userStories: [
          userStory({
            id: 0,
          }),
          userStory({
            id: 1,
          }),
        ],
      });
    });

    test('Should remove a user story', () => {
      const store = useFormStore();
      store.$patch({
        userStories: [
          userStory({
            id: 0,
          }),
          userStory({
            id: 1,
          }),
          userStory({
            id: 2,
          }),
        ],
      });
      store.removeUserStory(1);
      expect(store.$state).toMatchObject<Partial<State>>({
        userStories: [
          userStory({
            id: 0,
          }),
          userStory({
            id: 2,
          }),
        ],
      });
    });

    test('Should add a user story after the last one', () => {
      const store = useFormStore();
      store.$patch({
        userStories: [
          userStory({
            id: 1,
          }),
        ],
      });
      store.generateUserStory();

      expect(store.$state).toMatchObject<Partial<State>>({
        userStories: [
          userStory({
            id: 1,
          }),
          userStory({
            id: 2,
          }),
        ],
      });
    });
  });
});
