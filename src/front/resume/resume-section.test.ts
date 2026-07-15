import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import type { SelectorMode } from '../form-store.ts';
import ResumeSection from './resume-section.vue';

describe('Resume Section', () => {
  const createWrapper = ({
    mode = 'random',
    mandatory = true,
    slotContent = '',
  }: { mode?: SelectorMode; mandatory?: boolean; slotContent?: string } = {}): VueWrapper => {
    return shallowMount(ResumeSection, {
      props: {
        icon: 'groups',
        label: 'Équipe',
        mode,
        mandatory,
      },
      slots: { default: slotContent },
    });
  };

  test('Should render the icon', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('i').text()).toBe('groups');
  });

  test('Should render the label', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('.max').text()).toBe('Équipe');
  });

  test.each<[SelectorMode, string]>([
    ['random', 'Random'],
    ['custom', 'Custom'],
    ['notSet', 'Not set'],
  ])('Should display the mode label for %s', (mode, expectedLabel) => {
    const wrapper = createWrapper({ mode });
    expect(wrapper.get('[data-testid=mode]').text()).toBe(expectedLabel);
  });

  test('Should not render anything when mode is notSet', () => {
    const wrapper = createWrapper({ mode: 'notSet', mandatory: false });
    expect(wrapper.find('[data-testid=mode]').exists()).toBe(false);
  });

  test('Should render when mode is not notSet and section is not mandatory', () => {
    const wrapper = createWrapper({ mode: 'random', mandatory: false });
    expect(wrapper.find('[data-testid=mode]').exists()).toBe(true);
  });

  test('Should render the slot content when mode is custom', () => {
    const wrapper = createWrapper({
      mode: 'custom',
      slotContent: '<span data-testid="slot-content">Dev 0</span>',
    });
    expect(wrapper.find('[data-testid=slot-content]').exists()).toBe(true);
  });

  test('Should not render the slot content when mode is random', () => {
    const wrapper = createWrapper({
      mode: 'random',
      slotContent: '<span data-testid="slot-content">Dev 0</span>',
    });
    expect(wrapper.find('[data-testid=slot-content]').exists()).toBe(false);
  });
});
