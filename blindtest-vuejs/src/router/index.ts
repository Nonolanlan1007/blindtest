import {createRouter, createWebHistory} from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import ('../views/HomeView.vue')
  },
  {
    path: '/:catchAll(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  },
  {
    path: '/game/:id',
    name: 'GameBoard',
    component: () => import('../views/GameBoard.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
