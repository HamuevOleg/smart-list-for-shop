<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="modal-backdrop" v-if="userStore.isProfileEditModalOpen" @click.self="userStore.closeProfileEdit">
        <div class="modal-content">
          <button class="btn-close" @click="userStore.closeProfileEdit">×</button>

          <h2>Edit Profile ✏️</h2>
          <p>Update your look and name</p>

          <form @submit.prevent="handleSave">

            <div class="avatar-section">
              <div class="avatar-preview-wrapper" @click="triggerFileInput">
                <img :src="previewImage" alt="Avatar Preview" class="avatar-preview-img" />
                <div class="avatar-overlay">
                  <span>📷 Change</span>
                </div>
              </div>

              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                class="hidden-input"
                @change="handleFileUpload"
              />
            </div>

            <div class="form-group">
              <label>Your Nickname:</label>
              <input
                type="text"
                v-model="username"
                class="form-input"
                placeholder="e.g. Alex"
                required
                maxlength="15"
              />
            </div>

            <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
              {{ isLoading ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>

          <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const fileInput = ref(null)
const username = ref('')
const customImageBase64 = ref(null)
const isLoading = ref(false)
const errorMsg = ref('')

// Инициализация при открытии
watch(() => userStore.isProfileEditModalOpen, (isOpen) => {
  if (isOpen) {
    username.value = userStore.user.username
    customImageBase64.value = null // Сбрасываем новое фото
    errorMsg.value = ''
  }
})

// Показываем: либо новое загруженное, либо текущее, либо дефолт
const previewImage = computed(() => {
  if (customImageBase64.value) return customImageBase64.value
  return userStore.user.avatar || '/default_avatar.png'
})

const triggerFileInput = () => fileInput.value.click()

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    alert('Image is too big (Max 2MB)')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => customImageBase64.value = e.target.result
  reader.readAsDataURL(file)
}

const handleSave = async () => {
  if (!username.value.trim()) return
  isLoading.value = true
  errorMsg.value = ''

  // Если фото не меняли, отправляем старое
  const finalAvatar = customImageBase64.value || userStore.user.avatar || '/default_avatar.png'

  try {
    await userStore.updateProfile(username.value, finalAvatar)
    userStore.closeProfileEdit()
  } catch (e) {
    errorMsg.value = "Failed to update profile."
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
  position: relative;
}

.btn-close {
  position: absolute; top: 1rem; right: 1rem;
  background: none; border: none; color: var(--text-light);
  font-size: 1.5rem; cursor: pointer;
}

h2 { color: #fff; margin-bottom: 0.5rem; }
p { color: var(--text-light); margin-bottom: 2rem; font-size: 0.9rem; }

.form-group { margin-bottom: 1.5rem; text-align: left; }
.form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-light); font-weight: 600; }

.form-input {
  width: 100%; padding: 1rem; border-radius: 12px;
  background: var(--bg-input); border: 1px solid var(--border-color);
  color: #fff; font-size: 1.1rem; text-align: center;
  box-sizing: border-box;
}

/* Avatar Styles */
.avatar-section {
  display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-bottom: 1.5rem;
}
.avatar-preview-wrapper {
  position: relative; width: 100px; height: 100px;
  border-radius: 50%; overflow: hidden;
  border: 3px solid var(--primary-color);
  cursor: pointer; transition: transform 0.2s;
  background: #000;
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

.btn-block { width: 100%; padding: 1rem; font-size: 1.1rem; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; background: var(--primary-color); color: #fff; }
.btn-block:disabled { opacity: 0.7; cursor: not-allowed; }

.error-text { color: #ef4444; margin-top: 1rem; font-size: 0.9rem; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
