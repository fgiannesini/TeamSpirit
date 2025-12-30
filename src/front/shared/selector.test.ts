import {type DOMWrapper, shallowMount, type VueWrapper,} from '@vue/test-utils';
import {describe, expect, test} from 'vitest';
import Selector from './selector.vue';

describe('Selector', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(Selector, {
      props: {
        selectedMode: 'notSet',
        mandatory: false,
      },
      slots: { default: '<div data-testid="slot"/>' },
    });
  };

  test('should render', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  const radio = (
    wrapper: VueWrapper,
    radioName: string,
  ): DOMWrapper<HTMLInputElement> => {
    return wrapper.find<HTMLInputElement>(`[data-testid=${radioName}-radio]`);
  };

  describe('Mandatory', () => {
    test('Should have a radio available by default button for notSet mode if not mandatory', async () => {
      const wrapper = createWrapper();
      await wrapper.setProps({ selectedMode: 'notSet', mandatory: false });
      const notSetRadio = radio(wrapper, 'notSet');
      expect(notSetRadio.exists()).toBe(true);
    });

    test('Should have a radio not available by default button for notSet mode if mandatory', async () => {
      const wrapper = createWrapper();
      await wrapper.setProps({ selectedMode: 'notSet', mandatory: true });
      const notSetRadio = radio(wrapper, 'notSet');
      expect(notSetRadio.exists()).toBe(false);
    });

    test('Should emit an event on notSet mode selection', async () => {
      const wrapper = createWrapper();
      await wrapper.setProps({ mandatory: false });
      await radio(wrapper, 'random').trigger('click');
      await radio(wrapper, 'notSet').trigger('click');
      expect(wrapper.emitted('update:selectedMode')).toStrictEqual([
        ['random'],
        ['notSet'],
      ]);
    });
  });

  test('Should have a radio not checked by default button for custom mode', () => {
    const wrapper = createWrapper();
    const customRadio = radio(wrapper, 'custom');
    expect(customRadio.isVisible()).toBe(true);
    expect(customRadio.element.checked).toBe(false);
  });

  test('Should have a radio not checked by default button for random mode', () => {
    const wrapper = createWrapper();
    const randomRadio = radio(wrapper, 'random');
    expect(randomRadio.isVisible()).toBe(true);
    expect(randomRadio.element.checked).toBe(false);
  });

  test('Should select random mode', async () => {
    const wrapper = createWrapper();
    const randomRadio = radio(wrapper, 'random');
    await randomRadio.trigger('click');
    expect(randomRadio.element.checked).toBe(true);
  });

  test('Should emit en event on random mode selection', async () => {
    const wrapper = createWrapper();
    await radio(wrapper, 'random').trigger('click');
    expect(wrapper.emitted('update:selectedMode')).toStrictEqual([['random']]);
  });

  test('Should emit en event on random mode selection', async () => {
    const wrapper = createWrapper();
    await radio(wrapper, 'custom').trigger('click');
    expect(wrapper.emitted('update:selectedMode')).toStrictEqual([['custom']]);
  });

  test('Should select random mode, then custom mode', async () => {
    const wrapper = createWrapper();
    const randomRadio = radio(wrapper, 'random');
    await randomRadio.trigger('click');

    await radio(wrapper, 'custom').trigger('click');
    expect(randomRadio.element.checked).toBe(false);
  });

  test('Should select custom mode on initialisation', async () => {
    const wrapper = createWrapper();
    await wrapper.setProps({ selectedMode: 'custom' });
    const customRadio = radio(wrapper, 'custom');
    expect(customRadio.element.checked).toBe(true);
  });

  test('Should select random mode on initialisation', async () => {
    const wrapper = createWrapper();
    await wrapper.setProps({ selectedMode: 'random' });
    const randomRadio = radio(wrapper, 'random');
    expect(randomRadio.element.checked).toBe(true);
  });

  test('Should render custom container and slot when custom mode is selected', async () => {
    const wrapper = createWrapper();
    await wrapper.setProps({
      selectedMode: 'custom',
    });

    expect(wrapper.get('[data-testid=custom-container]').classes()).toContain(
      'active',
    );

    expect(wrapper.get('[data-testid=slot]')).toBeDefined();
  });

  test('Should not render custom team component when random mode is selected', async () => {
    const wrapper = createWrapper();
    await wrapper.setProps({
      selectedMode: 'random',
    });

    expect(
      wrapper.get('[data-testid=custom-container]').classes(),
    ).not.toContain('active');
  });
});
