import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import RemoveButton from '../remove-button.vue';
import UserStoryCard from './user-story-card.vue';

describe('User Story Card', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(UserStoryCard, {
      props: {
        id: 1,
      },
    });
  };

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should have a title', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=title]').text()).toBe('User story 1');
  });

  test('Should have a button to remove the user story', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent(RemoveButton).exists()).toBe(true);
  });

  test('Should send a remove event on click on remove button', () => {
    const wrapper = createWrapper();
    const button = wrapper.getComponent(RemoveButton);
    button.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('remove');
  });
});
