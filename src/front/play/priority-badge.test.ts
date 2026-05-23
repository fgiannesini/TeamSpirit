import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import PriorityBadge from './priority-badge.vue';

describe('PriorityBadge', () => {
  test('Should have aria-label "Priority 1" when priority is 1', () => {
    const wrapper = mount(PriorityBadge, { props: { priority: 1, storyId: 0 } });
    expect(wrapper.attributes('aria-label')).toBe('Priority 1');
  });

  test('Should display flag icon', () => {
    const wrapper = mount(PriorityBadge, { props: { priority: 3, storyId: 0 } });
    expect(wrapper.get('i').text()).toBe('flag');
  });

  test('Should apply primary class to priority 5+', () => {
    const wrapper = mount(PriorityBadge, { props: { priority: 5, storyId: 0 } });
    expect(wrapper.classes()).toContain('priority-badge--primary');
  });

  test('Should apply secondary class to priority 2 (lower bound)', () => {
    const wrapper = mount(PriorityBadge, { props: { priority: 2, storyId: 0 } });
    expect(wrapper.classes()).toContain('priority-badge--secondary');
  });

  test('Should apply secondary class to priority 4 (upper bound)', () => {
    const wrapper = mount(PriorityBadge, { props: { priority: 4, storyId: 0 } });
    expect(wrapper.classes()).toContain('priority-badge--secondary');
  });

  test('Should apply tertiary class to priority 1', () => {
    const wrapper = mount(PriorityBadge, { props: { priority: 1, storyId: 0 } });
    expect(wrapper.classes()).toContain('priority-badge--tertiary');
  });

  test('Should display the priority value', () => {
    const wrapper = mount(PriorityBadge, { props: { priority: 7, storyId: 0 } });
    expect(wrapper.text()).toContain('7');
  });

  test('Should use storyId in data-testid', () => {
    const wrapper = mount(PriorityBadge, { props: { priority: 3, storyId: 42 } });
    expect(wrapper.attributes('data-testid')).toBe('priority-42');
  });
});
