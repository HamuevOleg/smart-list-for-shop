<script setup>
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useListStore } from '@/stores/listStore';
import { useUserStore } from '@/stores/userStore';
import ProfileEditModal from '@/components/ProfileEditModal.vue';

const router = useRouter();
const route = useRoute(); // Используем route.path для активного класса
const listStore = useListStore();
const userStore = useUserStore();

const user = computed(() => ({
  name: userStore.user.username || "Guest",
  email: userStore.user.email || "guest@smartlist.com",
  avatar: userStore.user.avatar || '/default_avatar.png',
  plan: userStore.user.subscription || "FREE",
}));

const logout = () => {
  userStore.logout();
  router.push('/');
};

// Проверяем активность роута для меню
const isActive = (path) => {
  if (path === '/dashboard' && route.path === '/dashboard') return true;
  if (path !== '/dashboard' && route.path.startsWith(path)) return true;
  return false;
};

onMounted(async () => {
  // Подгружаем списки при загрузке Layout, чтобы они были доступны во всех дочерних компонентах
  if (listStore.lists.length === 0) {
    await listStore.fetchLists();
  }
});
</script>

<template>
  <div class="dashboard-container">
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="mesh-gradient"></div>
    </div>

    <div class="layout-wrapper">
      <aside class="sidebar">
        <div class="sidebar-content">
          <div class="brand">
            <div class="logo-wrapper">
              <div class="logo-icon">✨</div>
              <div class="logo-glow"></div>
            </div>
            <span class="brand-name">SmartList</span>
          </div>

          <nav class="nav-menu">
            <router-link to="/dashboard" class="nav-item" :class="{ active: route.name === 'dashboard-home' }">
              <span class="nav-icon">📊</span>
              <span class="nav-label">Dashboard</span>
              <div class="nav-indicator"></div>
            </router-link>

            <router-link to="/dashboard/activity" class="nav-item" active-class="active">
              <span class="nav-icon">⚡</span>
              <span class="nav-label">Activity</span>
              <div class="nav-indicator"></div>
            </router-link>

            <router-link to="/dashboard/premium" class="nav-item" active-class="active">
              <span class="nav-icon">💎</span>
              <span class="nav-label">Premium</span>
              <div class="nav-indicator"></div>
            </router-link>

            <router-link to="/dashboard/settings" class="nav-item" active-class="active">
              <span class="nav-icon">⚙️</span>
              <span class="nav-label">Settings</span>
              <div class="nav-indicator"></div>
            </router-link>
          </nav>

          <div class="sidebar-footer">
            <div class="user-profile-mini" @click="userStore.openProfileEdit">
              <div class="avatar-container-mini">
                <img :src="user.avatar" class="avatar-mini" />
                <div class="status-ring"></div>
              </div>
              <div class="user-info-mini">
                <span class="user-name-mini">{{ user.name }}</span>
                <span class="user-plan-mini">{{ user.plan }}</span>
              </div>
            </div>
            <button class="logout-btn" @click="logout" title="Logout">
              <span>🚪</span>
            </button>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <router-view v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </div>

    <ProfileEditModal />
  </div>
</template>

<style scoped>
/* Оставляем стили для Sidebar, Background, Layout */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

* { box-sizing: border-box; }
.dashboard-container { border-radius: 16px; min-height: 100vh; background: #0a0e1a; color: #ffffff; font-family: 'Inter', sans-serif; position: relative; overflow-x: hidden; }
.animated-bg { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.gradient-orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.3; animation: float 25s infinite ease-in-out; }
.orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, #667eea 0%, transparent 70%); top: -150px; left: -150px; }
.orb-2 { width: 600px; height: 600px; background: radial-gradient(circle, #764ba2 0%, transparent 70%); bottom: -200px; right: -200px; animation-delay: -10s; }
.orb-3 { width: 400px; height: 400px; background: radial-gradient(circle, #f093fb 0%, transparent 70%); top: 50%; left: 50%; animation-delay: -15s; }
@keyframes float { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(50px, -50px) scale(1.1); } 66% { transform: translate(-40px, 40px) scale(0.9); } }

.layout-wrapper { border-radius: 16px; display: flex; min-height: 100vh; position: relative; z-index: 1; }
.sidebar { width: 280px; background: rgba(15, 20, 33, 0.7); backdrop-filter: blur(20px); border-right: 1px solid rgba(255, 255, 255, 0.06); position: sticky; top: 0; height: 100vh; overflow-y: auto; flex-shrink: 0; }
.sidebar-content { padding: 32px 24px; display: flex; flex-direction: column; height: 100%; }
.brand { display: flex; align-items: center; gap: 14px; margin-bottom: 48px; }
.logo-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3); }
.brand-name { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #ffffff 0%, #c7d2fe 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-menu { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.nav-item { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-radius: 14px; color: #8b92a8; text-decoration: none; font-weight: 600; font-size: 15px; transition: all 0.3s; position: relative; overflow: hidden; }
.nav-item:hover { color: #ffffff; background: rgba(255,255,255,0.05); }
.nav-item.active { background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%); color: #ffffff; box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2); }
.nav-indicator { position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 24px; background: linear-gradient(180deg, #667eea 0%, #764ba2 100%); opacity: 0; transition: opacity 0.3s; }
.nav-item.active .nav-indicator { opacity: 1; }
.sidebar-footer { display: flex; align-items: center; gap: 12px; padding: 16px; background: rgba(0, 0, 0, 0.3); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.06); margin-top: auto; }
.user-profile-mini { display: flex; align-items: center; gap: 12px; flex: 1; cursor: pointer; }
.avatar-mini { width: 42px; height: 42px; border-radius: 12px; object-fit: cover; }
.user-name-mini { font-size: 14px; font-weight: 600; color: #fff; }
.user-plan-mini { font-size: 11px; font-weight: 700; color: #667eea; text-transform: uppercase; }
.logout-btn { width: 38px; height: 38px; border: 1px solid rgba(255, 255, 255, 0.06); background: transparent; color: #8b92a8; cursor: pointer; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.logout-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }
.main-content { flex: 1; padding: 40px 48px; overflow-y: auto; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1024px) {
  .sidebar { width: 80px; padding: 24px 12px; }
  .brand-name, .nav-label, .user-info-mini { display: none; }
  .sidebar-footer { flex-direction: column; }
}
@media (max-width: 768px) {
  .layout-wrapper { flex-direction: column; }
  .sidebar { width: 100%; height: auto; position: fixed; bottom: 0; top: auto; z-index: 1000; border-top: 1px solid rgba(255,255,255,0.1); padding: 10px; display: flex; justify-content: center; background: #0a0e1a; }
  .nav-menu { flex-direction: row; justify-content: space-around; width: 100%; }
  .sidebar-content { padding: 0; width: 100%; }
  .brand, .sidebar-footer { display: none; }
  .main-content { padding: 20px; padding-bottom: 80px; }
}
</style>
