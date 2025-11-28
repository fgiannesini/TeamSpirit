import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import PeriodCard from './period-card.vue';
import RemoveButton from './remove-button.vue';

describe('Period Card', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(PeriodCard, {
      props: {
        id: 1,
      },
    });
  };

  test('Should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should render a title for period', () => {
    const wrapper = createWrapper();
    const title = wrapper.find('[data-testid=title]');
    expect(title.text()).toBe('Period 1');
  });

  test('Should render a date field for period start', () => {
    const wrapper = createWrapper();
    const startDate = wrapper.find('[data-testid=start-date-input]');
    expect(startDate.exists()).toBe(true);
  });

  test('Should render a date label for period start', () => {
    const wrapper = createWrapper();
    const startDateLabel = wrapper.find('[data-testid=start-date-label]');
    expect(startDateLabel.text()).toBe('Start');
  });

  test('Should render a date field for period end', () => {
    const wrapper = createWrapper();
    const endDate = wrapper.find('[data-testid=end-date-input]');
    expect(endDate.exists()).toBe(true);
  });

  test('Should render a date label for period end', () => {
    const wrapper = createWrapper();
    const startDateLabel = wrapper.find('[data-testid=end-date-label]');
    expect(startDateLabel.text()).toBe('End');
  });

  test('Should have a button to remove the card', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent(RemoveButton).exists()).toBe(true);
  });
});
