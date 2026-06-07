import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import type { ThreadVue, UserStoryVue } from './thread.ts';
import ThreadCard from './thread-card.vue';
import ThreadStateBadge from './thread-state-badge.vue';

const makeThread = (overrides: Partial<ThreadVue> = {}): ThreadVue => ({
  id: 0,
  name: 'dev0',
  state: 'Wait',
  presence: '',
  inProgressStories: [],
  reviewStories: [],
  ...overrides,
});

const makeStory = (overrides: Partial<UserStoryVue> = {}) => ({
  id: 0,
  name: 'US0',
  priority: null as number | null,
  ...overrides,
});

const mount_ = (thread: ThreadVue, flashingStoryIds = new Set<number>()) =>
  mount(ThreadCard, { props: { thread, flashingStoryIds } });

describe('ThreadCard', () => {
  describe('Base', () => {
    test('Should have thread class on root', () => {
      const wrapper = mount_(makeThread());
      expect(wrapper.classes()).toContain('thread');
    });

    test('Should render thread title', () => {
      const wrapper = mount_(makeThread({ name: 'dev42' }));
      expect(wrapper.get('[data-testid=thread-title-0]').text()).toBe('dev42');
    });

    test('Should render thread-user-story container', () => {
      const wrapper = mount_(makeThread());
      expect(wrapper.find('[data-testid=thread-user-story-0]').exists()).toBe(true);
    });
  });

  describe('Thread state classes', () => {
    test('Should add thread--develop class when state is Develop', () => {
      const wrapper = mount_(makeThread({ state: 'Develop' }));
      expect(wrapper.classes()).toContain('thread--develop');
    });

    test('Should add thread--review class when state is Review', () => {
      const wrapper = mount_(makeThread({ state: 'Review' }));
      expect(wrapper.classes()).toContain('thread--review');
    });

    test('Should add off class when presence is off', () => {
      const wrapper = mount_(makeThread({ presence: 'off' }));
      expect(wrapper.classes()).toContain('off');
    });

    test('Should not have off class when presence is empty', () => {
      const wrapper = mount_(makeThread({ presence: '' }));
      expect(wrapper.classes()).not.toContain('off');
    });
  });

  describe('ThreadStateBadge', () => {
    test('Should pass state to ThreadStateBadge', () => {
      const wrapper = mount_(makeThread({ state: 'Develop' }));
      expect(wrapper.findComponent(ThreadStateBadge).props('state')).toBe('Develop');
    });

    test('Should pass presence to ThreadStateBadge', () => {
      const wrapper = mount_(makeThread({ presence: 'off' }));
      expect(wrapper.findComponent(ThreadStateBadge).props('presence')).toBe('off');
    });
  });

  describe('Thread idle hint', () => {
    test('Should show idle hint when Wait and no stories', () => {
      const wrapper = mount_(makeThread({ state: 'Wait' }));
      expect(wrapper.find('[data-testid=thread-idle-0]').exists()).toBe(true);
    });

    test('Should hide idle hint when has in-progress story', () => {
      const wrapper = mount_(makeThread({ inProgressStories: [makeStory({ id: 0 })] }));
      expect(wrapper.find('[data-testid=thread-idle-0]').exists()).toBe(false);
    });

    test('Should hide idle hint when has review story', () => {
      const wrapper = mount_(makeThread({ reviewStories: [makeStory({ id: 0 })] }));
      expect(wrapper.find('[data-testid=thread-idle-0]').exists()).toBe(false);
    });

    test('Should hide idle hint when presence is off', () => {
      const wrapper = mount_(makeThread({ presence: 'off' }));
      expect(wrapper.find('[data-testid=thread-idle-0]').exists()).toBe(false);
    });
  });

  describe('Stories', () => {
    test('Should render in-progress story with correct testid', () => {
      const wrapper = mount_(makeThread({ inProgressStories: [makeStory({ id: 0 })] }));
      expect(wrapper.find('[data-testid=user-story-0-0]').exists()).toBe(true);
    });

    test('Should render review story with correct testid', () => {
      const wrapper = mount_(makeThread({ reviewStories: [makeStory({ id: 0 })] }));
      expect(wrapper.find('[data-testid=user-story-0-0]').exists()).toBe(true);
    });

    test('Should pass flashing=true for story in flashingStoryIds', () => {
      const wrapper = mount_(
        makeThread({ inProgressStories: [makeStory({ id: 0 })] }),
        new Set([0]),
      );
      expect(wrapper.find('[data-testid=user-story-0-0]').classes()).toContain('priority-flash');
    });

    test('Should pass flashing=false for story not in flashingStoryIds', () => {
      const wrapper = mount_(
        makeThread({ inProgressStories: [makeStory({ id: 0 })] }),
        new Set<number>(),
      );
      expect(wrapper.find('[data-testid=user-story-0-0]').classes()).not.toContain(
        'priority-flash',
      );
    });
  });
});
