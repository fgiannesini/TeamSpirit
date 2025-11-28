import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import AddButton from './add-button.vue';

describe('Add button', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(AddButton, {
      props: {
        text: 'Add something',
      },
    });
  };

  test('Should display a button', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=add-button]').isVisible()).toBe(true);
  });

  test('Should display a text', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=add-button-text]').text()).toBe(
      'Add something',
    );
  });
});
