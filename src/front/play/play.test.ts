import { createTestingPinia } from '@pinia/testing';
import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import type { State } from '../form-store.ts';
import Play from './play.vue';

describe('Play', () => {
  const createWrapper = (state: Partial<State> = {}): VueWrapper => {
    return shallowMount(Play, {
      props: { id: 0 },
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

  test('Should render team type', () => {
    const wrapper = createWrapper({
      simulationOutputs: [
        {
          teamType: 'Parallel',
          statEvents: [],
          structureEvents: [],
          timeEvents: [],
        },
      ],
    });
    expect(wrapper.text()).toBe('Parallel');
  });
});
