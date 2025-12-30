import { createRouter, createWebHistory } from 'vue-router';
import Form from './form.vue';

const routes = [{ path: '/main.html', component: Form }];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
