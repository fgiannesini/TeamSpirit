import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import AddButton from '../add-button.vue';
import { type State, useFormStore } from '../form-store.ts';
import type PeriodCard from '../period-card.vue';
import CustomTeamModificator from './custom-team-modificator.vue';

describe('Custom Team Modificator', () => {
  const createWrapper = (state: Partial<State> = {}): VueWrapper => {
    return shallowMount(CustomTeamModificator, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              form: { ...state },
            },
          }),
        ],
      },
    });
  };

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  const getTeamModificator = (
    wrapper: VueWrapper,
    selector: string,
  ): VueWrapper<InstanceType<typeof PeriodCard>> => {
    return wrapper.findComponent<typeof PeriodCard>(
      `[data-testid=${selector}]`,
    );
  };

  test('Should display team modificators', () => {
    const wrapper = createWrapper({
      teamModificators: [{ id: 0 }, { id: 1 }],
    });

    expect(
      getTeamModificator(wrapper, 'team-modificator-0').props('id'),
    ).toEqual(0);
    expect(
      getTeamModificator(wrapper, 'team-modificator-1').props('id'),
    ).toEqual(1);
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

  test('Should generate a team modificator card in empty state', async () => {
    const wrapper = createWrapper();
    const addButton = wrapper.getComponent(AddButton);
    await addButton.trigger('click');

    expect(useFormStore().generateTeamModification).toHaveBeenCalled();
  });
});
