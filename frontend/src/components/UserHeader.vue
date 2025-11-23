<template>
  <header class="user-header">
    <div class="header-top">
      <div class="user-info">
        <img
          src="https://i.pinimg.com/1200x/d2/25/6b/d2256bc3256143beb33b89ffc11132f3.jpg"
          alt="pfp"
          class="avatar"
        />
        <span class="username">tinsuki</span>
      </div>
      <h2 class="list-title">{{ store.activeList?.name }}</h2>
      <button class="btn btn-primary" @click="store.isShareModalOpen = true">
        Share 🔗
      </button>
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
import { useListStore } from '@/stores/listStore'
const store = useListStore()
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
}
.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
}
.username {
  font-weight: 600;
  font-size: 1rem;
}
.list-title {
  font-size: 1.25rem;
  color: var(--secondary-color);
  margin: 0;
  text-align: center;
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
.nav-tab:hover {
  color: var(--secondary-color);
}
.nav-tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}
.nav-tab.disabled {
  color: var(--border-color);
  cursor: not-allowed;
}
</style>
