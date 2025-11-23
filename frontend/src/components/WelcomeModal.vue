<template>
  <Transition name="modal-fade">
    <div class="modal-backdrop" v-if="!userStore.isRegistered">
      <div class="modal-content">
        <h2>Welcome to SmartList! 👋</h2>
        <p>Please introduce yourself to join the list.</p>

        <form @submit.prevent="saveUser" class="welcome-form">
          <div class="avatar-section">
            <label>Choose your avatar:</label>

            <div class="emoji-grid">
              <button
                v-for="emoji in emojis"
                :key="emoji"
                type="button"
                class="emoji-btn"
                :class="{ active: selectedAvatar === emoji }"
                @click="pickEmoji(emoji)"
              >
                {{ emoji }}
              </button>
            </div>

            <div class="divider">OR</div>

            <div class="upload-wrapper">
              <button type="button" class="btn btn-secondary btn-upload" @click="triggerFileInput">
                <span v-if="customImage">📸 Photo Selected!</span>
                <span v-else>Upload Photo 🖼️</span>
              </button>
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                class="hidden-input"
                @change="handleFileUpload"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="username">Your Nickname:</label>
            <input
              type="text"
              id="username"
              v-model="username"
              class="form-input"
              placeholder="e.g. Alex"
              required
              maxlength="15"
              autocomplete="off"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block">Let's go! 🚀</button>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const username = ref('')
const selectedAvatar = ref('👽')
const customImage = ref(null) // Здесь будет Base64 строки
const fileInput = ref(null)

const emojis = ['👽', '🤠', '👻', '🤖', '🦊', '🦄', '🐱', '🐶']

const pickEmoji = (emoji) => {
  selectedAvatar.value = emoji
  customImage.value = null // Сбрасываем фото если выбрали эмодзи
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Ограничение размера (например, 2МБ), чтобы не забить localStorage
  if (file.size > 2 * 1024 * 1024) {
    alert('File is too big! Max 2MB.')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    customImage.value = e.target.result // Это Base64 строка
    selectedAvatar.value = null // Сбрасываем эмодзи
  }
  reader.readAsDataURL(file)
}

const saveUser = () => {
  if (!username.value.trim()) return

  // Если есть фото, используем его, иначе эмодзи
  const finalAvatar = customImage.value || selectedAvatar.value

  userStore.setUser(username.value.trim(), finalAvatar)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: var(--card-color);
  padding: 2rem;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 400px;
  text-align: center;
  border: 1px solid var(--primary-color);
  box-shadow: 0 0 40px rgba(255, 51, 102, 0.3);
}

h2 { color: var(--primary-color); margin-top: 0; margin-bottom: 0.5rem; }
p { color: var(--text-light); margin-bottom: 1.5rem; }

.avatar-section {
  margin-bottom: 1.5rem;
  text-align: left;
}
.avatar-section label, .form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-light);
  font-weight: 600;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.emoji-btn {
  font-size: 1.5rem;
  background: var(--bg-input);
  border: 2px solid transparent;
  border-radius: 12px;
  width: 100%;
  aspect-ratio: 1;
  cursor: pointer;
  transition: all 0.2s;
}
.emoji-btn:hover { background: #334155; transform: scale(1.1); }
.emoji-btn.active {
  border-color: var(--primary-color);
  background: rgba(255, 51, 102, 0.15);
  transform: scale(1.1);
}

.divider {
  text-align: center;
  margin: 1rem 0;
  font-size: 0.8rem;
  color: var(--text-light);
  position: relative;
}
.divider::before, .divider::after {
  content: ''; position: absolute; top: 50%; width: 40%; height: 1px; background: var(--border-color);
}
.divider::before { left: 0; }
.divider::after { right: 0; }

.upload-wrapper {
  display: flex;
  justify-content: center;
}
.btn-upload {
  width: 100%;
  padding: 0.75rem;
  border: 1px dashed var(--text-light);
}
.hidden-input { display: none; }

.form-group { text-align: left; margin-bottom: 2rem; }
.btn-block { width: 100%; font-size: 1.1rem; padding: 1rem; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
