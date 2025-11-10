import { shallowMount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Form from './form.vue';
import Resume from './resume/resume.vue';
import Team from './team/team.vue';

describe('Form', () => {
  const createWrapper = (): VueWrapper => {
    return shallowMount(Form);
  };

  test('Should have a main', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('main').isVisible()).toBe(true);
  });

  test('Should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('Should render a Team', () => {
    const wrapper = createWrapper();
    const team = wrapper.getComponent(Team);
    expect(team.isVisible()).toBe(true);
  });

  test('Should render a navigation tab teams', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=team-tab]').isVisible()).toBe(true);
  });

  test('Should render a navigation tab reviewers', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=reviewers-tab]').isVisible()).toBe(true);
  });

  test('Should have the navigation tab teams active by default', () => {
    const wrapper = createWrapper();
    const classes = wrapper.get('[data-testid=team-tab]').classes();
    expect(classes).toContain('active');
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

  test('Should set the navigation tab teams active onclick', async () => {
    const wrapper = createWrapper();

    await wrapper.get('[data-testid=reviewers-tab]').trigger('click');
    await wrapper.get('[data-testid=team-tab]').trigger('click');

    const teamClasses = wrapper.get('[data-testid=team-tab]').classes();
    expect(teamClasses).toContain('active');
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

  test('Should set the team page active on team tab click', async () => {
    const wrapper = createWrapper();
    await wrapper.get('[data-testid=reviewers-tab]').trigger('click');
    expect(wrapper.get('[data-testid=team-container]').classes()).not.toContain(
      'active',
    );

    await wrapper.get('[data-testid=team-tab]').trigger('click');
    expect(wrapper.get('[data-testid=team-container]').classes()).toContain(
      'active',
    );
  });

  test('Should render a resume panel', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=resume-panel]').isVisible()).toBe(true);
  });

  test('Should render a resume component', () => {
    const wrapper = createWrapper();
    expect(wrapper.getComponent(Resume).isVisible()).toBe(true);
  });

  test('Should render a navigation team modificator tab', () => {
    const wrapper = createWrapper();
    expect(wrapper.get('[data-testid=team-modificator-tab]').isVisible()).toBe(
      true,
    );
  });
});
