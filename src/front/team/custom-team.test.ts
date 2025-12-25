import { createTestingPinia } from '@pinia/testing';
import { flushPromises, shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import AddButton from '../add-button.vue';
import { type State, useFormStore } from '../form-store.ts';
import { developer } from '../front-factory-for-test.ts';
import CustomTeam from './custom-team.vue';
import type DeveloperCard from './developer-card.vue';

describe('Custom Team', () => {
  const createWrapper = (state: Partial<State> = {}): VueWrapper => {
    return shallowMount(CustomTeam, {
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
  test('Should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  const getDeveloperCard = (
    wrapper: VueWrapper,
    selector: string,
  ): VueWrapper<InstanceType<typeof DeveloperCard>> => {
    return wrapper.findComponent<typeof DeveloperCard>(
      `[data-testid=${selector}]`,
    );
  };

  test('Should generate a developper card in settings state', async () => {
    const wrapper = createWrapper({
      developers: [developer()],
    });
    const addButton = wrapper.getComponent(AddButton);
    await addButton.trigger('click');

    expect(useFormStore().generateDeveloper).toHaveBeenCalled();
  });

  test('Should display developer cards', () => {
    const wrapper = createWrapper({
      developers: [developer(), { id: 1, experience: 3 }],
    });

    expect(getDeveloperCard(wrapper, 'developer-card-0').props('id')).toEqual(
      0,
    );
    expect(getDeveloperCard(wrapper, 'developer-card-1').props('id')).toEqual(
      1,
    );
  });

  test('Should bind developer experience', () => {
    const wrapper = createWrapper({
      developers: [developer({ id: 0, experience: 4 })],
    });

    expect(
      getDeveloperCard(wrapper, 'developer-card-0').props('experience'),
    ).toEqual(4);
  });

  test('Should update developer experience', async () => {
    const wrapper = createWrapper({
      developers: [developer()],
    });
    const developerCard = getDeveloperCard(wrapper, 'developer-card-0');
    developerCard.vm.$emit('update:experience', 2);
    await flushPromises();

    expect(useFormStore().developers[0].experience).toEqual(2);
  });

  test('Should remove a developer card', async () => {
    const wrapper = createWrapper({
      developers: [developer()],
    });
    await getDeveloperCard(wrapper, 'developer-card-0').trigger('remove');
    expect(useFormStore().removeDeveloper).toHaveBeenCalledWith(0);
  });

  describe('Empty state', () => {
    test('Should display empty state when no developers are configured', () => {
      const wrapper = createWrapper();
      expect(wrapper.get('[data-testid=empty-state]').isVisible()).toBe(true);
    });

    test('Should not display empty state when developers are configured', () => {
      const wrapper = createWrapper({
        developers: [developer()],
      });
      expect(wrapper.find('[data-testid=empty-state]').exists()).toBe(false);
    });

    test('Should have a button to add a developer when no developper is added', () => {
      const wrapper = createWrapper();
      expect(wrapper.findComponent(AddButton).isVisible()).toBe(true);
    });

    test('Should not display setting state when no developer is added', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid=setting-state]').exists()).toBe(false);
    });

    test('Should generate a developper card in empty state', async () => {
      const wrapper = createWrapper();
      const addButton = wrapper.getComponent(AddButton);
      await addButton.trigger('click');

      expect(useFormStore().generateDeveloper).toHaveBeenCalled();
    });
  });
});
