import {createRouter, createWebHistory} from 'vue-router';
import Form from './form.vue';
import Play from './play.vue';
import Simulation from './simulation/simulation.vue';

export const routes = [
  { path: '/main', component: Form },
  { path: '/simulate', component: Simulation },
  { path: '/play', component: Play },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
