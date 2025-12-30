import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import Form from './form.vue';
import Resume from './resume/resume.vue';
import Reviewers from './reviewers/reviewers.vue';
import Team from './team/team.vue';
import TeamModificator from './team-modificator/team-modificator.vue';
import UserStories from './user-stories/user-stories.vue';

describe('Form', () => {
  const mockRouter = {
    push: vi.fn(),
  };
  const createWrapper = (): VueWrapper => {
    return shallowMount(Form, {
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });
  };

  test('Should have a main', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('main').isVisible()).toBe(true);
  });

  test('Should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  describe('Team', () => {
    test('Should render a Team', () => {
      const wrapper = createWrapper();
      const team = wrapper.getComponent(Team);
      expect(team.isVisible()).toBe(true);
    });

    test('Should render a navigation tab teams', () => {
      const wrapper = createWrapper();
      expect(wrapper.get('[data-testid=team-tab]').isVisible()).toBe(true);
    });

    test('Should have the navigation tab teams active by default', () => {
      const wrapper = createWrapper();
      const classes = wrapper.get('[data-testid=team-tab]').classes();
      expect(classes).toContain('active');
    });

    test('Should set the navigation tab teams active onclick', async () => {
      const wrapper = createWrapper();

      await wrapper.get('[data-testid=reviewers-tab]').trigger('click');
      await wrapper.get('[data-testid=team-tab]').trigger('click');

      const teamClasses = wrapper.get('[data-testid=team-tab]').classes();
      expect(teamClasses).toContain('active');
    });

    test('Should set the team page active on team tab click', async () => {
      const wrapper = createWrapper();
      await wrapper.get('[data-testid=reviewers-tab]').trigger('click');
      expect(
        wrapper.get('[data-testid=team-container]').classes(),
      ).not.toContain('active');

      await wrapper.get('[data-testid=team-tab]').trigger('click');
      expect(wrapper.get('[data-testid=team-container]').classes()).toContain(
        'active',
      );
    });
  });

  describe('Reviewers', () => {
    test('Should render a navigation tab reviewers', () => {
      const wrapper = createWrapper();
      expect(wrapper.get('[data-testid=reviewers-tab]').isVisible()).toBe(true);
    });

    test('Should set the navigation tab reviewers active onclick', async () => {
      const wrapper = createWrapper();

      const reviewers = wrapper.get('[data-testid=reviewers-tab]');
      await reviewers.trigger('click');
      expect(wrapper.get('[data-testid=reviewers-tab]').classes()).toContain(
        'active',
      );

      const teamClasses = wrapper.get('[data-testid=team-tab]').classes();
      expect(teamClasses).not.toContain('active');
    });

    test('Should set the reviewers page active on reviewers tab click', async () => {
      const wrapper = createWrapper();
      expect(
        wrapper.get('[data-testid=reviewers-container]').classes(),
      ).not.toContain('active');

      await wrapper.get('[data-testid=reviewers-tab]').trigger('click');
      expect(
        wrapper.get('[data-testid=reviewers-container]').classes(),
      ).toContain('active');
    });

    test('Should render a reviewers component', async () => {
      const wrapper = createWrapper();
      await wrapper.get('[data-testid=reviewers-tab]').trigger('click');
      expect(wrapper.getComponent(Reviewers).isVisible()).toBe(true);
    });
  });

  describe('Resume', () => {
    test('Should render a resume panel', () => {
      const wrapper = createWrapper();
      expect(wrapper.get('[data-testid=resume-panel]').isVisible()).toBe(true);
    });

    test('Should render a resume component', () => {
      const wrapper = createWrapper();
      expect(wrapper.findComponent(Resume).isVisible()).toBe(true);
    });
  });

  describe('Team modificator', () => {
    test('Should render a navigation team modificator tab', () => {
      const wrapper = createWrapper();
      expect(
        wrapper.get('[data-testid=team-modificator-tab]').isVisible(),
      ).toBe(true);
    });

    test('Should set the navigation tab team modificator active onclick', async () => {
      const wrapper = createWrapper();

      const teamModificator = wrapper.get('[data-testid=team-modificator-tab]');
      await teamModificator.trigger('click');
      expect(
        wrapper.get('[data-testid=team-modificator-tab]').classes(),
      ).toContain('active');

      const teamClasses = wrapper.get('[data-testid=team-tab]').classes();
      expect(teamClasses).not.toContain('active');
    });

    test('Should set the modificator team page active on modificator tab click', async () => {
      const wrapper = createWrapper();
      expect(
        wrapper.get('[data-testid=team-modificator-container]').classes(),
      ).not.toContain('active');

      await wrapper.get('[data-testid=team-modificator-tab]').trigger('click');
      expect(
        wrapper.get('[data-testid=team-modificator-container]').classes(),
      ).toContain('active');
    });

    test('Should render a team modificator component', async () => {
      const wrapper = createWrapper();
      await wrapper.get('[data-testid=team-modificator-tab]').trigger('click');
      expect(wrapper.getComponent(TeamModificator).isVisible()).toBe(true);
    });
  });

  describe('User Stories', () => {
    test('Should render a navigation user stories tab', () => {
      const wrapper = createWrapper();
      expect(wrapper.get('[data-testid=user-stories-tab]').isVisible()).toBe(
        true,
      );
    });

    test('Should set the navigation tab user stories active onclick', async () => {
      const wrapper = createWrapper();

      const userStories = wrapper.get('[data-testid=user-stories-tab]');
      await userStories.trigger('click');
      expect(wrapper.get('[data-testid=user-stories-tab]').classes()).toContain(
        'active',
      );

      const teamClasses = wrapper.get('[data-testid=team-tab]').classes();
      expect(teamClasses).not.toContain('active');
    });

    test('Should set the user stories page active on user stories tab click', async () => {
      const wrapper = createWrapper();
      expect(
        wrapper.get('[data-testid=user-stories-container]').classes(),
      ).not.toContain('active');

      await wrapper.get('[data-testid=user-stories-tab]').trigger('click');
      expect(
        wrapper.get('[data-testid=user-stories-container]').classes(),
      ).toContain('active');
    });

    test('Should render a user stories component', async () => {
      const wrapper = createWrapper();
      await wrapper.get('[data-testid=user-stories-tab]').trigger('click');
      expect(wrapper.getComponent(UserStories).isVisible()).toBe(true);
    });
  });

  test('Should display a launch button', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=launch-button]').text()).toBe('Launch');
  });

  test('Should redirect to simulation component on launch click', () => {
    const wrapper = createWrapper();
    const launchButton = wrapper.get('[data-testid=launch-button]');
    launchButton.trigger('click');

    expect(mockRouter.push).toHaveBeenCalledWith('/simulate');
  });
});
