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
      name: 'home',
      component: () => import('@/views/DashboardView.vue'), // Используем DashboardView
      meta: { requiresAuth: true }
    },
    {
      path: '/list/:id',
      name: 'list',
      component: () => import('@/components/ShoppingList.vue'), // Или DashboardView, если список внутри него
      // В твоей структуре список рендерится внутри App.vue/RouterView?
      // Если ты хочешь открывать конкретный список, но оставаться в лейауте...
      // Давай оставим как было, но проверим DashboardView.
      // В DashboardView список открывается через router.push(`/list/${listId}`)
      // Значит этот роут нужен.
      // Обычно список это вложенный компонент или отдельная страница.
      // В твоем App.vue структура сложная (фон + сайдбары).
      // Если ShoppingList.vue это просто компонент списка, то ОК.
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
  }

  else if (to.name === 'landing' && userStore.isRegistered) {
    next('/dashboard')
  }
  else {
    next()
  }
})

export default router
