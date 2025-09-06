import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Form from './form.vue';

describe('Form', () => {
  test('Should render a form', () => {
    const wrapper = mount(Form);
    expect(wrapper.exists()).toBe(true);
  });
});
