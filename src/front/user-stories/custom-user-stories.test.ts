import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import AddButton from '../add-button.vue';
import { type State, useFormStore } from '../form-store.ts';
import { userStory } from '../front-factory-for-test.ts';
import CustomUserStories from './custom-user-stories.vue';

describe('Custom User Stories', () => {
  const createWrapper = (state: Partial<State> = {}): VueWrapper => {
    return shallowMount(CustomUserStories, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              form: { ...state },
            },
          }),
        ],
      },
    });
  };

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  describe('Empty state', () => {
    test('Should display empty state when no user stories are configured', () => {
      const wrapper = createWrapper();
      expect(wrapper.get('[data-testid=empty-state]').isVisible()).toBe(true);
    });

    test('Should not display empty state when user stories are configured', () => {
      const wrapper = createWrapper({
        userStories: [userStory()],
      });
      expect(wrapper.find('[data-testid=empty-state]').exists()).toBe(false);
    });

    test('Should have a button to add a user story when no user story is added', () => {
      const wrapper = createWrapper();
      expect(wrapper.findComponent(AddButton).isVisible()).toBe(true);
    });

    test('Should not display setting state when no user story is added', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid=setting-state]').exists()).toBe(false);
    });

    test('Should generate a user story card in empty state', async () => {
      const wrapper = createWrapper();
      const addButton = wrapper.getComponent(AddButton);
      await addButton.trigger('click');

      expect(useFormStore().generateUserStory).toHaveBeenCalled();
    });
  });
});
