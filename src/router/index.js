import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/book/:id',
    name: 'BookDetail',
    component: () => import('@/pages/BookDetail.vue')
  },
  {
    path: '/read/:bookId/:chapterId',
    name: 'Read',
    component: () => import('@/pages/Read.vue')
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: () => import('@/pages/Category.vue')
  },
  {
    path: '/rank',
    name: 'Rank',
    component: () => import('@/pages/Rank.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/pages/Search.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/pages/History.vue')
  },
  {
    path: '/admin/failures',
    name: 'Failures',
    component: () => import('@/pages/Failures.vue')
  },
  {
    path: '/admin/datasource',
    name: 'Datasource',
    component: () => import('@/pages/Datasource.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
