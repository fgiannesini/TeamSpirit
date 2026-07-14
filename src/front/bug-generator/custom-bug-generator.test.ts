import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { type State, useFormStore } from '../form-store.ts';
import { bugGeneration } from '../front-factory-for-test.ts';
import AddButton from '../shared/add-button.vue';
import BugCard from './bug-card.vue';
import CustomBugGenerator from './custom-bug-generator.vue';

describe('Custom Bug Generator', () => {
  const createWrapper = (state: Partial<State> = {}): VueWrapper => {
    return shallowMount(CustomBugGenerator, {
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

  const getBugCard = (
    wrapper: VueWrapper,
    selector: string,
  ): VueWrapper<InstanceType<typeof BugCard>> =>
    wrapper.findComponent<typeof BugCard>(`[data-testid=${selector}]`);

  test('Should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should generate a bug generation in setting state', async () => {
    const wrapper = createWrapper({ bugGenerations: [bugGeneration()] });
    await wrapper.getComponent(AddButton).trigger('click');
    expect(useFormStore().generateBugGeneration).toHaveBeenCalled();
  });

  test('Should display bug generations', () => {
    const wrapper = createWrapper({
      bugGenerations: [bugGeneration(), bugGeneration({ id: 1 })],
    });
    expect(getBugCard(wrapper, 'bug-generation-0').props('id')).toEqual(0);
    expect(getBugCard(wrapper, 'bug-generation-1').props('id')).toEqual(1);
  });

  test('Should remove a bug generation', async () => {
    const wrapper = createWrapper({ bugGenerations: [bugGeneration()] });
    await getBugCard(wrapper, 'bug-generation-0').trigger('remove');
    expect(useFormStore().removeBugGeneration).toHaveBeenCalledWith(0);
  });

  describe('Events', () => {
    test('Should bind date for bug card', () => {
      const wrapper = createWrapper({
        bugGenerations: [bugGeneration({ date: new Date('2025-12-28') })],
      });
      expect(wrapper.getComponent(BugCard).props('date')).toStrictEqual(new Date('2025-12-28'));
    });

    test('Should update date on emit', () => {
      const wrapper = createWrapper({ bugGenerations: [bugGeneration()] });
      wrapper.getComponent(BugCard).vm.$emit('update:date', new Date('2025-12-28'));
      expect(useFormStore().bugGenerations[0].date).toStrictEqual(new Date('2025-12-28'));
    });

    test('Should bind complexity for bug card', () => {
      const wrapper = createWrapper({ bugGenerations: [bugGeneration({ complexity: 7 })] });
      expect(wrapper.getComponent(BugCard).props('complexity')).toBe(7);
    });

    test('Should update complexity on emit', () => {
      const wrapper = createWrapper({ bugGenerations: [bugGeneration()] });
      wrapper.getComponent(BugCard).vm.$emit('update:complexity', 8);
      expect(useFormStore().bugGenerations[0].complexity).toBe(8);
    });

    test('Should bind review-complexity for bug card', () => {
      const wrapper = createWrapper({ bugGenerations: [bugGeneration({ reviewComplexity: 6 })] });
      expect(wrapper.getComponent(BugCard).props('reviewComplexity')).toBe(6);
    });

    test('Should update review-complexity on emit', () => {
      const wrapper = createWrapper({ bugGenerations: [bugGeneration()] });
      wrapper.getComponent(BugCard).vm.$emit('update:review-complexity', 9);
      expect(useFormStore().bugGenerations[0].reviewComplexity).toBe(9);
    });

    test('Should bind priority for bug card', () => {
      const wrapper = createWrapper({ bugGenerations: [bugGeneration({ priority: 4 })] });
      expect(wrapper.getComponent(BugCard).props('priority')).toBe(4);
    });

    test('Should update priority on emit', () => {
      const wrapper = createWrapper({ bugGenerations: [bugGeneration()] });
      wrapper.getComponent(BugCard).vm.$emit('update:priority', 10);
      expect(useFormStore().bugGenerations[0].priority).toBe(10);
    });
  });

  describe('Empty state', () => {
    test('Should render empty state when no bug generations are configured', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid=empty-state]').exists()).toBe(true);
    });

    test('Should not display empty state when bug generations are configured', () => {
      const wrapper = createWrapper({ bugGenerations: [bugGeneration()] });
      expect(wrapper.find('[data-testid=empty-state]').exists()).toBe(false);
    });

    test('Should have a button to add a bug generation in empty state', () => {
      const wrapper = createWrapper();
      expect(wrapper.findComponent(AddButton).exists()).toBe(true);
    });

    test('Should not display setting state when no bug generation is added', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid=setting-state]').exists()).toBe(false);
    });

    test('Should generate a bug generation in empty state', async () => {
      const wrapper = createWrapper();
      await wrapper.getComponent(AddButton).trigger('click');
      expect(useFormStore().generateBugGeneration).toHaveBeenCalled();
    });
  });
});
