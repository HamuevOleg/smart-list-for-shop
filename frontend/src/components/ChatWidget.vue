<template>
  <div>
    <button
      class="mobile-chat-btn"
      @click="toggleChat"
      :class="{ hidden: isOpen }"
      v-if="isMobile"
    >
      <span class="icon">💬</span>
      <span class="badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
    </button>

    <div class="chat-widget" :class="{ open: isOpen, 'mobile-fullscreen': isMobile }">

      <div class="chat-header" @click="handleHeaderClick">
        <div class="header-title">
          <span>💬 List Chat</span>
          <span class="badge" v-if="!isOpen && !isMobile && unreadCount > 0">{{ unreadCount }}</span>
        </div>

        <button class="btn-toggle" @click.stop="toggleChat">
          {{ isMobile ? '✕' : (isOpen ? '▼' : '▲') }}
        </button>
      </div>

      <div class="chat-body" v-if="isOpen" ref="chatBodyRef">
        <div v-if="messages.length === 0" class="empty-chat">
          No messages yet. Say hi! 👋
        </div>

        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message"
          :class="{ 'my-message': isMe(msg.sender) }"
        >
          <div class="msg-avatar" v-if="!isMe(msg.sender)">
            <img v-if="isImage(msg.avatar)" :src="msg.avatar" class="img-ava" />
            <span v-else>{{ msg.avatar }}</span>
          </div>

          <div class="msg-content">
            <div class="msg-name" v-if="!isMe(msg.sender)">{{ msg.sender }}</div>
            <div class="msg-bubble">
              {{ msg.text }}
            </div>
            <div class="msg-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>
      </div>

      <form class="chat-footer" v-if="isOpen" @submit.prevent="send">
        <input
          v-model="newMessage"
          placeholder="Type a message..."
          class="chat-input"
          ref="inputRef"
        />
        <button type="submit" class="btn-send">➤</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useListStore } from '@/stores/listStore'
import { useUserStore } from '@/stores/userStore'

const store = useListStore()
const userStore = useUserStore()

const isOpen = ref(false)
const newMessage = ref('')
const chatBodyRef = ref(null)
const inputRef = ref(null)
const lastReadCount = ref(0)
// Состояние для определения мобилки через JS (для v-if)
const isMobile = ref(window.innerWidth <= 600)

const messages = computed(() => store.activeList?.messages || [])

const unreadCount = computed(() => {
  return Math.max(0, messages.value.length - lastReadCount.value)
})

const isMe = (sender) => sender === userStore.user.username
const isImage = (avatar) => avatar && (avatar.startsWith('http') || avatar.startsWith('data:image'))

// Следим за ресайзом окна
const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 600
}
onMounted(() => window.addEventListener('resize', updateIsMobile))
onUnmounted(() => window.removeEventListener('resize', updateIsMobile))

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    scrollToBottom()
    lastReadCount.value = messages.value.length
    // Фокус на поле ввода (удобно на десктопе, на мобилке может вызвать клавиатуру сразу)
    if (!isMobile.value) {
      setTimeout(() => inputRef.value?.focus(), 100)
    }
  }
}

// На десктопе клик по хедеру открывает/закрывает.
// На мобилке хедер только для закрытия через крестик или заголовок.
const handleHeaderClick = () => {
  if (!isMobile.value) {
    toggleChat()
  }
}

const send = async () => {
  if (!newMessage.value.trim()) return
  await store.sendMessage(newMessage.value)
  newMessage.value = ''
  scrollToBottom()
  // На мобилке оставляем фокус, чтобы писать дальше
  if (isMobile.value) {
    inputRef.value?.focus()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  }
}

watch(() => messages.value.length, (newLen) => {
  if (isOpen.value) {
    scrollToBottom()
    lastReadCount.value = newLen
  }
})

const formatTime = (ts) => {
  const date = new Date(Number(ts))
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
/* --- DESKTOP STYLES (Default) --- */
.chat-widget {
  position: fixed;
  bottom: 0;
  right: 20px;
  width: 320px;
  background: var(--card-color);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -5px 30px rgba(0,0,0,0.4);
  z-index: 200;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-bottom: none;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform: translateY(calc(100% - 50px)); /* Свернут */
}

.chat-widget.open {
  transform: translateY(0);
  height: 450px;
}

.chat-header {
  height: 50px;
  background: linear-gradient(90deg, var(--primary-color), #60a5fa);
  color: #fff;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 15px 15px 0 0;
  font-weight: 700;
  flex-shrink: 0;
}

.badge {
  background: #fff;
  color: var(--primary-color);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 800;
  margin-left: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.btn-toggle {
  background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer;
}

.chat-body {
  flex: 1;
  background: var(--bg-input);
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-chat {
  text-align: center; color: var(--text-light); margin-top: 2rem; font-style: italic; opacity: 0.7;
}

.message {
  display: flex;
  gap: 0.6rem;
  max-width: 85%;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.message.my-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 32px; height: 32px; flex-shrink: 0;
  background: var(--card-color);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
  border: 1px solid var(--border-color);
  overflow: hidden;
}
.img-ava { width: 100%; height: 100%; object-fit: cover; }

.msg-content { display: flex; flex-direction: column; }

.msg-name {
  font-size: 0.75rem; color: var(--text-light); margin-bottom: 3px; margin-left: 4px;
}
.my-message .msg-name { display: none; }

.msg-bubble {
  background: var(--card-color);
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  border-top-left-radius: 2px;
  font-size: 0.95rem;
  border: 1px solid var(--border-color);
  word-break: break-word;
  line-height: 1.4;
  color: #fff;
}

.my-message .msg-bubble {
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 12px;
  border-top-right-radius: 2px;
  box-shadow: 0 4px 10px rgba(255, 51, 102, 0.3);
}

.msg-time {
  font-size: 0.65rem; color: var(--text-light); margin-top: 3px; text-align: right; opacity: 0.6;
}

.chat-footer {
  padding: 0.8rem;
  background: var(--card-color);
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  padding: 0.7rem;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  color: #fff;
  outline: none;
  transition: border-color 0.2s;
}
.chat-input:focus { border-color: var(--primary-color); }

.btn-send {
  background: var(--primary-color);
  border: none;
  width: 40px; height: 40px;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  transition: transform 0.1s;
}

/* --- MOBILE STYLES --- */
@media (max-width: 600px) {
  /* 1. Кнопка FAB для открытия */
  .mobile-chat-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), #f43f5e);
    border: none;
    box-shadow: 0 4px 15px rgba(255, 51, 102, 0.4);
    z-index: 195; /* Чуть ниже самого чата */
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  .mobile-chat-btn:active { transform: scale(0.9); }
  .mobile-chat-btn.hidden {
    opacity: 0;
    pointer-events: none;
    transform: scale(0.5);
  }
  .mobile-chat-btn .icon { font-size: 1.8rem; }
  .mobile-chat-btn .badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #fff;
    color: var(--primary-color);
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 0.8rem;
    border: 2px solid var(--primary-color);
  }

  /* 2. Контейнер чата на мобильном */
  .chat-widget.mobile-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%; /* На весь экран */
    bottom: auto;
    right: auto;
    border-radius: 0;
    transform: translateY(100%); /* По умолчанию скрыт вниз */
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    z-index: 2000; /* Самый верхний слой */
  }

  .chat-widget.mobile-fullscreen.open {
    transform: translateY(0);
  }

  .chat-header {
    padding: 1rem;
    height: 60px; /* Чуть выше для пальца */
  }

  .btn-toggle {
    font-size: 1.5rem; /* Крестик покрупнее */
    padding: 10px;
  }

  /* 3. Увеличение шрифта для iOS (от 16px зум не срабатывает) */
  .chat-input {
    font-size: 16px;
    padding: 12px;
  }

  .msg-bubble {
    font-size: 16px; /* Текст сообщений тоже читабельнее */
  }

  /* Поднимаем футер, если клавиатура открывается (частично решает браузер, но margin не помешает) */
  .chat-footer {
    padding-bottom: max(0.8rem, env(safe-area-inset-bottom));
  }
}
</style>
