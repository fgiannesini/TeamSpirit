import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import ThreadStateBadge from './thread-state-badge.vue';

describe('ThreadStateBadge', () => {
  describe('Variant', () => {
    test('Should apply develop variant when state is Develop', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Develop', presence: '' },
      });
      expect(wrapper.classes()).toContain('thread-state-badge--develop');
    });

    test('Should apply review variant when state is Review', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Review', presence: '' },
      });
      expect(wrapper.classes()).toContain('thread-state-badge--review');
    });

    test('Should not apply variant class in Wait state', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Wait', presence: '' },
      });
      expect(wrapper.classes()).not.toContain('thread-state-badge--develop');
      expect(wrapper.classes()).not.toContain('thread-state-badge--review');
    });

    test('Should not apply variant class in Off state', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Wait', presence: 'off' },
      });
      expect(wrapper.classes()).not.toContain('thread-state-badge--develop');
      expect(wrapper.classes()).not.toContain('thread-state-badge--review');
    });
  });

  describe('Label', () => {
    test('Should show "Wait" when state is Wait', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Wait', presence: '' },
      });
      expect(wrapper.get('[data-testid=thread-state-label-0]').text()).toBe('Wait');
    });

    test('Should show "Off" when presence is off', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Wait', presence: 'off' },
      });
      expect(wrapper.get('[data-testid=thread-state-label-0]').text()).toBe('Off');
    });

    test('Should show "Develop" when state is Develop', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Develop', presence: '' },
      });
      expect(wrapper.get('[data-testid=thread-state-label-0]').text()).toBe('Develop');
    });

    test('Should show "Review" when state is Review', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Review', presence: '' },
      });
      expect(wrapper.get('[data-testid=thread-state-label-0]').text()).toBe('Review');
    });
  });

  describe('Icon', () => {
    test('Should display pause icon in Wait state', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Wait', presence: '' },
      });
      expect(wrapper.get('[data-testid=thread-state-icon-0]').text()).toBe('pause');
    });

    test('Should display code icon in Develop state', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Develop', presence: '' },
      });
      expect(wrapper.get('[data-testid=thread-state-icon-0]').text()).toBe('code');
    });

    test('Should display rate_review icon in Review state', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Review', presence: '' },
      });
      expect(wrapper.get('[data-testid=thread-state-icon-0]').text()).toBe('rate_review');
    });

    test('Should display power_settings_new icon in Off state', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Wait', presence: 'off' },
      });
      expect(wrapper.get('[data-testid=thread-state-icon-0]').text()).toBe('power_settings_new');
    });
  });

  describe('Tooltip', () => {
    test('Should show "Waiting for work" tooltip in Wait state', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Wait', presence: '' },
      });
      expect(wrapper.attributes('title')).toBe('Waiting for work');
    });

    test('Should show "Developing a user story" tooltip in Develop state', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Develop', presence: '' },
      });
      expect(wrapper.attributes('title')).toBe('Developing a user story');
    });

    test('Should show "Reviewing a user story" tooltip in Review state', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Review', presence: '' },
      });
      expect(wrapper.attributes('title')).toBe('Reviewing a user story');
    });

    test('Should show "Thread is unavailable" tooltip when presence is off', () => {
      const wrapper = mount(ThreadStateBadge, {
        props: { threadId: 0, state: 'Wait', presence: 'off' },
      });
      expect(wrapper.attributes('title')).toBe('Thread is unavailable');
    });
  });
});
