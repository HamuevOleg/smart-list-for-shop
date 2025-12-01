<template>
  <Transition name="slide-chat">
    <div class="chat-sidebar" v-if="store.isChatOpen">
      <div class="chat-header">
        <div class="header-title">
          <span>💬 List Chat</span>
          <span class="badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
        </div>
        <button class="btn-close" @click="store.closeChat">×</button>
      </div>

      <div class="chat-body" ref="chatBodyRef" @click="showEmojiPicker = false">
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

      <form class="chat-footer" @submit.prevent="send">

        <Transition name="pop-up">
          <div class="emoji-wrapper" v-if="showEmojiPicker && !isMobile">
            <div class="emoji-picker-content">
              <div class="emoji-grid">
                <button
                  v-for="emoji in emojis"
                  :key="emoji"
                  type="button"
                  class="emoji-item"
                  @click="addEmoji(emoji)"
                >
                  {{ emoji }}
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <button
          v-if="!isMobile"
          type="button"
          class="btn-icon emoji-toggle"
          @click="showEmojiPicker = !showEmojiPicker"
          :class="{ active: showEmojiPicker }"
        >
          😊
        </button>

        <input
          v-model="newMessage"
          placeholder="Type a message..."
          class="chat-input"
          ref="inputRef"
          @focus="showEmojiPicker = false"
        />
        <button type="submit" class="btn-send">➤</button>
      </form>
    </div>
  </Transition>

  <div class="chat-backdrop" v-if="store.isChatOpen" @click="store.closeChat"></div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useListStore } from '@/stores/listStore'
import { useUserStore } from '@/stores/userStore'

const store = useListStore()
const userStore = useUserStore()

const newMessage = ref('')
const chatBodyRef = ref(null)
const inputRef = ref(null)
const lastReadCount = ref(0)
const showEmojiPicker = ref(false)
const isMobile = ref(window.innerWidth <= 600)

const emojis = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','🥲','☺️','😊','😇','🙂','🙃','😉',
  '😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓',
  '😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫',
  '😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰',
  '😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧',
  '😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕',
  '🤑','🤠','😈','👿','👹','👺','🤡','💩','👻','💀','☠️','👽','👾','🤖','🎃',
  '👍','👎','👋','🙌','👏','🤝','🙏','💪','🧠','🫀','👀','🔥','✨','🎉','💯'
]

const messages = computed(() => store.activeList?.messages || [])

const unreadCount = computed(() => {
  return Math.max(0, messages.value.length - lastReadCount.value)
})

const isMe = (sender) => sender === userStore.user.username
const isImage = (avatar) => avatar && (avatar.startsWith('http') || avatar.startsWith('data:image'))

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 600
}

onMounted(() => window.addEventListener('resize', updateIsMobile))
onUnmounted(() => window.removeEventListener('resize', updateIsMobile))

const send = async () => {
  if (!newMessage.value.trim()) return
  await store.sendMessage(newMessage.value)
  newMessage.value = ''
  showEmojiPicker.value = false
  scrollToBottom()
  if (!isMobile.value) {
    inputRef.value?.focus()
  }
}

const addEmoji = (emoji) => {
  newMessage.value += emoji
  if (!isMobile.value) {
    inputRef.value?.focus()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  }
}

watch(() => store.isChatOpen, (isOpen) => {
  if (isOpen) {
    scrollToBottom()
    lastReadCount.value = messages.value.length
    if (!isMobile.value) {
      setTimeout(() => inputRef.value?.focus(), 100)
    }
  } else {
    showEmojiPicker.value = false
  }
})

watch(() => messages.value.length, (newLen) => {
  if (store.isChatOpen) {
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
/* --- MAIN LAYOUT --- */
.chat-sidebar {
  position: fixed;
  top: 0; right: 0;
  width: 400px;
  max-width: 90%;
  height: 100%;
  background: var(--card-color);
  border-left: 1px solid var(--border-color);
  box-shadow: -5px 0 30px rgba(0,0,0,0.6);
  z-index: 200;
  display: flex; flex-direction: column;
}

.chat-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.3); z-index: 190;
}

/* --- HEADER --- */
.chat-header {
  height: 60px;
  background: linear-gradient(90deg, var(--primary-color), #60a5fa);
  color: #fff; padding: 0 1rem;
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
}
.header-title { font-weight: 700; display: flex; align-items: center; gap: 8px; }
.badge {
  background: #fff; color: var(--primary-color);
  padding: 2px 8px; border-radius: 12px;
  font-size: 0.8rem; font-weight: 800;
}
.btn-close {
  background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;
  transition: transform 0.2s;
}
.btn-close:hover { transform: scale(1.1); }

/* --- CHAT BODY --- */
.chat-body {
  flex: 1;
  background: var(--bg-input);
  padding: 1rem;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 1rem;

  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.chat-body::-webkit-scrollbar { width: 6px; }
.chat-body::-webkit-scrollbar-track { background: transparent; }
.chat-body::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.chat-body::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }

.empty-chat {
  text-align: center; color: var(--text-light); margin-top: 3rem; font-style: italic; opacity: 0.7;
}

/* --- MESSAGES --- */
.message { display: flex; gap: 0.6rem; max-width: 90%; }
.message.my-message { align-self: flex-end; flex-direction: row-reverse; }

.msg-avatar {
  width: 32px; height: 32px; flex-shrink: 0;
  background: var(--card-color); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; border: 1px solid var(--border-color);
  overflow: hidden;
}
.img-ava { width: 100%; height: 100%; object-fit: cover; }

.msg-content { display: flex; flex-direction: column; }
.msg-name { font-size: 0.75rem; color: var(--text-light); margin-bottom: 3px; margin-left: 4px; }
.my-message .msg-name { display: none; }

.msg-bubble {
  background: var(--card-color); padding: 0.7rem 1rem;
  border-radius: 16px; border-top-left-radius: 2px;
  font-size: 0.95rem; border: 1px solid var(--border-color);
  word-break: break-word; line-height: 1.4; color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.my-message .msg-bubble {
  background: var(--primary-color); color: #fff;
  border: none; border-radius: 16px; border-top-right-radius: 2px;
  box-shadow: 0 4px 15px rgba(255, 51, 102, 0.3);
}
.msg-time {
  font-size: 0.65rem; color: var(--text-light); margin-top: 4px; text-align: right; opacity: 0.6;
}

/* --- FOOTER & EMOJI --- */
.chat-footer {
  padding: 1rem;
  background: var(--card-color);
  display: flex; gap: 0.5rem;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
  position: relative; align-items: center;
  /* Для iPhone (safe area) */
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

.btn-icon {
  background: none; border: none; font-size: 1.5rem; cursor: pointer;
  padding: 0.4rem; transition: transform 0.2s;
  filter: grayscale(1); opacity: 0.6;
}
.btn-icon:hover, .btn-icon.active { filter: grayscale(0); opacity: 1; transform: scale(1.1); }

.chat-input {
  flex: 1; padding: 0.8rem 1rem;
  border-radius: 24px; border: 1px solid var(--border-color);
  background: var(--bg-input); color: #fff; outline: none;
  transition: border-color 0.2s; font-size: 1rem;
}
.chat-input:focus { border-color: var(--primary-color); }

.btn-send {
  background: var(--primary-color); border: none;
  width: 42px; height: 42px; border-radius: 50%;
  color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; flex-shrink: 0;
  transition: transform 0.1s;
}
.btn-send:active { transform: scale(0.9); }

/* --- EMOJI PICKER (FLOATING BUBBLE) --- */
.emoji-wrapper {
  position: absolute;
  bottom: 80px; left: 10px; width: 320px;
  max-width: calc(100% - 20px); z-index: 10;
}

.emoji-picker-content {
  background: rgba(26, 15, 31, 0.95); backdrop-filter: blur(12px);
  border: 1px solid var(--border-color); border-radius: 16px;
  padding: 0.8rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  max-height: 250px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent;
}

.emoji-picker-content::-webkit-scrollbar { width: 6px; }
.emoji-picker-content::-webkit-scrollbar-track { background: transparent; }
.emoji-picker-content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  border: 2px solid transparent; background-clip: content-box;
}
.emoji-picker-content::-webkit-scrollbar-thumb:hover { background-color: var(--primary-color); }

.emoji-grid {
  display: grid; grid-template-columns: repeat(8, 1fr); gap: 0.25rem;
}

.emoji-item {
  background: none; border: none;
  font-size: 1.5rem; cursor: pointer;
  padding: 0.4rem; border-radius: 8px; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.emoji-item:hover { background: rgba(255,255,255,0.1); transform: scale(1.2); }

/* Animations */
.slide-chat-enter-active, .slide-chat-leave-active { transition: transform 0.3s ease; }
.slide-chat-enter-from, .slide-chat-leave-to { transform: translateX(100%); }

.pop-up-enter-active, .pop-up-leave-active { transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-up-enter-from, .pop-up-leave-to { opacity: 0; transform: translateY(20px) scale(0.9); }

/* --- MOBILE OPTIMIZATION (100% WIDTH/HEIGHT) --- */
@media (max-width: 600px) {
  .chat-sidebar {
    width: 100%;
    max-width: 100%;
    height: 100%;
    top: 0; left: 0; right: 0; bottom: 0; /* Фиксируем на весь экран */
    border-left: none;
    border-radius: 0; /* Убираем скругления */
  }

  .chat-input { font-size: 16px; } /* iOS zoom fix */

  .btn-close { font-size: 2rem; padding: 0 10px; }

  /* Скрываем эмодзи-пикер на мобильных (используем нативную клавиатуру) */
  .emoji-toggle { display: none; }
}
</style>
