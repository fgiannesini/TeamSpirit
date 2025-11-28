import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import AddButton from '../add-button.vue';
import PeriodCard from '../period-card.vue';
import CustomTeamModificator from './custom-team-modificator.vue';

describe('Custom Team Modificator', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(CustomTeamModificator);
  };

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  describe('Empty state', () => {
    test('Should render empty state', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid=empty-state]').exists()).toBe(true);
    });
    test('Should have a button to add a team modification when no team modification is added', () => {
      const wrapper = createWrapper();
      expect(wrapper.findComponent(AddButton).isVisible()).toBe(true);
    });
  });

  test('Should render a period card', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent(PeriodCard).exists()).toBe(true);
  });
});
