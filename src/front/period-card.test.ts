import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import PeriodCard from './period-card.vue';

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
});
