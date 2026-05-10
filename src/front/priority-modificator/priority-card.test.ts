import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { userStory } from '../front-factory-for-test.ts';
import RemoveButton from '../shared/remove-button.vue';
import Slider from '../shared/slider.vue';
import PriorityCard from './priority-card.vue';

describe('Priority Card', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(PriorityCard, {
      props: {
        id: 1,
        date: new Date('2025-12-25'),
        userStories: [userStory(), userStory({ id: 1 }), userStory({ id: 2, priority: 5 })],
        selectedUserStories: [userStory({ id: 2, priority: 5 })],
        priority: 3,
      },
    });
  };

  test('Should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should render a title with id', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('[data-testid=title]').text()).toBe('Priority change 1');
  });

  test('Should have a button to remove the card', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent(RemoveButton).exists()).toBe(true);
  });

  test('Should send a remove event on click on remove button', () => {
    const wrapper = createWrapper();
    wrapper.getComponent(RemoveButton).trigger('click');
    expect(wrapper.emitted()).toHaveProperty('remove');
  });

  describe('Date', () => {
    test('Should render a date input', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid=date-input]').exists()).toBe(true);
    });

    test('Should render a date label', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid=date-label]').text()).toBe('Date');
    });

    test('Should bind date value', () => {
      const wrapper = createWrapper();
      const input = wrapper.get<HTMLInputElement>('[data-testid=date-input]');
      expect(input.element.value).toBe('2025-12-25');
    });

    test('Should send update:date event on date change', async () => {
      const wrapper = createWrapper();
      const input = wrapper.get<HTMLInputElement>('[data-testid=date-input]');
      await input.setValue('2025-12-28');

      const emitted = wrapper.emitted('update:date');
      expect(emitted?.[0]).toStrictEqual([new Date('2025-12-28')]);
    });
  });

  describe('User stories', () => {
    test('Should render a field label', () => {
      const wrapper = createWrapper();
      expect(wrapper.get('[data-testid=us-label]').text()).toBe('User stories');
    });

    test('Should render a default select option', () => {
      const wrapper = createWrapper();
      expect(wrapper.get('[data-testid=us-default-option]').text()).toBe('Select a user story');
    });

    test('Should render items to select', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid=us-select-item-0]').text()).toBe('User story 0 - prio 1');
      expect(wrapper.find('[data-testid=us-select-item-1]').text()).toBe('User story 1 - prio 1');
    });

    test('Should send update:selected-user-stories event on item selection', () => {
      const wrapper = createWrapper();
      wrapper.find('[data-testid=us-select-item-0]').trigger('click');
      const emitted = wrapper.emitted('update:selected-user-stories');
      expect(emitted?.[0]).toStrictEqual([[userStory({ id: 2, priority: 5 }), userStory()]]);
    });

    test('Should display selected items as chips', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid=us-selected-label-2]').text()).toBe(
        'User story 2 - prio 5',
      );
    });

    test('Should not display selected items in items to select', async () => {
      const wrapper = createWrapper();
      await wrapper.setProps({ selectedUserStories: [userStory()] });

      expect(wrapper.find('[data-testid=us-select-item-0]').exists()).toBe(false);
      expect(wrapper.find('[data-testid=us-select-item-1]').exists()).toBe(true);
    });

    test('Should send update:selected-user-stories event on item deselection', () => {
      const wrapper = createWrapper();
      wrapper.find('[data-testid=us-selected-button-2]').trigger('click');
      const emitted = wrapper.emitted('update:selected-user-stories');
      expect(emitted?.[0]).toStrictEqual([[]]);
    });
  });

  describe('Priority slider', () => {
    test('Should render a slider', () => {
      const wrapper = createWrapper();
      expect(wrapper.findComponent(Slider).exists()).toBe(true);
    });

    test('Should bind priority value', () => {
      const wrapper = createWrapper();
      expect(wrapper.getComponent(Slider).props('value')).toBe(3);
    });

    test('Should have min 1', () => {
      const wrapper = createWrapper();
      expect(wrapper.getComponent(Slider).props('min')).toBe(1);
    });

    test('Should have max 10', () => {
      const wrapper = createWrapper();
      expect(wrapper.getComponent(Slider).props('max')).toBe(10);
    });

    test('Should send update:priority event on slider change', () => {
      const wrapper = createWrapper();
      wrapper.getComponent(Slider).vm.$emit('update:value', 7);
      const emitted = wrapper.emitted('update:priority');
      expect(emitted?.[0]).toStrictEqual([7]);
    });
  });
});
