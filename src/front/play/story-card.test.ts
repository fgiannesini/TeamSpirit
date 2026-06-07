import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import PriorityBadge from './priority-badge.vue';
import StoryCard from './story-card.vue';

const makeStory = (overrides: { id?: number; name?: string; priority?: number | null } = {}) => ({
  id: 0,
  name: 'US0',
  priority: null as number | null,
  ...overrides,
});

describe('StoryCard', () => {
  describe('Base', () => {
    test('Should have story-card class', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory(), flashing: false, variant: 'default' },
      });
      expect(wrapper.classes()).toContain('story-card');
    });

    test('Should render story name', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory({ name: 'My Story' }), flashing: false, variant: 'default' },
      });
      expect(wrapper.get('[data-testid=story-name]').text()).toBe('My Story');
    });

    test('Should surface story id as title on story-name', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory({ id: 5 }), flashing: false, variant: 'default' },
      });
      expect(wrapper.get('[data-testid=story-name]').attributes('title')).toBe('#5');
    });
  });

  describe('State icon', () => {
    test('Should not render state icon for default variant', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory(), flashing: false, variant: 'default' },
      });
      expect(wrapper.find('[data-testid=story-state-icon]').exists()).toBe(false);
    });

    test('Should render code icon for in-progress variant', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory(), flashing: false, variant: 'in-progress' },
      });
      expect(wrapper.get('[data-testid=story-state-icon]').text()).toBe('code');
    });

    test('Should render rate_review icon for review variant', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory(), flashing: false, variant: 'review' },
      });
      expect(wrapper.get('[data-testid=story-state-icon]').text()).toBe('rate_review');
    });

    test('Should render check_circle icon for done variant', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory(), flashing: false, variant: 'done' },
      });
      expect(wrapper.get('[data-testid=story-state-icon]').text()).toBe('check_circle');
    });
  });

  describe('Variant classes', () => {
    test('Should have story-card--review class for review variant', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory(), flashing: false, variant: 'review' },
      });
      expect(wrapper.classes()).toContain('story-card--review');
    });

    test('Should have story-card--done and primary-container for done variant', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory(), flashing: false, variant: 'done' },
      });
      expect(wrapper.classes()).toContain('story-card--done');
      expect(wrapper.classes()).toContain('primary-container');
    });

    test('Should not have story-card--review for default variant', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory(), flashing: false, variant: 'default' },
      });
      expect(wrapper.classes()).not.toContain('story-card--review');
    });

    test('Should not have story-card--done for default variant', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory(), flashing: false, variant: 'default' },
      });
      expect(wrapper.classes()).not.toContain('story-card--done');
    });
  });

  describe('Priority flash', () => {
    test('Should add priority-flash class when flashing', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory(), flashing: true, variant: 'default' },
      });
      expect(wrapper.classes()).toContain('priority-flash');
    });

    test('Should not add priority-flash class when not flashing', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory(), flashing: false, variant: 'default' },
      });
      expect(wrapper.classes()).not.toContain('priority-flash');
    });
  });

  describe('Priority badge', () => {
    test('Should render PriorityBadge with correct priority', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory({ priority: 3 }), flashing: false, variant: 'default' },
      });
      expect(wrapper.findComponent(PriorityBadge).props('priority')).toBe(3);
    });

    test('Should not render PriorityBadge when story has no priority', () => {
      const wrapper = mount(StoryCard, {
        props: { story: makeStory({ priority: null }), flashing: false, variant: 'default' },
      });
      expect(wrapper.findComponent(PriorityBadge).exists()).toBe(false);
    });
  });
});
