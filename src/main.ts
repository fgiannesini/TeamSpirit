import 'beercss';
import 'material-dynamic-colors';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './front/App.vue';
import { router } from './front/router.ts';

const elementApp = createApp(App);
elementApp.use(createPinia());
elementApp.use(router);
elementApp.mount('#app');
