<template>
  <header class="user-header">
    <div class="header-top">
      <div class="user-info">
        <div class="avatar-wrapper">
          <img
            v-if="isImage(userStore.user.avatar)"
            :src="userStore.user.avatar"
            alt="pfp"
            class="avatar-img"
          />
          <div v-else class="avatar-emoji">
            {{ userStore.user.avatar }}
          </div>
        </div>

        <div class="user-text">
          <span class="username">{{ userStore.user.username }}</span>
          <button @click="handleLogout" class="btn-logout">
            Change user ↺
          </button>
        </div>
      </div>

      <h2 class="list-title">{{ store.activeList?.name }}</h2>

      <!-- Мобильный индикатор суммы -->
      <button
        class="mobile-total-indicator"
        @click="store.toggleTotalsSidebar"
      >
        💰 {{ cheapestTotal }}
      </button>

      <button class="btn btn-primary desktop-share-btn" @click="store.isShareModalOpen = true">
        Share 🔗
      </button>
    </div>

    <div class="participants-bar" v-if="otherParticipants.length > 0">
      <span class="label">Also here:</span>
      <div class="participants-list">
        <div
          v-for="p in otherParticipants"
          :key="p.username"
          class="participant"
          :title="p.username + ' (' + getStatusText(p.lastSeen) + ')'"
        >
          <div class="p-avatar-wrapper">
            <img
              v-if="isImage(p.avatar)"
              :src="p.avatar"
              class="p-avatar-img"
            />
            <div v-else class="p-avatar-emoji">
              {{ p.avatar }}
            </div>
            <span class="status-dot" :class="getStatusClass(p.lastSeen)"></span>
          </div>
        </div>
      </div>
    </div>

    <nav class="header-nav">
      <a class="nav-tab active" @click.prevent="store.backToListSelector">
        Lists
      </a>
      <a class="nav-tab disabled" href="#">
        Receipts (soon)
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

const isImage = (avatar) => {
  return avatar && (avatar.startsWith('http') || avatar.startsWith('data:image'))
}

const handleLogout = () => {
  if (confirm('Are you sure you want to log out?')) {
    userStore.logout()
  }
}

const otherParticipants = computed(() => {
  const all = store.activeList?.participants || []
  return all.filter(p => p.username !== userStore.user.username)
})

const getStatusClass = (lastSeenStr) => {
  const diff = Date.now() - Number(lastSeenStr)
  if (diff < 20000) return 'online'
  if (diff < 60000) return 'away'
  return 'offline'
}

const getStatusText = (lastSeenStr) => {
  const diff = Date.now() - Number(lastSeenStr)
  if (diff < 20000) return 'Online now'
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just seen'
  return `${mins}m ago`
}

// Вычисление самой дешевой суммы
const cheapestTotal = computed(() => {
  const total1 = parseFloat(store.totals.store1)
  const total2 = parseFloat(store.totals.store2)

  if (total1 > 0 && total2 > 0) {
    return Math.min(total1, total2).toFixed(2)
  }
  return (total1 || total2).toFixed(2)
})
</script>

<style scoped>
.user-header {
  padding: 1rem;
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.user-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}
.btn-logout {
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;
  text-decoration: underline;
}
.btn-logout:hover { opacity: 1; color: var(--primary-color); }

.avatar-img, .avatar-emoji {
  width: 45px; height: 45px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
  object-fit: cover;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; background: var(--bg-input);
}

.username { font-weight: 700; font-size: 1.1rem; color: #fff; }
.list-title {
  font-size: 1.25rem;
  color: var(--secondary-color);
  margin: 0;
  text-align: center;
}

/* Мобильный индикатор суммы - скрыт по умолчанию */
.mobile-total-indicator {
  display: none;
  background: rgba(255, 51, 102, 0.15);
  border: 1px solid var(--primary-color);
  border-radius: 12px;
  padding: 0.5rem 1rem;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.mobile-total-indicator:hover {
  background: rgba(255, 51, 102, 0.25);
  transform: scale(1.05);
}

/* Кнопка Share - показываем только на десктопе */
.desktop-share-btn {
  display: inline-block;
}

/* --- СТИЛИ ДЛЯ ПАНЕЛИ УЧАСТНИКОВ --- */
.participants-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}
.label {
  font-size: 0.8rem;
  color: var(--text-light);
  font-weight: 600;
  white-space: nowrap;
}
.participants-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.participant {
  position: relative;
  transition: transform 0.2s;
  cursor: help;
}
.participant:hover {
  transform: translateY(-2px);
}

.p-avatar-wrapper {
  position: relative;
  width: 32px; height: 32px;
}
.p-avatar-img, .p-avatar-emoji {
  width: 100%; height: 100%;
  border-radius: 50%;
  border: 2px solid var(--card-color);
  background: var(--bg-input);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; object-fit: cover;
}

.status-dot {
  position: absolute;
  bottom: -2px; right: -2px;
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 2px solid var(--card-color);
  background-color: #94a3b8;
}
.status-dot.online { background-color: #10b981; box-shadow: 0 0 5px #10b981; }
.status-dot.away { background-color: #f59e0b; }

/* МОБИЛЬНАЯ АДАПТАЦИЯ */
@media (max-width: 600px) {
  .list-title {
    display: none; /* Скрываем название списка */
  }

  /* Показываем мобильный индикатор суммы */
  .mobile-total-indicator {
    display: block;
  }

  /* Скрываем кнопку Share на мобильных */
  .desktop-share-btn {
    display: none;
  }

  .header-top {
    justify-content: space-between;
  }
}

.header-nav {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}
.nav-tab {
  padding: 0.5rem 1rem;
  font-weight: 600;
  color: var(--text-light);
  text-decoration: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}
.nav-tab:hover { color: var(--secondary-color); }
.nav-tab.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
.nav-tab.disabled { color: var(--border-color); cursor: not-allowed; }
</style>
