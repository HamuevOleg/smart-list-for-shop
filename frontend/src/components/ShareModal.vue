<template>
  <Transition name="modal-fade">
    <div class="modal-backdrop" v-if="store.isShareModalOpen" @click.self="close">
      <div class="modal-content">
        <button class="btn-close" @click="close">×</button>

        <div class="modal-header">
          <div class="icon-bg">🚀</div>
          <h2>Invite Friends</h2>
          <p>Shopping is better together! Send this link to collaborate in real-time.</p>
        </div>

        <div class="link-container">
          <div class="link-box">
            <span class="link-text">{{ shareLink }}</span>
          </div>
          <button
            class="btn-copy"
            @click="copyLink"
            :class="{ 'success': copied }"
            :title="copied ? 'Copied!' : 'Copy to clipboard'"
          >
            <span v-if="!copied">📋</span>
            <span v-else>✅</span>
          </button>
        </div>

        <div class="divider">
          <span>OR SHARE VIA</span>
        </div>

        <div class="social-grid">
          <a :href="telegramLink" target="_blank" class="social-btn telegram">
            <span class="social-icon">✈️</span>
            <span>Telegram</span>
          </a>
          <a :href="whatsappLink" target="_blank" class="social-btn whatsapp">
            <span class="social-icon">💬</span>
            <span>WhatsApp</span>
          </a>
        </div>

        <div class="success-message" :class="{ show: copied }">
          Link copied to clipboard! Ready to share.
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useListStore } from '@/stores/listStore'

const store = useListStore()
const copied = ref(false)

// Генерируем ссылки
const shareLink = computed(() => {
  if (!store.activeListId) return ''
  return `${window.location.origin}/list/${store.activeListId}`
})

const telegramLink = computed(() => {
  const text = encodeURIComponent(`Join my shopping list "${store.activeList?.name || 'SmartList'}"! 🛒`)
  return `https://t.me/share/url?url=${encodeURIComponent(shareLink.value)}&text=${text}`
})

const whatsappLink = computed(() => {
  const text = encodeURIComponent(`Join my shopping list: ${shareLink.value}`)
  return `https://wa.me/?text=${text}`
})

const close = () => {
  store.isShareModalOpen = false
  copied.value = false
}

// Улучшенная функция копирования (работает даже на HTTP)
const copyLink = async () => {
  if (!shareLink.value) return

  try {
    // 1. Пробуем современный API
    await navigator.clipboard.writeText(shareLink.value)
    triggerSuccess()
  } catch (err) {
    // 2. Fallback для старых браузеров или HTTP соединения
    try {
      const textArea = document.createElement("textarea")
      textArea.value = shareLink.value

      // Делаем элемент невидимым, но доступным для выделения
      textArea.style.position = "fixed"
      textArea.style.left = "-9999px"
      textArea.style.top = "0"
      document.body.appendChild(textArea)

      textArea.focus()
      textArea.select()

      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (successful) triggerSuccess()
      else throw new Error('Copy failed')
    } catch (fallbackErr) {
      alert('Could not copy link automatically. Please copy it manually.')
    }
  }
}

const triggerSuccess = () => {
  copied.value = true
  setTimeout(() => (copied.value = false), 2500)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-content {
  background: var(--card-color);
  padding: 2rem;
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  position: relative;
  text-align: center;
  border: 1px solid var(--border-color);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

/* Декоративная линия сверху */
.modal-content::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, var(--primary-color), #60a5fa);
}

.btn-close {
  position: absolute; top: 1rem; right: 1rem;
  background: rgba(255,255,255,0.05);
  border: none; width: 36px; height: 36px; border-radius: 50%;
  font-size: 1.5rem; cursor: pointer; color: var(--text-light);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  line-height: 1;
}
.btn-close:hover { background: rgba(255,255,255,0.15); color: #fff; transform: rotate(90deg); }

.modal-header { margin-bottom: 1.5rem; }
.icon-bg {
  font-size: 3rem; margin-bottom: 0.5rem;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

.modal-header h2 {
  margin: 0; font-size: 1.8rem;
  background: linear-gradient(135deg, #fff, var(--text-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.modal-header p {
  color: var(--text-light); font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.8;
}

/* Контейнер ссылки */
.link-container {
  display: flex; align-items: center; gap: 0.5rem;
  background: var(--bg-input);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.link-box {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-align: left;
  padding: 0 0.5rem;
  mask-image: linear-gradient(90deg, black 90%, transparent 100%);
}

.link-text {
  font-family: monospace;
  color: var(--primary-color);
  font-size: 0.95rem;
}

.btn-copy {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  border-radius: 8px;
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.2rem;
}
.btn-copy:hover { background: rgba(255,255,255,0.2); }
.btn-copy:active { transform: scale(0.95); }
.btn-copy.success { background: #10b981; border-color: #10b981; }

/* Разделитель */
.divider {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 1.5rem;
  color: var(--text-light);
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0.5;
}
.divider::before, .divider::after {
  content: ''; flex: 1; height: 1px; background: var(--border-color);
}

/* Социальные кнопки */
.social-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
}

.social-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.8rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s, opacity 0.2s;
  color: #fff;
}
.social-btn:hover { transform: translateY(-2px); opacity: 0.9; }

.telegram { background: linear-gradient(135deg, #229ED9, #1E88BD); }
.whatsapp { background: linear-gradient(135deg, #25D366, #128C7E); }

.social-icon { font-size: 1.2rem; }

/* Сообщение об успехе */
.success-message {
  margin-top: 1rem;
  color: #10b981;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  height: 0;
}
.success-message.show {
  opacity: 1;
  transform: translateY(0);
  height: auto;
}

/* Анимация модалки */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-content, .modal-fade-leave-to .modal-content {
  transform: scale(0.95);
}
.modal-content { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
</style>
