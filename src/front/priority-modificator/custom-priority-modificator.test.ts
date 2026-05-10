import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { type State, useFormStore } from '../form-store.ts';
import { priorityModification, userStory } from '../front-factory-for-test.ts';
import AddButton from '../shared/add-button.vue';
import CustomPriorityModificator from './custom-priority-modificator.vue';
import PriorityCard from './priority-card.vue';

describe('Custom Priority Modificator', () => {
  const createWrapper = (state: Partial<State> = {}): VueWrapper => {
    return shallowMount(CustomPriorityModificator, {
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

  const getPriorityCard = (
    wrapper: VueWrapper,
    selector: string,
  ): VueWrapper<InstanceType<typeof PriorityCard>> =>
    wrapper.findComponent<typeof PriorityCard>(`[data-testid=${selector}]`);

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should generate a priority modificator in setting state', async () => {
    const wrapper = createWrapper({ priorityModificators: [priorityModification()] });
    await wrapper.getComponent(AddButton).trigger('click');
    expect(useFormStore().generatePriorityModification).toHaveBeenCalled();
  });

  test('Should display priority modificators', () => {
    const wrapper = createWrapper({
      priorityModificators: [priorityModification(), priorityModification({ id: 1 })],
    });
    expect(getPriorityCard(wrapper, 'priority-modificator-0').props('id')).toEqual(0);
    expect(getPriorityCard(wrapper, 'priority-modificator-1').props('id')).toEqual(1);
  });

  test('Should remove a priority modificator', async () => {
    const wrapper = createWrapper({ priorityModificators: [priorityModification()] });
    await getPriorityCard(wrapper, 'priority-modificator-0').trigger('remove');
    expect(useFormStore().removePriorityModification).toHaveBeenCalledWith(0);
  });

  describe('Events', () => {
    test('Should bind userStories for priority card', () => {
      const wrapper = createWrapper({
        userStories: [userStory()],
        priorityModificators: [priorityModification()],
      });
      expect(wrapper.getComponent(PriorityCard).props('userStories')).toStrictEqual([userStory()]);
    });

    test('Should bind selectedUserStories for priority card', () => {
      const wrapper = createWrapper({
        priorityModificators: [
          priorityModification({ selectedUserStories: [userStory({ id: 1 })] }),
        ],
      });
      expect(wrapper.getComponent(PriorityCard).props('selectedUserStories')).toStrictEqual([
        userStory({ id: 1 }),
      ]);
    });

    test('Should update selectedUserStories on emit', () => {
      const wrapper = createWrapper({ priorityModificators: [priorityModification()] });
      wrapper.getComponent(PriorityCard).vm.$emit('update:selectedUserStories', [userStory()]);
      expect(useFormStore().priorityModificators[0].selectedUserStories).toStrictEqual([
        userStory(),
      ]);
    });

    test('Should bind date for priority card', () => {
      const wrapper = createWrapper({
        priorityModificators: [priorityModification({ date: new Date('2025-12-28') })],
      });
      expect(wrapper.getComponent(PriorityCard).props('date')).toStrictEqual(
        new Date('2025-12-28'),
      );
    });

    test('Should update date on emit', () => {
      const wrapper = createWrapper({ priorityModificators: [priorityModification()] });
      wrapper.getComponent(PriorityCard).vm.$emit('update:date', new Date('2025-12-28'));
      expect(useFormStore().priorityModificators[0].date).toStrictEqual(new Date('2025-12-28'));
    });

    test('Should bind priority for priority card', () => {
      const wrapper = createWrapper({
        priorityModificators: [priorityModification({ priority: 7 })],
      });
      expect(wrapper.getComponent(PriorityCard).props('priority')).toBe(7);
    });

    test('Should update priority on emit', () => {
      const wrapper = createWrapper({ priorityModificators: [priorityModification()] });
      wrapper.getComponent(PriorityCard).vm.$emit('update:priority', 8);
      expect(useFormStore().priorityModificators[0].priority).toBe(8);
    });
  });

  describe('Empty state', () => {
    test('Should render empty state when no priority modificators are configured', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid=empty-state]').exists()).toBe(true);
    });

    test('Should not display empty state when priority modificators are configured', () => {
      const wrapper = createWrapper({ priorityModificators: [priorityModification()] });
      expect(wrapper.find('[data-testid=empty-state]').exists()).toBe(false);
    });

    test('Should have a button to add a priority modification in empty state', () => {
      const wrapper = createWrapper();
      expect(wrapper.findComponent(AddButton).exists()).toBe(true);
    });

    test('Should not display setting state when no priority modificator is added', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid=setting-state]').exists()).toBe(false);
    });

    test('Should generate a priority modificator in empty state', async () => {
      const wrapper = createWrapper();
      await wrapper.getComponent(AddButton).trigger('click');
      expect(useFormStore().generatePriorityModification).toHaveBeenCalled();
    });
  });
});
