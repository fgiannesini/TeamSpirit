import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import AddButton from '../add-button.vue';
import { type State, useFormStore } from '../form-store.ts';
import { developer, teamModification } from '../front-factory-for-test.ts';
import PeriodCard from '../period-card.vue';
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
  ): VueWrapper<InstanceType<typeof PeriodCard>> =>
    wrapper.findComponent<typeof PeriodCard>(`[data-testid=${selector}]`);

  test('Should generate a team modificator in settings state', async () => {
    const wrapper = createWrapper({
      teamModificators: [teamModification()],
    });
    const addButton = wrapper.getComponent(AddButton);
    await addButton.trigger('click');

    expect(useFormStore().generateTeamModification).toHaveBeenCalled();
  });

  test('Should display team modificators', () => {
    const wrapper = createWrapper({
      teamModificators: [teamModification(), teamModification({ id: 1 })],
    });

    expect(
      getTeamModificator(wrapper, 'team-modificator-0').props('id'),
    ).toEqual(0);
    expect(
      getTeamModificator(wrapper, 'team-modificator-1').props('id'),
    ).toEqual(1);
  });

  test('Should remove a team modificator', async () => {
    const wrapper = createWrapper({
      teamModificators: [teamModification()],
    });
    await getTeamModificator(wrapper, 'team-modificator-0').trigger('remove');
    expect(useFormStore().removeTeamModification).toHaveBeenCalledWith(0);
  });

  describe('Events', () => {
    test('should bind developers for period card', () => {
      const wrapper = createWrapper({
        developers: [developer()],
        teamModificators: [teamModification()],
      });
      const periodCard = wrapper.getComponent(PeriodCard);
      expect(periodCard.props('developers')).toStrictEqual([developer()]);
    });

    test('should bind selected developers for period card', () => {
      const wrapper = createWrapper({
        developers: [developer({ id: 0 })],
        teamModificators: [
          teamModification({ selectedDevelopers: [developer({ id: 1 })] }),
        ],
      });
      const periodCard = wrapper.getComponent(PeriodCard);
      expect(periodCard.props('selectedDevelopers')).toStrictEqual([
        developer({ id: 1 }),
      ]);
    });
  });
  describe('Empty state', () => {
    test('Should render empty state when no developers are configured', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid=empty-state]').exists()).toBe(true);
    });

    test('Should not display empty state when team modificators are configured', () => {
      const wrapper = createWrapper({
        teamModificators: [teamModification()],
      });
      expect(wrapper.find('[data-testid=empty-state]').exists()).toBe(false);
    });

    test('Should have a button to add a team modification when no team modification is added', () => {
      const wrapper = createWrapper();
      expect(wrapper.findComponent(AddButton).isVisible()).toBe(true);
    });

    test('Should not display setting state when no team modificator is added', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid=setting-state]').exists()).toBe(false);
    });

    test('Should generate a team modificator in empty state', async () => {
      const wrapper = createWrapper();
      const addButton = wrapper.getComponent(AddButton);
      await addButton.trigger('click');

      expect(useFormStore().generateTeamModification).toHaveBeenCalled();
    });
  });
});
