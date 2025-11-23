// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useListStore } from '@/stores/listStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../components/ListSelector.vue') // Ленивая загрузка
    },
    {
      path: '/list/:id',
      name: 'list',
      component: () => import('../components/ShoppingList.vue'),
      beforeEnter: async (to, from, next) => {
        // Хук: перед входом в маршрут загружаем список
        const store = useListStore()
        const listId = to.params.id

        // Пытаемся загрузить список по ID
        await store.fetchListById(listId)

        if (store.activeListId) {
          next()
        } else {
          // Если список не найден - на главную
          next('/')
        }
      }
    }
  ]
})

export default router
