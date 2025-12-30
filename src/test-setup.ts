import {config} from '@vue/test-utils';
import {type ConcreteComponent, defineComponent} from 'vue';
import Selector from './front/shared/selector.vue';

const createSelectorStub = (): ReturnType<typeof defineComponent> => {
  return defineComponent({
    name: Selector.name,
    props: (Selector as ConcreteComponent).props,
    template: '<slot/>',
  });
};

config.global.stubs = {
  selector: createSelectorStub(),
};
