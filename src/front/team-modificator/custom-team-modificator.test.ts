import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import AddButton from '../add-button.vue';
import { type State, useFormStore } from '../form-store.ts';
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
