<template>
  <Transition name="modal-fade">
    <div class="modal-backdrop" v-if="!userStore.isRegistered || step >= 3">
      <div class="modal-content" :class="{ 'wide-content': step === 4 }">

        <div v-if="step === 1" class="step-container">
          <h2>Welcome Back! 👋</h2>
          <p>Enter your email to login or register.</p>
          <form @submit.prevent="handleRequestCode">
            <input type="email" v-model="email" class="form-input" placeholder="name@example.com" required autofocus />
            <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
              {{ isLoading ? 'Sending...' : 'Send Magic Code 🪄' }}
            </button>
          </form>
        </div>

        <div v-else-if="step === 2" class="step-container">
          <h2>Check your Inbox 📩</h2>
          <p>We sent a code to <strong>{{ email }}</strong></p>
          <form @submit.prevent="handleLogin">
            <input type="text" v-model="code" class="form-input code-input" placeholder="123456" maxlength="6" required />
            <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
              {{ isLoading ? 'Verifying...' : 'Login 🚀' }}
            </button>
            <button type="button" class="btn-link" @click="step = 1">Wrong email?</button>
          </form>
        </div>

        <div v-else-if="step === 3" class="step-container">
          <h2>Who are you? 🤔</h2>
          <p>Set up your profile to join the list.</p>
          <form @submit.prevent="handleProfileUpdate">
            <div class="avatar-section">
              <div class="avatar-preview-wrapper" @click="triggerFileInput">
                <img :src="previewImage" alt="Avatar Preview" class="avatar-preview-img" />
                <div class="avatar-overlay"><span>📷 Upload</span></div>
              </div>
              <input type="file" ref="fileInput" accept="image/*" class="hidden-input" @change="handleFileUpload" />
            </div>
            <div class="form-group">
              <label>Your Nickname</label>
              <input type="text" v-model="username" class="form-input" placeholder="e.g. Alex" required maxlength="15" />
            </div>
            <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
              {{ isLoading ? 'Saving...' : 'Next Step →' }}
            </button>
          </form>
        </div>

        <div v-else-if="step === 4" class="step-container plans-container">
          <h2>Choose Your Plan 💎</h2>
          <p>Select the plan that fits your needs.</p>

          <div class="plans-grid">

            <div class="plan-card" :class="{ selected: selectedPlan === 'FREE' }" @click="selectedPlan = 'FREE'">
              <div class="plan-header">
                <h3>Free</h3>
                <span class="price">$0</span>
              </div>
              <ul class="plan-features">
                <li>📦 Max 3 Lists</li>
                <li>👥 Max 2 Members/List</li>
                <li>🤖 Basic AI</li>
              </ul>
              <div class="check-mark" v-if="selectedPlan === 'FREE'">✓</div>
            </div>

            <div class="plan-card pro" :class="{ selected: selectedPlan === 'PRO' }" @click="selectedPlan = 'PRO'">
              <div class="popular-badge">Popular</div>
              <div class="plan-header">
                <h3>Pro</h3>
                <span class="price">$4.99</span>
              </div>
              <ul class="plan-features">
                <li>🚀 Max 10 Lists</li>
                <li>👨‍👩‍👧‍👦 Max 5 Members/List</li>
                <li>✨ Advanced AI & Stats</li>
              </ul>
              <div class="check-mark" v-if="selectedPlan === 'PRO'">✓</div>
            </div>

            <div class="plan-card family" :class="{ selected: selectedPlan === 'FAMILY' }" @click="selectedPlan = 'FAMILY'">
              <div class="plan-header">
                <h3>Family</h3>
                <span class="price">$9.99</span>
              </div>
              <ul class="plan-features">
                <li>🏰 Max 25 Lists</li>
                <li>🚌 Max 10 Members/List</li>
                <li>👑 Priority Support</li>
              </ul>
              <div class="check-mark" v-if="selectedPlan === 'FAMILY'">✓</div>
            </div>

          </div>

          <button class="btn btn-primary btn-block mt-4" :disabled="isLoading" @click="handleSubscriptionSelect">
            {{ isLoading ? 'Processing...' : 'Start Using App 🚀' }}
          </button>
        </div>

        <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const step = ref(1)
const email = ref('')
const code = ref('')
const username = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const selectedPlan = ref('FREE') // Default

// Фото
const fileInput = ref(null)
const customImageBase64 = ref(null)
const defaultAvatarPath = '/default_avatar.png'

const previewImage = computed(() => {
  return customImageBase64.value || defaultAvatarPath
})

const handleRequestCode = async () => {
  isLoading.value = true; errorMsg.value = ''
  try {
    await userStore.requestLoginCode(email.value)
    step.value = 2
  } catch (e) {
    errorMsg.value = "Failed to send code."
  } finally { isLoading.value = false }
}

const handleLogin = async () => {
  isLoading.value = true; errorMsg.value = ''
  try {
    const success = await userStore.loginWithCode(email.value, code.value)
    if (success) {
      const currentUser = userStore.user
      const defaultName = email.value.split('@')[0]
      if (currentUser.username && currentUser.username !== defaultName) {
        // Если юзер уже настроен, проверяем подписку?
        // Или считаем что всё ок.
        // Давай пока всегда предлагать подписку при входе, если она FREE?
        // Или просто пускать.
        userStore.isRegistered = true
      } else {
        username.value = defaultName
        step.value = 3
      }
    }
  } catch (e) {
    errorMsg.value = "Invalid code."
  } finally { isLoading.value = false }
}

const triggerFileInput = () => fileInput.value.click()

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => customImageBase64.value = e.target.result
  reader.readAsDataURL(file)
}

const handleProfileUpdate = async () => {
  if (!username.value.trim()) return
  isLoading.value = true
  const finalAvatar = customImageBase64.value || defaultAvatarPath
  try {
    await userStore.updateProfile(username.value, finalAvatar)
    step.value = 4 // Переход к выбору подписки
  } catch (e) {
    errorMsg.value = "Failed to update profile."
  } finally { isLoading.value = false }
}

const handleSubscriptionSelect = async () => {
  isLoading.value = true
  try {
    await userStore.updateSubscription(selectedPlan.value)
    // isRegistered станет true внутри updateSubscription
    router.push('/dashboard')
  } catch (e) {
    errorMsg.value = "Failed to update subscription."
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px); z-index: 2000;
  display: flex; justify-content: center; align-items: center;
}

.modal-content {
  background: var(--card-color); padding: 2.5rem;
  border-radius: 24px; width: 90%; max-width: 400px;
  text-align: center; border: 1px solid var(--primary-color);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  transition: max-width 0.3s ease;
}

.wide-content {
  max-width: 800px; /* Шире для карточек тарифов */
}

h2 { color: #fff; margin-bottom: 0.5rem; }
p { color: var(--text-light); margin-bottom: 2rem; }

.form-group { margin-bottom: 1.5rem; text-align: left; }
.form-input {
  width: 100%; padding: 1rem; border-radius: 12px;
  background: var(--bg-input); border: 1px solid var(--border-color);
  color: #fff; font-size: 1.1rem; text-align: center;
  box-sizing: border-box;
}
.code-input { letter-spacing: 5px; font-weight: bold; font-size: 1.5rem; }

/* Avatar */
.avatar-section { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.avatar-preview-wrapper {
  position: relative; width: 100px; height: 100px;
  border-radius: 50%; overflow: hidden; border: 3px solid var(--primary-color);
  cursor: pointer; transition: transform 0.2s; background: #000;
}
.avatar-preview-wrapper:hover { transform: scale(1.05); }
.avatar-preview-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
}
.avatar-preview-wrapper:hover .avatar-overlay { opacity: 1; }
.avatar-overlay span { color: #fff; font-size: 0.8rem; font-weight: 600; }
.hidden-input { display: none; }

/* PLANS GRID */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.plan-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  text-align: left;
}

.plan-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.08); }
.plan-card.selected { border-color: var(--primary-color); background: rgba(236, 72, 153, 0.1); }

.plan-header h3 { font-size: 1.2rem; margin: 0; color: #fff; }
.plan-header .price { font-size: 1.5rem; font-weight: 700; color: #fff; display: block; margin: 0.5rem 0; }

.plan-features { list-style: none; padding: 0; margin: 0; }
.plan-features li { font-size: 0.85rem; color: var(--text-light); margin-bottom: 0.5rem; }

.check-mark {
  position: absolute; top: 10px; right: 10px;
  width: 24px; height: 24px; background: var(--primary-color);
  border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center;
  font-weight: bold;
}

.pro .popular-badge {
  position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
}

.mt-4 { margin-top: 1.5rem; }

.btn-block { width: 100%; padding: 1rem; font-size: 1.1rem; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; background: var(--primary-color); color: #fff; }
.btn-block:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-link { background: none; border: none; color: var(--text-light); margin-top: 1rem; cursor: pointer; text-decoration: underline; }
.error-text { color: #ef4444; margin-top: 1rem; font-size: 0.9rem; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .plans-grid { grid-template-columns: 1fr; }
}
</style>
