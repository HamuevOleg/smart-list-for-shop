<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useListStore } from '@/stores/listStore';
import { useUserStore } from '@/stores/userStore';
import ProfileEditModal from '@/components/ProfileEditModal.vue';

const router = useRouter();
const listStore = useListStore();
const userStore = useUserStore();

// Состояния
const isLoading = ref(true);
const activeView = ref('dashboard');
const showInviteModal = ref(false);
const showCreateModal = ref(false);
const showListMenu = ref(null);
const newListName = ref('');
const inviteEmail = ref('');
const animateStats = ref(false);

// Данные пользователя
const user = computed(() => ({
  name: userStore.user.username || "Guest",
  email: userStore.user.email || "guest@smartlist.com",
  avatar: userStore.user.avatar || '/default_avatar.png',
  plan: "PRO",
  planColor: "text-purple-300"
}));

// Статистика
const stats = computed(() => {
  const lists = listStore.lists;
  const totalItems = lists.reduce((sum, list) => sum + list.items.length, 0);
  const completedItems = lists.reduce((sum, list) =>
    sum + list.items.filter(item => item.completed).length, 0
  );

  return {
    activeLists: lists.length,
    toBuy: totalItems - completedItems,
    done: completedItems,
    totalItems: totalItems
  };
});

// Данные для графиков
const weeklyActivity = computed(() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    day,
    items: Math.floor(Math.random() * 20) + 10
  }));
});

const categoryData = computed(() => {
  const lists = listStore.lists;
  const categories = {};

  lists.forEach(list => {
    const category = list.category || 'Others';
    categories[category] = (categories[category] || 0) + list.items.length;
  });

  const colors = ['#ec4899', '#3b82f6', '#a855f7', '#10b981', '#f59e0b'];
  return Object.entries(categories).map(([name, value], index) => ({
    name,
    value,
    color: colors[index % colors.length]
  }));
});

const completionTrend = computed(() => {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    month,
    rate: Math.floor(Math.random() * 30) + 60
  }));
});

const shoppingLists = computed(() => {
  return listStore.lists.map((list, index) => {
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
    ];

    const glowColors = [
      "rgba(102, 126, 234, 0.6)",
      "rgba(245, 87, 108, 0.6)",
      "rgba(0, 242, 254, 0.6)",
      "rgba(56, 249, 215, 0.6)",
      "rgba(254, 225, 64, 0.6)",
      "rgba(48, 207, 208, 0.6)"
    ];

    return {
      id: list.id,
      name: list.name,
      itemsCount: list.items.length,
      completed: list.items.filter(item => item.completed).length,
      bgGradient: gradients[index % gradients.length],
      glowColor: glowColors[index % glowColors.length],
      members: list.participants?.length || 1
    };
  });
});

const familyMembers = ref([
  { id: 1, name: "Sarah", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", status: "online" },
  { id: 2, name: "Mike", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", status: "online" },
]);

const createNewList = async () => {
  if (newListName.value.trim()) {
    try {
      await listStore.createList(newListName.value);
      newListName.value = '';
      showCreateModal.value = false;
    } catch (error) {
      console.error("Failed to create list:", error);
      alert("Failed to create list. Please try again.");
    }
  }
};

const deleteList = async (listId) => {
  if (confirm("Are you sure you want to delete this list?")) {
    try {
      await listStore.deleteList(listId);
    } catch (error) {
      console.error("Failed to delete list:", error);
      alert("Failed to delete list. Please try again.");
    }
  }
};

const openList = (listId) => {
  router.push(`/list/${listId}`);
};

const inviteMember = () => {
  if (inviteEmail.value.trim()) {
    alert(`Invitation sent to ${inviteEmail.value}!`);
    inviteEmail.value = '';
    showInviteModal.value = false;
  }
};

const logout = () => {
  userStore.logout();
  router.push('/');
};

const navigateTo = (view) => {
  activeView.value = view;
  if (view === 'settings') {
    router.push('/settings');
  }
};

onMounted(async () => {
  try {
    await listStore.fetchLists();
  } catch (error) {
    console.error("Failed to load lists:", error);
  } finally {
    isLoading.value = false;
    setTimeout(() => animateStats.value = true, 200);
  }
});
</script>

<template>
  <div class="dashboard-container">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="mesh-gradient"></div>
    </div>

    <div v-if="isLoading" class="loading-screen">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">Loading your workspace...</p>
    </div>

    <div v-else class="layout-wrapper">
      <!-- Sidebar -->
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
            <a href="#"
               :class="['nav-item', { active: activeView === 'dashboard' }]"
               @click.prevent="navigateTo('dashboard')">
              <span class="nav-icon">📊</span>
              <span class="nav-label">Dashboard</span>
              <div class="nav-indicator"></div>
            </a>
            <a href="#"
               :class="['nav-item', { active: activeView === 'activity' }]"
               @click.prevent="navigateTo('activity')">
              <span class="nav-icon">⚡</span>
              <span class="nav-label">Activity</span>
              <div class="nav-indicator"></div>
            </a>
            <a href="#"
               :class="['nav-item', { active: activeView === 'premium' }]"
               @click.prevent="navigateTo('premium')">
              <span class="nav-icon">💎</span>
              <span class="nav-label">Premium</span>
              <div class="nav-indicator"></div>
            </a>
            <a href="#"
               :class="['nav-item', { active: activeView === 'settings' }]"
               @click.prevent="navigateTo('settings')">
              <span class="nav-icon">⚙️</span>
              <span class="nav-label">Settings</span>
              <div class="nav-indicator"></div>
            </a>
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

      <!-- Main Content -->
      <main class="main-content">
        <!-- Header -->
        <header class="page-header">
          <div class="header-left">
            <h1 class="page-title-main">
              <span class="title-gradient">Dashboard</span>
            </h1>
            <p class="page-subtitle">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}</p>
          </div>
          <button class="create-btn" @click="showCreateModal = true">
            <span class="btn-icon">+</span>
            <span class="btn-text">New List</span>
            <div class="btn-shimmer"></div>
          </button>
        </header>

        <!-- Profile & Stats Section -->
        <div class="hero-section">
          <div class="profile-card-main">
            <div class="card-glow"></div>
            <div class="profile-header">
              <div class="avatar-wrapper-main" @click="userStore.openProfileEdit">
                <img :src="user.avatar" class="avatar-main" />
                <div class="avatar-glow"></div>
                <div class="edit-badge">
                  <span>✎</span>
                </div>
              </div>
              <div class="profile-info">
                <div class="name-section">
                  <h2 class="profile-name">{{ user.name }}</h2>
                  <span class="plan-badge">{{ user.plan }}</span>
                </div>
                <p class="profile-email">{{ user.email }}</p>
              </div>
            </div>

            <div class="stats-grid" :class="{ 'animate-in': animateStats }">
              <div class="stat-card">
                <div class="stat-icon">📋</div>
                <div class="stat-content">
                  <span class="stat-value">{{ stats.activeLists }}</span>
                  <span class="stat-label">Active Lists</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🛒</div>
                <div class="stat-content">
                  <span class="stat-value">{{ stats.toBuy }}</span>
                  <span class="stat-label">To Buy</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                  <span class="stat-value">{{ stats.done }}</span>
                  <span class="stat-label">Completed</span>
                </div>
              </div>
            </div>
          </div>

          <div class="family-card-main">
            <div class="card-glow"></div>
            <div class="family-header">
              <h3 class="family-title">Family Hub</h3>
              <span class="online-count">
                <span class="pulse-dot"></span>
                {{ familyMembers.length + 1 }} Online
              </span>
            </div>

            <div class="family-members">
              <div class="member-item you" :title="user.name">
                <img :src="user.avatar" />
                <div class="member-status online"></div>
                <span class="member-label">You</span>
              </div>
              <div class="member-item" v-for="m in familyMembers" :key="m.id" :title="m.name">
                <img :src="m.avatar" />
                <div class="member-status" :class="m.status"></div>
              </div>
              <button class="add-member" @click="showInviteModal = true">
                <span class="add-icon">+</span>
              </button>
            </div>

            <p class="family-footer">Collaborate in real-time</p>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <div class="chart-card">
            <div class="card-glow"></div>
            <h3 class="chart-title">
              <span class="title-icon">📈</span>
              Weekly Activity
            </h3>
            <div class="chart-wrapper">
              <svg viewBox="0 0 400 200" class="bar-chart">
                <defs>
                  <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <g v-for="(item, index) in weeklyActivity" :key="index">
                  <rect
                    :x="index * 55 + 15"
                    :y="200 - (item.items * 5)"
                    width="40"
                    :height="item.items * 5"
                    fill="url(#barGradient)"
                    class="bar-element"
                    :style="{ animationDelay: `${index * 0.1}s` }"
                    rx="6"
                  />
                  <text :x="index * 55 + 35" y="195" text-anchor="middle" fill="#8b92a8" font-size="11" font-weight="600">
                    {{ item.day }}
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <div class="chart-card">
            <div class="card-glow"></div>
            <h3 class="chart-title">
              <span class="title-icon">🎯</span>
              Categories
            </h3>
            <div class="chart-wrapper pie-wrapper">
              <svg viewBox="0 0 200 200" class="pie-chart">
                <circle cx="100" cy="100" r="75" fill="none" stroke="#1a1f2e" stroke-width="35"
                        v-for="(item, index) in categoryData" :key="index"
                        :stroke="item.color"
                        :stroke-dasharray="`${(item.value / stats.totalItems) * 471} 471`"
                        :stroke-dashoffset="`${-categoryData.slice(0, index).reduce((sum, i) => sum + (i.value / stats.totalItems) * 471, 0)}`"
                        class="pie-segment"
                        :style="{ animationDelay: `${index * 0.15}s` }"
                />
              </svg>
              <div class="category-legend">
                <div v-for="item in categoryData" :key="item.name" class="legend-entry">
                  <span class="legend-color" :style="{ background: item.color }"></span>
                  <span class="legend-name">{{ item.name }}</span>
                  <span class="legend-value">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <div class="card-glow"></div>
            <h3 class="chart-title">
              <span class="title-icon">📊</span>
              Completion Trend
            </h3>
            <div class="chart-wrapper">
              <svg viewBox="0 0 400 200" class="line-chart">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0" />
                  </linearGradient>
                </defs>
                <polygon
                  :points="`${completionTrend.map((item, i) => `${i * 65 + 35},${200 - item.rate * 1.5}`).join(' ')} 400,200 0,200`"
                  fill="url(#areaGradient)"
                  class="area-fill"
                />
                <polyline
                  :points="completionTrend.map((item, i) => `${i * 65 + 35},${200 - item.rate * 1.5}`).join(' ')"
                  fill="none"
                  stroke="url(#lineGradient)"
                  stroke-width="3"
                  class="trend-line"
                />
                <g v-for="(item, index) in completionTrend" :key="index">
                  <circle
                    :cx="index * 65 + 35"
                    :cy="200 - item.rate * 1.5"
                    r="6"
                    fill="#667eea"
                    class="trend-point"
                    :style="{ animationDelay: `${index * 0.1}s` }"
                  />
                  <text :x="index * 65 + 35" y="195" text-anchor="middle" fill="#8b92a8" font-size="11" font-weight="600">
                    {{ item.month }}
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>

        <!-- Lists Section -->
        <section class="lists-section">
          <div class="section-header">
            <h2 class="section-title-main">
              <span class="title-icon-large">📝</span>
              Your Lists
            </h2>
          </div>

          <div v-if="shoppingLists.length === 0" class="empty-placeholder">
            <div class="empty-icon">🚀</div>
            <h3 class="empty-title">Ready to get organized?</h3>
            <p class="empty-text">Create your first list and start tracking items effortlessly.</p>
            <button class="create-btn" @click="showCreateModal = true">
              <span class="btn-icon">+</span>
              <span class="btn-text">Create Your First List</span>
              <div class="btn-shimmer"></div>
            </button>
          </div>

          <div v-else class="lists-grid">
            <div
              v-for="list in shoppingLists"
              :key="list.id"
              class="list-item"
              @click="openList(list.id)"
            >
              <div class="list-glow" :style="{ background: list.glowColor }"></div>

              <div class="list-header-section">
                <div class="list-icon" :style="{ background: list.bgGradient }">
                  <span>🛍️</span>
                </div>
                <button class="list-menu-btn" @click.stop="showListMenu = showListMenu === list.id ? null : list.id">
                  <span>⋯</span>
                </button>
                <div v-if="showListMenu === list.id" class="list-menu" @click.stop>
                  <button @click="openList(list.id)" class="menu-item">
                    <span>📂</span> Open
                  </button>
                  <button @click="deleteList(list.id)" class="menu-item delete">
                    <span>🗑️</span> Delete
                  </button>
                </div>
              </div>

              <div class="list-content">
                <h3 class="list-name">{{ list.name }}</h3>
                <div class="list-info">
                  <span class="items-info">
                    <span class="info-icon">📦</span>
                    {{ list.itemsCount }} items
                  </span>
                  <div class="members-avatars">
                    <div class="member-dot" v-for="n in Math.min(list.members, 3)" :key="n"></div>
                  </div>
                </div>
              </div>

              <div class="progress-container">
                <div class="progress-track">
                  <div
                    class="progress-fill"
                    :style="{
                      width: `${list.itemsCount > 0 ? (list.completed/list.itemsCount)*100 : 0}%`,
                      background: list.bgGradient
                    }"
                  ></div>
                </div>
                <span class="progress-label">
                  {{ list.itemsCount > 0 ? Math.round((list.completed/list.itemsCount)*100) : 0 }}%
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="modal-backdrop" @click="showCreateModal = false">
      <div class="modal-window" @click.stop>
        <div class="modal-glow"></div>
        <h2 class="modal-title">Create New List</h2>
        <input
          v-model="newListName"
          type="text"
          placeholder="Enter list name..."
          class="modal-input-field"
          @keyup.enter="createNewList"
        />
        <div class="modal-buttons">
          <button class="modal-btn secondary" @click="showCreateModal = false">Cancel</button>
          <button class="modal-btn primary" @click="createNewList">Create List</button>
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <div v-if="showInviteModal" class="modal-backdrop" @click="showInviteModal = false">
      <div class="modal-window" @click.stop>
        <div class="modal-glow"></div>
        <h2 class="modal-title">Invite Team Member</h2>
        <input
          v-model="inviteEmail"
          type="email"
          placeholder="Enter email address..."
          class="modal-input-field"
          @keyup.enter="inviteMember"
        />
        <div class="modal-buttons">
          <button class="modal-btn secondary" @click="showInviteModal = false">Cancel</button>
          <button class="modal-btn primary" @click="inviteMember">Send Invitation</button>
        </div>
      </div>
    </div>

    <ProfileEditModal />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-container {
  border-radius: 16px;
  min-height: 100vh;
  background: #0a0e1a;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* Animated Background */
.animated-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.3;
  animation: float 25s infinite ease-in-out;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #667eea 0%, transparent 70%);
  top: -150px;
  left: -150px;
}

.orb-2 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #764ba2 0%, transparent 70%);
  bottom: -200px;
  right: -200px;
  animation-delay: -10s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #f093fb 0%, transparent 70%);
  top: 50%;
  left: 50%;
  animation-delay: -15s;
}

.mesh-gradient {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(at 27% 37%, rgba(102, 126, 234, 0.15) 0px, transparent 50%),
    radial-gradient(at 97% 21%, rgba(118, 75, 162, 0.15) 0px, transparent 50%),
    radial-gradient(at 52% 99%, rgba(240, 147, 251, 0.15) 0px, transparent 50%),
    radial-gradient(at 10% 29%, rgba(67, 233, 123, 0.15) 0px, transparent 50%),
    radial-gradient(at 97% 96%, rgba(245, 87, 108, 0.15) 0px, transparent 50%);
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(50px, -50px) scale(1.1); }
  66% { transform: translate(-40px, 40px) scale(0.9); }
}

/* Loading Screen */
.loading-screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  z-index: 100;
  background: #0a0e1a;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-radius: 50%;
  border-top-color: #667eea;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.spinner-ring:nth-child(2) {
  border-top-color: #764ba2;
  animation-delay: -0.5s;
}

.spinner-ring:nth-child(3) {
  border-top-color: #f093fb;
  animation-delay: -1s;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1rem;
  font-weight: 500;
  color: #8b92a8;
  letter-spacing: 0.5px;
}

/* Layout */
.layout-wrapper {
  border-radius: 16px;
  display: flex;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: rgba(15, 20, 33, 0.7);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-content {
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 48px;
}

.logo-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.logo-glow {
  position: absolute;
  inset: -8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 18px;
  filter: blur(16px);
  opacity: 0.5;
  z-index: 0;
}

.brand-name {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #ffffff 0%, #c7d2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Navigation */
.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  color: #8b92a8;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.nav-item:hover {
  color: #ffffff;
  transform: translateX(4px);
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.nav-item.active .nav-indicator {
  opacity: 1;
}

.nav-icon {
  font-size: 20px;
  position: relative;
  z-index: 1;
}

.nav-label {
  position: relative;
  z-index: 1;
}

.nav-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 3px 3px 0;
  opacity: 0;
  transition: opacity 0.3s;
}

/* Sidebar Footer */
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: auto;
}

.user-profile-mini {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  cursor: pointer;
  transition: transform 0.2s;
}

.user-profile-mini:hover {
  transform: scale(1.02);
}

.avatar-container-mini {
  position: relative;
  width: 42px;
  height: 42px;
}

.avatar-mini {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  object-fit: cover;
}

.status-ring {
  position: absolute;
  inset: -3px;
  border: 2px solid #10b981;
  border-radius: 14px;
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
}

.user-info-mini {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name-mini {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.user-plan-mini {
  font-size: 11px;
  font-weight: 700;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.logout-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: transparent;
  color: #8b92a8;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 40px 48px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
}

.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 4px;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title-main {
  font-size: 48px;
  font-weight: 900;
  line-height: 1;
  margin: 0;
}

.title-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 15px;
  color: #8b92a8;
  font-weight: 500;
}

.create-btn {
  position: relative;
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 14px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
}

.create-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 20px;
  font-weight: bold;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-shimmer {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: translateX(-100%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  to { transform: translateX(100%); }
}

/* Hero Section */
.hero-section {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
}

.profile-card-main,
.family-card-main {
  position: relative;
  padding: 32px;
  background: rgba(15, 20, 33, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  overflow: hidden;
}

.card-glow {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
}

.profile-header {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.avatar-wrapper-main {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s;
}

.avatar-wrapper-main:hover {
  transform: scale(1.05);
}

.avatar-main {
  width: 90px;
  height: 90px;
  border-radius: 20px;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.1);
}

.avatar-glow {
  position: absolute;
  inset: -12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 26px;
  filter: blur(20px);
  opacity: 0.4;
  z-index: -1;
}

.edit-badge {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  border: 2px solid #0a0e1a;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.name-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-name {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
}

.plan-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.profile-email {
  font-size: 14px;
  color: #8b92a8;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-grid.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.stat-card {
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.3s;
}

.stat-card:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 28px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: #8b92a8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Family Card */
.family-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.family-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.online-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #10b981;
  font-weight: 600;
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 20px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
}

.family-members {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.member-item {
  position: relative;
  width: 60px;
  height: 60px;
  transition: transform 0.3s;
}

.member-item:hover {
  transform: translateY(-4px);
}

.member-item img {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.member-item.you img {
  border-color: #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.4);
}

.member-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid #0a0e1a;
  background: #6b7280;
}

.member-status.online {
  background: #10b981;
}

.member-label {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: #667eea;
  font-weight: 600;
  white-space: nowrap;
}

.add-member {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #8b92a8;
  font-size: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.add-member:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-4px);
}

.add-icon {
  font-weight: 300;
}

.family-footer {
  font-size: 13px;
  color: #8b92a8;
  font-weight: 500;
  text-align: center;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.chart-card {
  position: relative;
  padding: 28px;
  background: rgba(15, 20, 33, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  overflow: hidden;
  min-height: 300px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #ffffff;
}

.title-icon {
  font-size: 20px;
}

.chart-wrapper {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Bar Chart */
.bar-chart {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.bar-element {
  transform-origin: bottom;
  transform: scaleY(0);
  animation: grow-bar 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes grow-bar {
  to { transform: scaleY(1); }
}

/* Pie Chart */
.pie-wrapper {
  display: flex;
  align-items: center;
  gap: 24px;
}

.pie-chart {
  width: 180px;
  height: 180px;
}

.pie-segment {
  transform-origin: center;
  transform: rotate(-90deg);
  stroke-dasharray: 0 471;
  animation: draw-pie 1s ease-out forwards;
}

@keyframes draw-pie {
  to { stroke-dasharray: var(--dash) 471; }
}

.category-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
}

.legend-value {
  color: #8b92a8;
  font-weight: 700;
}

/* Line Chart */
.line-chart {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.area-fill {
  opacity: 0;
  animation: fade-in-area 1s ease-out forwards;
}

@keyframes fade-in-area {
  to { opacity: 1; }
}

.trend-line {
  stroke-dasharray: 1500;
  stroke-dashoffset: 1500;
  animation: draw-line 1.5s ease-out forwards;
}

@keyframes draw-line {
  to { stroke-dashoffset: 0; }
}

.trend-point {
  opacity: 0;
  animation: fade-in-point 0.5s ease forwards;
}

@keyframes fade-in-point {
  to { opacity: 1; }
}

/* Lists Section */
.lists-section {
  margin-bottom: 40px;
}

.section-header {
  margin-bottom: 24px;
}

.section-title-main {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  font-weight: 800;
  margin: 0;
}

.title-icon-large {
  font-size: 32px;
}

/* Empty State */
.empty-placeholder {
  padding: 80px 40px;
  background: rgba(15, 20, 33, 0.4);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 8px;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.empty-text {
  font-size: 15px;
  color: #8b92a8;
  max-width: 400px;
}

/* Lists Grid */
.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.list-item {
  position: relative;
  padding: 28px;
  background: rgba(15, 20, 33, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.list-item:hover {
  transform: translateY(-8px);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.list-item:hover .list-glow {
  opacity: 0.5;
}

.list-glow {
  position: absolute;
  top: -80px;
  right: -80px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.2;
  transition: opacity 0.3s;
  pointer-events: none;
}

.list-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
}

.list-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.list-menu-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(0, 0, 0, 0.3);
  color: #8b92a8;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  letter-spacing: 2px;
}

.list-menu-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
}

.list-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #0f1421;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 6px;
  z-index: 10;
  min-width: 140px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  animation: slide-down 0.2s ease;
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.menu-item.delete {
  color: #ef4444;
}

.menu-item.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

.list-content {
  flex: 1;
  margin-bottom: 20px;
}

.list-name {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.list-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.items-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8b92a8;
  font-weight: 600;
}

.info-icon {
  font-size: 16px;
}

.members-avatars {
  display: flex;
  gap: 6px;
}

.member-dot {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 14px;
}

.progress-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 16px currentColor;
}

.progress-label {
  font-size: 14px;
  font-weight: 800;
  min-width: 42px;
  text-align: right;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-window {
  position: relative;
  width: 100%;
  max-width: 480px;
  padding: 40px;
  background: rgba(15, 20, 33, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  animation: zoom-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes zoom-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-glow {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
  filter: blur(80px);
  pointer-events: none;
}

.modal-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 28px 0;
  text-align: center;
}

.modal-input-field {
  width: 100%;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 28px;
  outline: none;
  transition: all 0.3s;
}

.modal-input-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-input-field::placeholder {
  color: #8b92a8;
}

.modal-buttons {
  display: flex;
  gap: 14px;
}

.modal-btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.modal-btn.primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.modal-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.modal-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    width: 80px;
    padding: 24px 12px;
    overflow: visible;
  }

  .brand-name, .nav-label, .user-info-mini {
    display: none;
  }

  .logo-wrapper { margin: 0 auto; }
  .brand { justify-content: center; margin-bottom: 32px; }
  .nav-item { justify-content: center; padding: 14px; }
  .nav-item::before { display: none; }
  .nav-indicator { display: none; }
  .sidebar-footer { flex-direction: column; padding: 12px; }
  .user-profile-mini { justify-content: center; }
  .logout-btn { width: 100%; height: 40px; }

  .hero-section { grid-template-columns: 1fr; }
  .charts-section { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .layout-wrapper {
    border-radius: 16px;
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: sticky;
    top: 0;
    z-index: 50;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 12px 24px;
    overflow: visible;
  }

  .sidebar-content { padding: 0; flex-direction: row; align-items: center; justify-content: space-between; }
  .brand { margin-bottom: 0; }
  .nav-menu { display: none; /* Mobile menu can be added via hamburger */ }
  .sidebar-footer { display: none; }

  /* Mobile Nav (Bottom Bar style or hidden) */
  /* For simplicity, relying on top controls or adding a bottom nav would be better for mobile UX */

  .main-content { padding: 24px 20px; }
  .page-title-main { font-size: 32px; }

  .profile-header { flex-direction: column; align-items: center; text-align: center; }
  .name-section { flex-direction: column; gap: 8px; }
  .stats-grid { grid-template-columns: 1fr; }

  .family-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .online-count { align-self: flex-start; }

  .lists-grid { grid-template-columns: 1fr; }
}
</style>
