import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // Пытаемся достать данные из localStorage при запуске
  const savedUser = JSON.parse(localStorage.getItem('smartshop_user') || 'null')

  const user = ref(savedUser || {
    username: '',
    avatar: '👤' // Дефолтная аватарка
  })

  // Если данные есть, считаем что юзер зарегистрирован
  const isRegistered = ref(!!savedUser)

  const setUser = (username, avatar) => {
    user.value = { username, avatar }
    isRegistered.value = true
    localStorage.setItem('smartshop_user', JSON.stringify(user.value))
  }

  const logout = () => {
    user.value = { username: '', avatar: '👤' }
    isRegistered.value = false
    localStorage.removeItem('smartshop_user')
  }

  return {
    user,
    isRegistered,
    setUser,
    logout
  }
})
