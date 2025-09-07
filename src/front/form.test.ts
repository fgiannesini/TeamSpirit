import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Form from './form.vue';

describe('Form', () => {
  const createWrapper = (): VueWrapper => {
    return mount(Form);
  };
  test('Should render a form', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should have a main', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('main').isVisible()).toBe(true);
  });

  test('Should have a button to add a developer', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=add-developer-button]').isVisible()).toBe(
      true,
    );
  });

  test('Should generate a card to add a developer', () => {
    const wrapper = createWrapper();
    wrapper.get('[data-testid=add-developer-button]').trigger('click');
    expect(wrapper.get('[data-testid=developer-card]').isVisible()).toBe(true);
  });
});
