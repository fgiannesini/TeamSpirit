import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import type { UserStoryVue } from './thread.ts';
import KanbanColumn from './kanban-column.vue';
import StoryCard from './story-card.vue';

const makeStory = (id: number, priority: number | null = null): UserStoryVue => ({
  id,
  name: `US${id}`,
  priority,
});

const defaultProps = {
  title: 'Backlog',
  icon: 'inbox',
  stories: [] as UserStoryVue[],
  flashingStoryIds: new Set<number>(),
  variant: 'default' as const,
  countTestId: 'backlog-count',
  emptyTestId: 'backlog-empty',
  emptyIcon: 'inbox',
  emptyText: 'Backlog is empty',
};

describe('KanbanColumn', () => {
  describe('Structure', () => {
    test('Should render as article', () => {
      const wrapper = mount(KanbanColumn, { props: defaultProps });
      expect(wrapper.element.tagName).toBe('ARTICLE');
    });

    test('Should render title in h6', () => {
      const wrapper = mount(KanbanColumn, { props: { ...defaultProps, title: 'Done' } });
      expect(wrapper.find('h6').text()).toBe('Done');
    });

    test('Should render icon with aria-hidden', () => {
      const wrapper = mount(KanbanColumn, { props: { ...defaultProps, icon: 'task_alt' } });
      const icon = wrapper.find('nav > i');
      expect(icon.text()).toBe('task_alt');
      expect(icon.attributes('aria-hidden')).toBe('true');
    });

    test('Should set aria-label on count from title', () => {
      const wrapper = mount(KanbanColumn, { props: { ...defaultProps, title: 'Done' } });
      expect(wrapper.get('[data-testid=backlog-count]').attributes('aria-label')).toBe(
        'Done story count',
      );
    });
  });

  describe('Count label', () => {
    test('Should show "0 story" when stories is empty', () => {
      const wrapper = mount(KanbanColumn, { props: defaultProps });
      expect(wrapper.get('[data-testid=backlog-count]').text()).toEqual('0 story');
    });

    test('Should show "1 story" when stories has one element', () => {
      const wrapper = mount(KanbanColumn, {
        props: { ...defaultProps, stories: [makeStory(0)] },
      });
      expect(wrapper.get('[data-testid=backlog-count]').text()).toEqual('1 story');
    });

    test('Should show "2 stories" when stories has two elements', () => {
      const wrapper = mount(KanbanColumn, {
        props: { ...defaultProps, stories: [makeStory(0), makeStory(1)] },
      });
      expect(wrapper.get('[data-testid=backlog-count]').text()).toEqual('2 stories');
    });
  });

  describe('Empty state', () => {
    test('Should show empty state when stories is empty', () => {
      const wrapper = mount(KanbanColumn, { props: defaultProps });
      expect(wrapper.find('[data-testid=backlog-empty]').exists()).toBe(true);
    });

    test('Should hide empty state when stories has elements', () => {
      const wrapper = mount(KanbanColumn, {
        props: { ...defaultProps, stories: [makeStory(0)] },
      });
      expect(wrapper.find('[data-testid=backlog-empty]').exists()).toBe(false);
    });

    test('Should render emptyIcon in empty state', () => {
      const wrapper = mount(KanbanColumn, {
        props: { ...defaultProps, emptyIcon: 'hourglass_empty' },
      });
      expect(wrapper.get('[data-testid=backlog-empty]').find('i').text()).toBe('hourglass_empty');
    });

    test('Should render emptyText in empty state', () => {
      const wrapper = mount(KanbanColumn, {
        props: { ...defaultProps, emptyText: 'No story completed yet' },
      });
      expect(wrapper.get('[data-testid=backlog-empty]').find('p').text()).toBe(
        'No story completed yet',
      );
    });

    test('Should use emptyTestId for empty state element', () => {
      const wrapper = mount(KanbanColumn, {
        props: { ...defaultProps, emptyTestId: 'done-empty' },
      });
      expect(wrapper.find('[data-testid=done-empty]').exists()).toBe(true);
    });
  });

  describe('Stories list', () => {
    test('Should render a StoryCard per story', () => {
      const wrapper = mount(KanbanColumn, {
        props: { ...defaultProps, stories: [makeStory(0), makeStory(1)] },
      });
      expect(wrapper.findAllComponents(StoryCard)).toHaveLength(2);
    });

    test('Should pass variant prop to each StoryCard', () => {
      const wrapper = mount(KanbanColumn, {
        props: { ...defaultProps, stories: [makeStory(0)], variant: 'done' },
      });
      expect(wrapper.findComponent(StoryCard).props('variant')).toBe('done');
    });

    test('Should pass flashing=true to StoryCard when id is in flashingStoryIds', () => {
      const wrapper = mount(KanbanColumn, {
        props: {
          ...defaultProps,
          stories: [makeStory(0)],
          flashingStoryIds: new Set([0]),
        },
      });
      expect(wrapper.findComponent(StoryCard).props('flashing')).toBe(true);
    });

    test('Should pass flashing=false to StoryCard when id is not in flashingStoryIds', () => {
      const wrapper = mount(KanbanColumn, {
        props: {
          ...defaultProps,
          stories: [makeStory(0)],
          flashingStoryIds: new Set<number>(),
        },
      });
      expect(wrapper.findComponent(StoryCard).props('flashing')).toBe(false);
    });
  });
});
