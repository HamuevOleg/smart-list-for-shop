// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useListStore } from '@/stores/listStore'
import { useUserStore } from '@/stores/userStore' // Импорт стора юзера

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingPage.vue') // Ленивая загрузка
    },
    {
      path: '/dashboard',
      name: 'home', // Старое имя 'home' теперь здесь
      component: () => import('@/components/ListSelector.vue'),
      meta: { requiresAuth: true } // Помечаем, что нужна регистрация
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
          next('/dashboard') // Если списка нет, кидаем в дешборд
        }
      }
    }
  ]
})

// Глобальная защита маршрутов
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 1. Если маршрут требует регистрации, а юзера нет -> на Лэндинг
  if (to.meta.requiresAuth && !userStore.isRegistered) {
    next('/')
  }
  // 2. Если юзер уже есть и он пытается зайти на Лэндинг -> в Дэшборд
  else if (to.name === 'landing' && userStore.isRegistered) {
    next('/dashboard')
  }
  // 3. Иначе пускаем куда шел
  else {
    next()
  }
})

export default router
