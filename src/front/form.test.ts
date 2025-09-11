import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Form from './form.vue';
import Team from './team.vue';

describe('Form', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(Form);
  };

  test('Should have a main', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('main').isVisible()).toBe(true);
  });

  test('Should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should render a Team', () => {
    const wrapper = createWrapper();
    const team = wrapper.getComponent<typeof Team>(Team);
    expect(team.isVisible()).toBe(true);
  });

  test("Should render a navigation tab teams", () => {
      const wrapper = createWrapper();
      expect(wrapper.get("[data-testid=team-tab]").isVisible()).toBe(true);
  });

    test("Should render a navigation tab reviewers", () => {
        const wrapper = createWrapper();
        expect(wrapper.get("[data-testid=reviewers-tab]").isVisible()).toBe(true);
    });
});
