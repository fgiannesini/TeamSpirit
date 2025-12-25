import {flushPromises, shallowMount, type VueWrapper} from '@vue/test-utils';
import {describe, expect, test} from 'vitest';
import PeriodCard from './period-card.vue';
import RemoveButton from './remove-button.vue';

describe('Period Card', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(PeriodCard, {
      props: {
        id: 1,
        periodStart: new Date('2023-01-01'),
        periodEnd: new Date('2024-01-01'),
        developers: [
          { id: 0, experience: 3 },
          { id: 1, experience: 3 },
        ],
        selectedDevelopers: [{ id: 2, experience: 3 }],
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

  test('Should have a button to remove the card', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent(RemoveButton).exists()).toBe(true);
  });

  test('Should send a remove event on click on remove button', () => {
    const wrapper = createWrapper();
    const button = wrapper.getComponent(RemoveButton);
    button.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('remove');
  });

  describe('Period Start', () => {
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

    test('Should bind date value', () => {
      const wrapper = createWrapper();
      const input = wrapper.get<HTMLInputElement>(
        '[data-testid=start-date-input]',
      );
      expect(input.element.value).toStrictEqual('2023-01-01');
    });

    test('Should send an update event on date change', async () => {
      const wrapper = createWrapper();
      const input = wrapper.get<HTMLInputElement>(
        '[data-testid=start-date-input]',
      );
      await input.setValue('2023-01-02');
      await flushPromises();

      const emitted = wrapper.emitted('update:period-start');
      expect(emitted?.[0]).toStrictEqual([new Date('2023-01-02')]);
    });
  });

  describe('Period End', () => {
    test('Should render a date field for period end', () => {
      const wrapper = createWrapper();
      const endDate = wrapper.find('[data-testid=end-date-input]');
      expect(endDate.exists()).toBe(true);
    });

    test('Should render a date label for period end', () => {
      const wrapper = createWrapper();
      const endDateLabel = wrapper.find('[data-testid=end-date-label]');
      expect(endDateLabel.text()).toBe('End');
    });

    test('Should bind date value', () => {
      const wrapper = createWrapper();
      const input = wrapper.get<HTMLInputElement>(
        '[data-testid=end-date-input]',
      );
      expect(input.element.value).toStrictEqual('2024-01-01');
    });

    test('Should send an update event on date change', async () => {
      const wrapper = createWrapper();
      const input = wrapper.get<HTMLInputElement>(
        '[data-testid=end-date-input]',
      );
      await input.setValue('2024-01-02');
      await flushPromises();

      const emitted = wrapper.emitted('update:period-end');
      expect(emitted?.[0]).toStrictEqual([new Date('2024-01-02')]);
    });
  });

  describe('Developers', () => {
    test('should render a field label', () => {
      const wrapper = createWrapper();
      const devLabel = wrapper.get('[data-testid=dev-label]');
      expect(devLabel.text()).toBe('Developers');
    });

    test('should render a select label', () => {
      const wrapper = createWrapper();
      const devLabel = wrapper.get('[data-testid=dev-select-label]');
      expect(devLabel.text()).toBe('Select a developer');
    });

    test('should render items to select', () => {
      const wrapper = createWrapper();

      const item0 = wrapper.find('[data-testid=dev-select-item-0]');
      expect(item0.text()).toBe('Developer 0 - XP 3');

      const item1 = wrapper.find('[data-testid=dev-select-item-1]');
      expect(item1.text()).toBe('Developer 1 - XP 3');
    });

    test('should send an event on item selection', () => {
      const wrapper = createWrapper();

      const item0 = wrapper.find('[data-testid=dev-select-item-0]');
      item0.trigger('click');

      const emitted = wrapper.emitted('update:select-developer');
      expect(emitted?.[0]).toStrictEqual([{ id: 0, experience: 3 }]);
    });

    test('should display selected items as chips', () => {
      const wrapper = createWrapper();

      const chip = wrapper.find('[data-testid=dev-selected-chip-0]');
      expect(chip.text()).toBe('Developer 2 - XP 3');
    });

    test('should not display selected items in items to select', async () => {
      const wrapper = createWrapper();
      await wrapper.setProps({
        selectedDevelopers: [{ id: 0, experience: 3 }],
      });

      const item0 = wrapper.find('[data-testid=dev-select-item-0]');
      expect(item0.exists()).toBe(false);

      const item1 = wrapper.find('[data-testid=dev-select-item-1]');
      expect(item1.exists()).toBe(true);
    });
  });
});
