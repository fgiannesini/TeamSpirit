import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import AddButton from '../add-button.vue';
import { type State, useFormStore } from '../form-store.ts';
import { userStory } from '../front-factory-for-test.ts';
import CustomUserStories from './custom-user-stories.vue';
import type UserStoryCard from './user-story-card.vue';

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

  test('Should generate a user story card in settings state', async () => {
    const wrapper = createWrapper({
      userStories: [userStory()],
    });
    const addButton = wrapper.getComponent(AddButton);
    await addButton.trigger('click');

    expect(useFormStore().generateUserStory).toHaveBeenCalled();
  });

  const getUserStoryCard = (
    wrapper: VueWrapper,
    selector: string,
  ): VueWrapper<InstanceType<typeof UserStoryCard>> =>
    wrapper.findComponent<typeof UserStoryCard>(`[data-testid=${selector}]`);

  test('Should display userStory cards', () => {
    const wrapper = createWrapper({
      userStories: [userStory(), userStory({ id: 1 })],
    });

    expect(getUserStoryCard(wrapper, 'user-story-card-0').props('id')).toEqual(
      0,
    );
    expect(getUserStoryCard(wrapper, 'user-story-card-1').props('id')).toEqual(
      1,
    );
  });

  test('Should remove a user story card', async () => {
    const wrapper = createWrapper({
      userStories: [userStory()],
    });
    await getUserStoryCard(wrapper, 'user-story-card-0').trigger('remove');
    expect(useFormStore().removeUserStory).toHaveBeenCalledWith(0);
  });

  describe('Complexity', () => {
    test('Should bind complexity', async () => {
      const wrapper = createWrapper({
        userStories: [userStory({ complexity: 2 })],
      });
      const userStory0 = getUserStoryCard(wrapper, 'user-story-card-0');
      expect(userStory0.props('complexity')).toStrictEqual(2);
    });

    test('Should update complexity', async () => {
      const wrapper = createWrapper({
        userStories: [userStory({ complexity: 2 })],
      });
      const userStory0 = getUserStoryCard(wrapper, 'user-story-card-0');
      userStory0.vm.$emit('update:complexity', 3);
      expect(useFormStore().userStories[0].complexity).toStrictEqual(3);
    });
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
