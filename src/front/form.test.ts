import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import type DeveloperCard from './developer-card.vue';
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

  test('Should generate a developper card', () => {
    const wrapper = createWrapper();
    const addButton = wrapper.get('[data-testid=add-developer-button]');
    addButton.trigger('click');
    const developerCard1 = wrapper.findComponent<typeof DeveloperCard>(
      '[data-testid=developer-card-1]',
    );
    expect(developerCard1.props('id')).toEqual(1);
  });

  test('Should generate two developer cards', () => {
    const wrapper = createWrapper();
    const addButton = wrapper.get('[data-testid=add-developer-button]');
    addButton.trigger('click');
    addButton.trigger('click');
    const developerCard1 = wrapper.findComponent<typeof DeveloperCard>(
      '[data-testid=developer-card-2]',
    );
    expect(developerCard1.props('id')).toEqual(2);
  });
});
