// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useListStore } from '@/stores/listStore'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingPage.vue')
    },
    {
      path: '/dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard-home',
          component: () => import('@/views/dashboard/HomeView.vue')
        },
        {
          path: 'activity',
          name: 'dashboard-activity',
          component: () => import('@/views/dashboard/ActivityView.vue')
        },
        {
          path: 'premium',
          name: 'dashboard-premium',
          component: () => import('@/views/dashboard/PremiumView.vue')
        },
        {
          path: 'settings',
          name: 'dashboard-settings',
          component: () => import('@/views/dashboard/SettingsView.vue')
        }
      ]
    },
    {
      path: '/list/:id',
      name: 'list',
      component: () => import('@/components/ShoppingList.vue'),
      meta: { requiresAuth: true },
      beforeEnter: async (to, from, next) => {
        const store = useListStore()
        await store.fetchListById(to.params.id)
        if (store.activeListId) {
          next()
        } else {
          next('/dashboard')
        }
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isRegistered) {
    next('/')
  } else if (to.name === 'landing' && userStore.isRegistered) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
