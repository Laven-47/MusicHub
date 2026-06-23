import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home/index.vue') },
  { path: '/search', name: 'search', component: () => import('../views/Search/index.vue') },
  { path: '/song/:id', name: 'song-detail', component: () => import('../views/Detail/index.vue') },
  { path: '/favorite', name: 'favorite', component: () => import('../views/Favorite/index.vue') },
  { path: '/recommend', name: 'recommend', component: () => import('../views/Recommend/index.vue') },
  { path: '/player', name: 'player', component: () => import('../views/Player/index.vue') }
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})
