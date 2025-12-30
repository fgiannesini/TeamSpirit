import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Resume from '../resume/resume.vue';
import Simulation from './simulation.vue';

describe('Simulation', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(Simulation);
  };

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  describe('Resume', () => {
    test('Should render a resume panel', () => {
      const wrapper = createWrapper();
      expect(wrapper.get('[data-testid=resume-panel]').isVisible()).toBe(true);
    });

    test('Should render a resume component', () => {
      const wrapper = createWrapper();
      expect(wrapper.findComponent(Resume).isVisible()).toBe(true);
    });
  });
});
