import { createRouter, createWebHistory } from 'vue-router';
import Form from './form.vue';
import Simulation from './simulation/simulation.vue';

const routes = [
  { path: '/main.html', component: Form },
  { path: '/simulate', component: Simulation },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
