<template>
  <header class="user-header glass-panel">

    <div class="header-top">

      <div class="user-block" @click="userStore.openProfileEdit">
        <div class="avatar-ring">
          <img
            :src="userStore.user.avatar || '/default_avatar.png'"
            alt="User"
            class="avatar-img"
          />
        </div>
        <div class="user-info">
          <div class="name-row">
            <span class="username">{{ userStore.user.username }}</span>
          </div>
          <button class="link-edit">Edit Profile</button>
        </div>
      </div>

      <div class="title-block">
        <h2 class="list-title">
          {{ store.isBestShopsOpen ? '🇲🇩 Guide' : store.activeList?.name }}
        </h2>
      </div>

      <div class="header-actions">
        <button class="btn-icon-glass" @click="store.toggleChat" title="Chat">
          💬
        </button>
        <button class="btn-icon-glass" @click="store.isShareModalOpen = true" title="Share">
          🔗
        </button>
        <button class="btn-icon-glass logout" @click="handleLogout" title="Logout">
          🚪
        </button>
      </div>
    </div>

    <div class="participants-bar" v-if="otherParticipants.length > 0 && !store.isBestShopsOpen">
      <span class="bar-label">Online:</span>
      <div class="avatars-stack">
        <div
          v-for="p in otherParticipants"
          :key="p.username"
          class="stack-item"
          :class="getStatusClass(p.lastSeen)"
          :title="`${p.username} (${getStatusText(p.lastSeen)})`"
        >
          <img :src="p.avatar || '/default_avatar.png'" />
        </div>
      </div>
    </div>

    <nav class="header-nav">
      <a
        class="nav-tab"
        :class="{ active: !store.isBestShopsOpen }"
        @click.prevent="store.closeBestShops"
      >
        Items
        <div class="active-dot"></div>
      </a>

      <a
        class="nav-tab"
        :class="{ active: store.isBestShopsOpen }"
        @click.prevent="store.openBestShops"
      >
        Best Shops
        <div class="active-dot"></div>
      </a>

      <a class="nav-tab disabled">
        Receipts <span class="badge-soon">Soon</span>
      </a>

      <a class="nav-link-back" @click.prevent="store.backToListSelector">
        ← All Lists
      </a>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useListStore } from '@/stores/listStore'
import { useUserStore } from '@/stores/userStore'

const store = useListStore()
const userStore = useUserStore()

const handleLogout = () => {
  if (confirm('Log out from SmartList?')) {
    userStore.logout()
  }
}

const otherParticipants = computed(() => {
  const all = store.activeList?.participants || []
  return all.filter(p => p.username !== userStore.user.username)
})

const getStatusClass = (lastSeenStr) => {
  const diff = Date.now() - Number(lastSeenStr)
  if (diff < 20000) return 'status-online'
  if (diff < 60000) return 'status-away'
  return 'status-offline'
}

const getStatusText = (lastSeenStr) => {
  const diff = Date.now() - Number(lastSeenStr)
  if (diff < 20000) return 'Online'
  const mins = Math.floor(diff / 60000)
  return mins < 1 ? 'Just seen' : `${mins}m ago`
}
</script>

<style scoped>
/* Glass Container */
.user-header {
  margin-bottom: 2rem;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-radius: 28px;
  background: rgba(20, 20, 35, 0.6);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
}

/* Top Row */
.header-top { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }

/* User Block */
.user-block { display: flex; align-items: center; gap: 12px; cursor: pointer; transition: opacity 0.2s; }
.user-block:hover { opacity: 0.8; }
.avatar-ring {
  width: 48px; height: 48px; padding: 2px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}
.avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid #1a1a24; background: #000; }
.user-info { display: flex; flex-direction: column; }
.username { font-weight: 700; font-size: 1.1rem; color: #fff; line-height: 1.2; }
.link-edit { background: none; border: none; padding: 0; color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; text-align: left; cursor: pointer; transition: color 0.2s; }
.link-edit:hover { color: var(--primary-color); }

/* Title */
.title-block { text-align: center; }
.list-title {
  margin: 0; font-size: 1.5rem; font-weight: 800;
  background: linear-gradient(135deg, #fff 30%, var(--secondary-color) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.3);
}

/* Actions */
.header-actions { display: flex; gap: 8px; }
.btn-icon-glass {
  width: 42px; height: 42px; border-radius: 14px;
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff; font-size: 1.2rem; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.btn-icon-glass:hover { background: rgba(255, 255, 255, 0.15); transform: translateY(-2px); }
.logout:hover { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); }

/* Participants */
.participants-bar {
  display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem;
  background: rgba(0, 0, 0, 0.2); padding: 8px 16px; border-radius: 16px; width: fit-content;
}
.bar-label { font-size: 0.75rem; color: rgba(255, 255, 255, 0.7); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.avatars-stack { display: flex; align-items: center; }
.stack-item {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid #2a2a35; margin-left: -10px;
  position: relative; transition: all 0.2s; cursor: help;
}
.stack-item:first-child { margin-left: 0; }
.stack-item:hover { transform: translateY(-4px) scale(1.1); z-index: 10; border-color: #fff; }
.stack-item img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.stack-item::after {
  content: ''; position: absolute; bottom: 0; right: 0; width: 8px; height: 8px;
  border-radius: 50%; border: 1.5px solid #2a2a35;
}
.status-online::after { background: #10b981; }
.status-away::after { background: #f59e0b; }
.status-offline::after { background: #6b7280; }

/* Navigation */
.header-nav {
  display: flex;
  gap: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.5rem;
  padding-bottom: 0.75rem;
  align-items: center;
}

.nav-tab {
  position: relative;
  padding: 1rem 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-tab:hover { color: rgba(255, 255, 255, 0.9); }
.active-dot {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: var(--primary-color);
  border-radius: 3px 3px 0 0;
  box-shadow: 0 -2px 10px var(--primary-color);
  opacity: 0;
  transition: opacity 0.3s;
}
.nav-tab.active { color: #fff; }
.nav-tab.active .active-dot { opacity: 1; }
.nav-tab.disabled { opacity: 0.5; cursor: default; }

.badge-soon {
  font-size: 0.6rem;
  background: rgba(255,255,255,0.15);
  padding: 2px 6px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
}

.nav-link-back {
  margin-left: auto;
  align-self: center;
  font-size: 0.95rem;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.8rem 1.25rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-decoration: none;
}
.nav-link-back:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateX(-4px);
}

@media (max-width: 768px) {
  .user-header { padding: 1.2rem; margin-bottom: 1.5rem; }
  .header-top { display: grid; grid-template-areas: "user actions" "title title"; gap: 1rem; }
  .user-block { grid-area: user; }
  .header-actions { grid-area: actions; justify-content: flex-end; }
  .title-block { grid-area: title; margin-top: 0.5rem; }
  .list-title { font-size: 1.4rem; }

  .header-nav {
    gap: 0;
    padding-top: 0;
    padding-bottom: 0;
    border-top: none;
    flex-direction: column;
    align-items: stretch;
  }

  .nav-tab {
    display: none;
  }

  .nav-link-back {
    width: 100%;
    margin: 0;
    margin-top: 1rem;
    text-align: center;
    padding: 1rem;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
  }

  .nav-link-back:hover {
    transform: none;
  }
}
</style>
