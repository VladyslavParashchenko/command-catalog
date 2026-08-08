import { createRouter, createWebHistory } from 'vue-router';
import CommandPage from 'src/pages/CommandPage.vue';
import EmptyPage from 'src/pages/EmptyPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: EmptyPage },
    { path: '/:categoryId/:commandId', component: CommandPage },
    { path: '/:pathMatch(.*)*', component: EmptyPage },
  ],
});
