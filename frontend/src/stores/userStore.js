import { ref } from 'vue'
import { defineStore } from 'pinia'
import { gplClient } from '@/api/gplClient'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    username: '',
    avatar: '/default_avatar.png',
    subscription: 'FREE' // Дефолт
  })
  const token = ref(localStorage.getItem('smartshop_token') || null)
  const isRegistered = ref(!!token.value)

  const isProfileEditModalOpen = ref(false)
  const openProfileEdit = () => { isProfileEditModalOpen.value = true }
  const closeProfileEdit = () => { isProfileEditModalOpen.value = false }

  const requestLoginCode = async (email) => {
    const query = `mutation($email: String!) { requestLoginCode(email: $email) }`
    const data = await gplClient(query, { email })
    return data.requestLoginCode
  }

  const loginWithCode = async (email, code) => {
    const query = `
      mutation($email: String!, $code: String!) {
        loginWithCode(email: $email, code: $code) {
          token
          user { id username email avatar subscription }
        }
      }
    `
    const data = await gplClient(query, { email, code })

    if (data.loginWithCode) {
      const { token: newToken, user: userData } = data.loginWithCode

      if (!userData.avatar) userData.avatar = '/default_avatar.png'
      if (!userData.subscription) userData.subscription = 'FREE'

      token.value = newToken
      user.value = userData

      localStorage.setItem('smartshop_token', newToken)
      localStorage.setItem('smartshop_user', JSON.stringify(userData))

      return true
    }
    return false
  }

  const updateProfile = async (username, avatar) => {
    const query = `
      mutation($username: String!, $avatar: String!) {
        updateUserProfile(username: $username, avatar: $avatar) {
          id username email avatar subscription
        }
      }
    `
    const data = await gplClient(query, { username, avatar })

    if (data.updateUserProfile) {
      user.value = { ...user.value, ...data.updateUserProfile }
      localStorage.setItem('smartshop_user', JSON.stringify(user.value))
      return true
    }
    return false
  }

  // === НОВОЕ: Обновление подписки ===
  const updateSubscription = async (plan) => {
    const query = `
      mutation($plan: String!) {
        updateUserSubscription(plan: $plan) {
          id subscription
        }
      }
    `
    try {
      const data = await gplClient(query, { plan })
      if (data.updateUserSubscription) {
        user.value.subscription = data.updateUserSubscription.subscription
        isRegistered.value = true // Здесь мы считаем, что процесс регистрации полностью завершен
        localStorage.setItem('smartshop_user', JSON.stringify(user.value))
        return true
      }
    } catch(e) {
      console.error(e)
      throw e
    }
    return false
  }

  const logout = () => {
    user.value = { username: '', avatar: '/default_avatar.png', subscription: 'FREE' }
    token.value = null
    isRegistered.value = false
    localStorage.removeItem('smartshop_token')
    localStorage.removeItem('smartshop_user')
  }

  const initUser = () => {
    const savedUser = localStorage.getItem('smartshop_user')
    if (savedUser && token.value) {
      try {
        const parsed = JSON.parse(savedUser)
        user.value = parsed
        if(!user.value.avatar) user.value.avatar = '/default_avatar.png'
        if(!user.value.subscription) user.value.subscription = 'FREE'
        isRegistered.value = true
      } catch(e) {
        logout()
      }
    }
  }

  initUser()

  return {
    user,
    isRegistered,
    isProfileEditModalOpen,
    openProfileEdit,
    closeProfileEdit,
    requestLoginCode,
    loginWithCode,
    updateProfile,
    updateSubscription, // экспортируем
    logout
  }
})
