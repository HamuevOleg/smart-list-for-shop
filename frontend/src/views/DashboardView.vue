<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- Mock Data (Потом заменим на Store/GraphQL) ---
const user = ref({
  name: "Alexey",
  email: "alexey@smartlist.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexey", // Генератор аватаров
  plan: "PRO", // Free, Pro, Family
  planColor: "text-purple-400 border-purple-400 bg-purple-400/10"
});

const stats = ref([
  { label: "Active Lists", value: 4 },
  { label: "Items to Buy", value: 12 },
  { label: "Money Saved", value: "$45.50" }
]);

const shoppingLists = ref([
  { id: 1, name: "🛒 Weekly Groceries", itemsCount: 12, completed: 4, color: "from-pink-500 to-rose-500", members: 2 },
  { id: 2, name: "🏠 Household Items", itemsCount: 5, completed: 0, color: "from-blue-500 to-cyan-500", members: 1 },
  { id: 3, name: "🎂 Birthday Party", itemsCount: 24, completed: 18, color: "from-purple-500 to-indigo-500", members: 4 },
  { id: 4, name: "💻 Tech Setup", itemsCount: 3, completed: 1, color: "from-emerald-500 to-green-500", members: 1 },
]);

const familyMembers = ref([
  { id: 1, name: "Sarah", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
  { id: 2, name: "Mike", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
  { id: 3, name: "Elena", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" },
]);

// Actions
const createNewList = () => {
  console.log("Create new list modal...");
};

const inviteMember = () => {
  console.log("Invite member modal...");
};

const logout = () => {
  router.push('/');
};
</script>

<template>
  <div class="dashboard-container">

    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="stars"></div>
    </div>

    <div class="layout-grid">

      <aside class="sidebar">
        <div class="logo-area">
          <span class="logo-icon">🦄</span>
          <span class="logo-text">SmartList</span>
        </div>

        <nav class="nav-menu">
          <a href="#" class="nav-item active">
            <span class="icon">📊</span> Dashboard
          </a>
          <a href="#" class="nav-item">
            <span class="icon">📝</span> My Lists
          </a>
          <a href="#" class="nav-item">
            <span class="icon">💰</span> Budget
          </a>
          <a href="#" class="nav-item">
            <span class="icon">⚙️</span> Settings
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" @click="logout">
            Log Out
          </button>
        </div>
      </aside>

      <main class="main-content">

        <header class="dashboard-header">
          <div class="welcome-text">
            <h1>Hello, {{ user.name }}! 👋</h1>
            <p>Ready to shop smarter today?</p>
          </div>
          <div class="header-actions">
            <div class="user-pill">
              <img :src="user.avatar" alt="User" class="user-avatar-small" />
              <span>{{ user.email }}</span>
            </div>
          </div>
        </header>

        <div class="stats-grid">
          <div class="glass-card profile-card">
            <div class="profile-header">
              <div class="avatar-wrapper">
                <img :src="user.avatar" alt="Avatar" />
              </div>
              <div class="profile-info">
                <h2>{{ user.name }}</h2>
                <div class="plan-badge" :class="user.planColor">
                  {{ user.plan }} MEMBER
                </div>
              </div>
            </div>
            <div class="profile-stats">
              <div class="p-stat" v-for="stat in stats" :key="stat.label">
                <span class="val">{{ stat.value }}</span>
                <span class="lbl">{{ stat.label }}</span>
              </div>
            </div>
          </div>

          <div class="glass-card family-card">
            <div class="card-header">
              <h3>Family & Friends</h3>
              <button class="icon-btn" @click="inviteMember">+</button>
            </div>
            <div class="family-list">
              <div class="member" v-for="member in familyMembers" :key="member.id">
                <img :src="member.avatar" :alt="member.name" title="member.name" />
              </div>
              <div class="member invite-placeholder" @click="inviteMember">
                <span>+</span>
              </div>
            </div>
            <div class="family-text">
              Sharing is caring! You have {{ familyMembers.length }} active members.
            </div>
          </div>
        </div>

        <section class="lists-section">
          <div class="section-header">
            <h2>Your Lists</h2>
            <button class="btn-primary" @click="createNewList">
              + New List
            </button>
          </div>

          <div class="lists-grid">
            <div
              v-for="list in shoppingLists"
              :key="list.id"
              class="glass-card list-card"
            >
              <div class="list-card-top">
                <div class="list-icon" :class="`bg-gradient-to-br ${list.color}`">
                  🛒
                </div>
                <div class="list-options">•••</div>
              </div>

              <h3 class="list-title">{{ list.name }}</h3>

              <div class="progress-bar-container">
                <div class="progress-info">
                  <span>{{ list.completed }}/{{ list.itemsCount }} items</span>
                  <span>{{ Math.round((list.completed/list.itemsCount)*100) }}%</span>
                </div>
                <div class="progress-track">
                  <div
                    class="progress-fill"
                    :class="`bg-gradient-to-r ${list.color}`"
                    :style="{ width: `${(list.completed/list.itemsCount)*100}%` }"
                  ></div>
                </div>
              </div>

              <div class="list-footer">
                <div class="list-avatars">
                  <div class="mini-avatar" v-for="n in list.members" :key="n"></div>
                </div>
                <span class="open-link">Open →</span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<style scoped>
/* Base & Reset */
.dashboard-container {
  min-height: 100vh;
  background: #0a0a0f;
  color: #fff;
  font-family: 'Inter', sans-serif;
  overflow: hidden; /* Prevent body scroll if content fits */
}

/* --- Background Effects (Reused) --- */
.animated-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.2;
}
.orb-1 {
  width: 600px;
  height: 600px;
  background: #ec4899;
  top: -20%;
  left: -10%;
}
.orb-2 {
  width: 500px;
  height: 500px;
  background: #3b82f6;
  bottom: -20%;
  right: -10%;
}
.stars {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(white 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.1;
}

/* --- Layout Grid --- */
.layout-grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  height: 100vh;
  position: relative;
  z-index: 1;
}

/* --- Sidebar --- */
.sidebar {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 3rem;
  color: #fff;
}
.logo-text {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  color: #9ca3af;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover, .nav-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.nav-item.active {
  border-left: 3px solid #ec4899;
}

.logout-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}
.logout-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

/* --- Main Content --- */
.main-content {
  padding: 2rem 3rem;
  overflow-y: auto;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}
.welcome-text h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}
.welcome-text p {
  color: #9ca3af;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

/* --- Stats Grid --- */
.stats-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  margin-bottom: 3rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.glass-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

/* Profile Card */
.profile-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
.avatar-wrapper img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(236, 72, 153, 0.5);
  padding: 3px;
}
.profile-info h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.plan-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid;
  letter-spacing: 1px;
}

.profile-stats {
  display: flex;
  gap: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}
.p-stat {
  display: flex;
  flex-direction: column;
}
.p-stat .val {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}
.p-stat .lbl {
  font-size: 0.85rem;
  color: #9ca3af;
}

/* Family Card */
.family-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.icon-btn:hover {
  background: #ec4899;
}
.family-list {
  display: flex;
  gap: 10px;
  margin-bottom: 1.5rem;
}
.member img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #0a0a0f;
  transition: 0.2s;
}
.member:hover img {
  transform: scale(1.1);
  border-color: #ec4899;
}
.invite-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9ca3af;
  font-size: 1.5rem;
}
.invite-placeholder:hover {
  border-color: #ec4899;
  color: #ec4899;
}
.family-text {
  font-size: 0.9rem;
  color: #9ca3af;
}

/* --- Lists Section --- */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.btn-primary {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}
.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 20px rgba(236, 72, 153, 0.4);
}

.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* List Card Specifics */
.list-card {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.list-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.list-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.list-options {
  color: #9ca3af;
  cursor: pointer;
}
.list-title {
  font-size: 1.2rem;
  font-weight: 600;
}
.progress-bar-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #9ca3af;
}
.progress-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 3px;
}
.list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 10px;
}
.list-avatars {
  display: flex;
}
.mini-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #555;
  border: 2px solid #1a1a1a;
  margin-left: -8px;
}
.mini-avatar:first-child {
  margin-left: 0;
}
.open-link {
  font-size: 0.85rem;
  color: #ec4899;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 80px 1fr;
  }
  .sidebar {
    padding: 1rem;
    align-items: center;
  }
  .logo-text, .nav-item span:not(.icon), .logout-btn {
    display: none;
  }
  .nav-item {
    justify-content: center;
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .layout-grid {
    grid-template-columns: 1fr;
    height: auto;
  }
  .sidebar {
    display: none; /* Или переделать в bottom bar */
  }
  .main-content {
    padding: 1.5rem;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
