<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useListStore } from '@/stores/listStore';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const listStore = useListStore();
const userStore = useUserStore();

// UI States
const animateStats = ref(false);
const showCreateModal = ref(false);
const showDeleteModal = ref(false);
const listToDeleteId = ref(null);
const showListMenu = ref(null);
const newListName = ref('');
const isCreating = ref(false);
const isDeleting = ref(false);
const error = ref('');

// --- РЕАЛЬНАЯ СТАТИСТИКА ---

// 1. Карточки статистики
const stats = computed(() => {
  const lists = listStore.lists;
  const totalItems = lists.reduce((sum, list) => sum + list.items.length, 0);
  const completedItems = lists.reduce((sum, list) =>
    sum + list.items.filter(item => item.completed).length, 0
  );
  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    activeLists: lists.length,
    toBuy: totalItems - completedItems,
    done: completedItems,
    totalItems,
    completionRate
  };
});

// 2. График Топ-категорий
const categoryData = computed(() => {
  const categoryMap = {};
  let totalCount = 0;

  listStore.lists.forEach(list => {
    list.items.forEach(item => {
      const catName = (item.category && item.category.trim()) ? item.category.trim() : 'Other';
      categoryMap[catName] = (categoryMap[catName] || 0) + 1;
      totalCount++;
    });
  });

  const colors = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1', '#ef4444'];

  return Object.keys(categoryMap)
    .map((name, index) => ({
      name,
      count: categoryMap[name],
      value: totalCount > 0 ? Math.round((categoryMap[name] / totalCount) * 100) : 0,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
});

// 3. График Активности за неделю (ИСПРАВЛЕНО)
const weeklyActivity = computed(() => {
  const displayDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const counts = new Array(7).fill(0);

  listStore.lists.forEach(list => {
    list.items.forEach(item => {
      if (item.createdAt) {
        const itemDate = new Date(parseInt(item.createdAt));
        const diffTime = Math.abs(today - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
          const itemDayIndex = itemDate.getDay() === 0 ? 6 : itemDate.getDay() - 1;
          counts[itemDayIndex]++;
        }
      }
    });
  });

  return displayDays.map((day, index) => {
    const isPast = index <= todayIndex;
    // ВОТ ЗДЕСЬ БЫЛА ОШИБКА: добавлено определение items
    const items = counts[index];
    return { day, items, isPast };
  });
});

// 4. Списки покупок
const shoppingLists = computed(() => {
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  ];

  const glowColors = [
    "rgba(102, 126, 234, 0.4)",
    "rgba(245, 87, 108, 0.4)",
    "rgba(0, 242, 254, 0.4)",
    "rgba(67, 233, 123, 0.4)",
    "rgba(250, 112, 154, 0.4)"
  ];

  return listStore.lists.map((list, index) => {
    const itemsCount = list.items.length;
    const completed = list.items.filter(item => item.completed).length;
    const progress = itemsCount > 0 ? Math.round((completed / itemsCount) * 100) : 0;

    return {
      ...list,
      itemsCount,
      completed,
      progress,
      bgGradient: gradients[index % gradients.length],
      glowColor: glowColors[index % glowColors.length],
      members: list.participants?.length || 1
    };
  });
});

// --- Actions ---

const createNewList = async () => {
  if (!newListName.value.trim()) {
    error.value = 'Please enter a list name';
    return;
  }

  try {
    isCreating.value = true;
    error.value = '';
    await listStore.createList(newListName.value.trim());
    newListName.value = '';
    showCreateModal.value = false;
  } catch (err) {
    error.value = err.message || 'Failed to create list';
  } finally {
    isCreating.value = false;
  }
};

const openList = (id) => {
  router.push(`/list/${id}`);
};

const promptDeleteList = (id) => {
  listToDeleteId.value = id;
  showListMenu.value = null;
  showDeleteModal.value = true;
};

const confirmDeleteList = async () => {
  if (!listToDeleteId.value) return;

  try {
    isDeleting.value = true;
    await listStore.deleteList(listToDeleteId.value);
    showDeleteModal.value = false;
    listToDeleteId.value = null;
  } catch (err) {
    alert(err.message || 'Failed to delete list');
  } finally {
    isDeleting.value = false;
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  showDeleteModal.value = false;
  newListName.value = '';
  error.value = '';
  listToDeleteId.value = null;
};

const handleClickOutside = () => {
  if (showListMenu.value !== null) {
    showListMenu.value = null;
  }
};

onMounted(async () => {
  setTimeout(() => animateStats.value = true, 100);
  document.addEventListener('click', handleClickOutside);

  if (listStore.lists.length === 0) {
    try {
      await listStore.fetchLists();
    } catch (e) {
      console.error("Failed to load lists", e);
    }
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });
});
</script>

<template>
  <div class="home-view">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title-main">
          <span class="title-gradient">Dashboard</span>
        </h1>
        <p class="page-subtitle">{{ formattedDate }}</p>
      </div>
      <button class="create-btn" @click="showCreateModal = true">
        <span class="btn-icon">+</span>
        <span class="btn-text">New List</span>
        <div class="btn-glow"></div>
      </button>
    </header>

    <div class="stats-grid" :class="{ 'animate-in': animateStats }">
      <div class="stat-card" style="--delay: 0s">
        <div class="stat-icon-wrapper">
          <div class="stat-icon">📋</div>
          <div class="stat-icon-glow"></div>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.activeLists }}</span>
          <span class="stat-label">Active Lists</span>
        </div>
      </div>

      <div class="stat-card" style="--delay: 0.1s">
        <div class="stat-icon-wrapper">
          <div class="stat-icon">🛒</div>
          <div class="stat-icon-glow"></div>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.toBuy }}</span>
          <span class="stat-label">To Buy</span>
        </div>
      </div>

      <div class="stat-card" style="--delay: 0.2s">
        <div class="stat-icon-wrapper">
          <div class="stat-icon">✅</div>
          <div class="stat-icon-glow"></div>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.done }}</span>
          <span class="stat-label">Completed</span>
          <div class="stat-progress">
            <div class="stat-progress-bar" :style="{ width: stats.completionRate + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-card">
        <h3 class="chart-title">📈 Items Added (This Week)</h3>
        <div class="chart-wrapper">
          <div class="bar-chart">
            <div
              v-for="d in weeklyActivity"
              :key="d.day"
              class="bar-wrapper"
            >
              <div
                class="bar"
                :class="{ 'bar-empty': !d.isPast }"
                :style="{
                  height: Math.max(4, d.items * 10) + 'px',
                  animationDelay: weeklyActivity.indexOf(d) * 0.1 + 's'
                }"
              >
                <div class="bar-tooltip">{{ d.items }} items</div>
              </div>
              <span class="bar-label">{{ d.day }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <h3 class="chart-title">🎯 Top Categories</h3>
        <div class="chart-wrapper">
          <div v-if="categoryData.length > 0" class="category-list">
            <div
              v-for="cat in categoryData"
              :key="cat.name"
              class="category-item"
            >
              <div class="category-info">
                <div class="category-dot" :style="{ background: cat.color }"></div>
                <span class="category-name">{{ cat.name }}</span>
              </div>
              <span class="category-value">{{ cat.value }}%</span>
            </div>
          </div>
          <div v-else class="empty-chart">
            No items to analyze yet
          </div>
        </div>
      </div>
    </div>

    <section class="lists-section">
      <div class="section-header">
        <h2 class="section-title-main">🛍️ Your Lists</h2>
        <span class="section-subtitle">{{ shoppingLists.length }} total</span>
      </div>

      <div v-if="shoppingLists.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No lists yet</h3>
        <p>Create your first shopping list to get started</p>
        <button class="create-btn-secondary" @click="showCreateModal = true">
          Create List
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
              🛍️
            </div>
            <button
              class="list-menu-btn"
              @click.stop="showListMenu = showListMenu === list.id ? null : list.id"
            >
              ⋯
            </button>

            <Transition name="fade">
              <div v-if="showListMenu === list.id" class="list-menu" @click.stop>
                <button @click.stop="promptDeleteList(list.id)" class="menu-item delete">
                  🗑️ Delete
                </button>
              </div>
            </Transition>
          </div>

          <div class="list-content">
            <h3 class="list-name">{{ list.name }}</h3>
            <div class="list-stats">
              <span class="items-info">{{ list.itemsCount }} items</span>
              <span class="members-info">👥 {{ list.members }}</span>
            </div>

            <div class="list-progress-section">
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  :style="{ width: list.progress + '%', background: list.bgGradient }"
                ></div>
              </div>
              <span class="progress-text">{{ list.progress }}% complete</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Transition name="modal">
      <div v-if="showCreateModal" class="modal-backdrop" @click="closeModal">
        <div class="modal-window" @click.stop>
          <div class="modal-header">
            <h2>Create New List</h2>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label for="listName">List Name</label>
              <input
                id="listName"
                v-model="newListName"
                class="modal-input-field"
                :class="{ 'error': error }"
                placeholder="e.g., Weekly Groceries"
                @keyup.enter="createNewList"
                autofocus
              >
              <span v-if="error" class="error-message">{{ error }}</span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="modal-btn secondary" @click="closeModal" :disabled="isCreating">
              Cancel
            </button>
            <button
              class="modal-btn primary"
              @click="createNewList"
              :disabled="isCreating || !newListName.trim()"
            >
              <span v-if="!isCreating">Create</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="showDeleteModal" class="modal-backdrop" @click="closeModal">
        <div class="modal-window" @click.stop>
          <div class="modal-header">
            <h2>Delete List?</h2>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <p style="color: #d1d5db; margin-bottom: 20px;">
              Are you sure you want to delete this list? This action cannot be undone.
            </p>
          </div>

          <div class="modal-footer">
            <button class="modal-btn secondary" @click="closeModal" :disabled="isDeleting">
              Cancel
            </button>
            <button
              class="modal-btn danger"
              @click="confirmDeleteList"
              :disabled="isDeleting"
            >
              <span v-if="!isDeleting">Delete</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.empty-chart { height: 100%; display: flex; align-items: center; justify-content: center; color: #8b92a8; font-size: 0.9rem; font-style: italic; }
.home-view { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem; }
.header-left { flex: 1; }
.page-title-main { margin: 0 0 0.5rem 0; }
.title-gradient { font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, #fff 0%, #667eea 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.02em; }
.page-subtitle { color: #8b92a8; font-size: 0.95rem; margin: 0; }
.create-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; position: relative; overflow: hidden; box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3); }
.create-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4); }
.create-btn:active { transform: translateY(0); }
.btn-icon { font-size: 1.2rem; }
.btn-glow { position: absolute; inset: -2px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; opacity: 0; filter: blur(10px); transition: opacity 0.3s; z-index: -1; }
.create-btn:hover .btn-glow { opacity: 0.6; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.stat-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); padding: 1.75rem; border-radius: 20px; display: flex; align-items: center; gap: 1.25rem; border: 1px solid rgba(255, 255, 255, 0.06); transition: all 0.3s ease; opacity: 0; transform: translateY(20px); }
.stats-grid.animate-in .stat-card { animation: slideUp 0.6s ease forwards; animation-delay: var(--delay); }
@keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
.stat-card:hover { background: rgba(255, 255, 255, 0.06); transform: translateY(-4px); border-color: rgba(255, 255, 255, 0.12); }
.stat-icon-wrapper { position: relative; width: 56px; height: 56px; flex-shrink: 0; }
.stat-icon { width: 56px; height: 56px; background: rgba(102, 126, 234, 0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; position: relative; z-index: 1; }
.stat-icon-glow { position: absolute; inset: 0; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 14px; opacity: 0.2; filter: blur(12px); }
.stat-content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.stat-value { font-size: 2rem; font-weight: 800; color: #fff; line-height: 1; }
.stat-label { color: #8b92a8; font-size: 0.85rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
.stat-progress { margin-top: 8px; height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; overflow: hidden; }
.stat-progress-bar { height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 2px; transition: width 1s ease; }
.charts-section { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem; }
.chart-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border-radius: 20px; padding: 1.75rem; border: 1px solid rgba(255, 255, 255, 0.06); transition: all 0.3s ease; }
.chart-card:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.1); }
.chart-title { margin: 0 0 1.5rem 0; font-size: 1.1rem; font-weight: 700; color: #fff; }
.chart-wrapper { min-height: 180px; }
.bar-chart { display: flex; gap: 12px; align-items: flex-end; height: 140px; padding: 10px 0; }
.bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.bar { width: 100%; background: linear-gradient(180deg, #667eea 0%, #764ba2 100%); border-radius: 6px 6px 0 0; min-height: 10px; position: relative; animation: growBar 0.6s ease forwards; cursor: pointer; transition: all 0.3s ease; }
.bar:hover { filter: brightness(1.2); transform: scaleY(1.05); }
.bar-empty { background: rgba(255, 255, 255, 0.05); }
@keyframes growBar { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }
.bar-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.9); color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.3s; margin-bottom: 4px; }
.bar:hover .bar-tooltip { opacity: 1; }
.bar-label { font-size: 0.75rem; color: #8b92a8; font-weight: 600; }
.category-list { display: flex; flex-direction: column; gap: 12px; }
.category-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255, 255, 255, 0.02); border-radius: 10px; transition: all 0.3s; }
.category-item:hover { background: rgba(255, 255, 255, 0.05); }
.category-info { display: flex; align-items: center; gap: 10px; }
.category-dot { width: 12px; height: 12px; border-radius: 50%; }
.category-name { color: #d1d5db; font-weight: 600; font-size: 0.9rem; }
.category-value { color: #fff; font-weight: 700; font-size: 0.95rem; }
.lists-section { margin-bottom: 2rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.section-title-main { font-size: 1.75rem; font-weight: 800; margin: 0; color: #fff; }
.section-subtitle { color: #8b92a8; font-size: 0.9rem; font-weight: 600; }
.empty-state { text-align: center; padding: 4rem 2rem; background: rgba(255, 255, 255, 0.02); border-radius: 20px; border: 2px dashed rgba(255, 255, 255, 0.1); }
.empty-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.5; }
.empty-state h3 { color: #fff; margin: 0 0 0.5rem 0; font-size: 1.5rem; }
.empty-state p { color: #8b92a8; margin: 0 0 1.5rem 0; }
.create-btn-secondary { background: rgba(102, 126, 234, 0.1); border: 1px solid #667eea; color: #667eea; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.3s; }
.create-btn-secondary:hover { background: rgba(102, 126, 234, 0.2); }
.lists-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.list-item { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); padding: 1.75rem; border-radius: 20px; cursor: pointer; position: relative; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.06); transition: all 0.3s ease; }
.list-item:hover { background: rgba(255, 255, 255, 0.06); transform: translateY(-4px); border-color: rgba(255, 255, 255, 0.12); }
.list-glow { position: absolute; width: 200px; height: 200px; border-radius: 50%; top: -100px; right: -100px; filter: blur(60px); opacity: 0; transition: opacity 0.3s; pointer-events: none; }
.list-item:hover .list-glow { opacity: 1; }
.list-header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; position: relative; }
.list-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); }
.list-menu-btn { width: 32px; height: 32px; border-radius: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #8b92a8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: all 0.3s; }
.list-menu-btn:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
.list-menu { position: absolute; top: 100%; right: 0; margin-top: 8px; background: rgba(15, 20, 33, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 6px; min-width: 140px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); z-index: 10; }
.menu-item { width: 100%; padding: 10px 12px; background: transparent; border: none; color: #d1d5db; text-align: left; cursor: pointer; border-radius: 8px; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; transition: all 0.3s; }
.menu-item:hover { background: rgba(255, 255, 255, 0.05); }
.menu-item.delete { color: #ef4444; }
.menu-item.delete:hover { background: rgba(239, 68, 68, 0.1); }
.list-content { display: flex; flex-direction: column; gap: 12px; }
.list-name { margin: 0; font-size: 1.25rem; font-weight: 700; color: #fff; }
.list-stats { display: flex; gap: 12px; align-items: center; }
.items-info, .members-info { color: #8b92a8; font-size: 0.85rem; font-weight: 600; }
.list-progress-section { margin-top: 16px; }
.progress-bar-bg { height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
.progress-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.progress-text { font-size: 0.75rem; color: #8b92a8; font-weight: 600; display: block; text-align: right; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-window { background: #1a1f2e; width: 100%; max-width: 420px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); overflow: hidden; transform-origin: center; }
.modal-header { padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { margin: 0; font-size: 1.25rem; color: #fff; }
.modal-close { background: transparent; border: none; color: #8b92a8; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1; transition: color 0.2s; }
.modal-close:hover { color: #fff; }
.modal-body { padding: 24px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 0.9rem; color: #d1d5db; font-weight: 500; }
.modal-input-field { background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 12px 16px; color: #fff; font-size: 1rem; transition: all 0.3s; }
.modal-input-field:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15); background: rgba(0, 0, 0, 0.3); }
.modal-input-field.error { border-color: #ef4444; }
.error-message { color: #ef4444; font-size: 0.85rem; margin-top: 4px; }
.modal-footer { padding: 20px 24px; background: rgba(0, 0, 0, 0.2); display: flex; justify-content: flex-end; gap: 12px; }
.modal-btn { padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 0.95rem; cursor: pointer; border: none; transition: all 0.2s; }
.modal-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.modal-btn.secondary { background: transparent; color: #d1d5db; border: 1px solid rgba(255, 255, 255, 0.1); }
.modal-btn.secondary:hover:not(:disabled) { background: rgba(255, 255, 255, 0.05); color: #fff; }
.modal-btn.primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; min-width: 100px; display: flex; justify-content: center; align-items: center; }
.modal-btn.primary:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transform: translateY(-1px); }
.modal-btn.danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; min-width: 100px; display: flex; justify-content: center; align-items: center; }
.modal-btn.danger:hover:not(:disabled) { background: rgba(239, 68, 68, 0.3); }
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-window { animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-leave-active .modal-window { animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) reverse; }
@keyframes modalPop { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
.loading-spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .page-header { flex-direction: column; align-items: flex-start; } .create-btn { width: 100%; justify-content: center; } .stats-grid { grid-template-columns: 1fr; } .charts-section { grid-template-columns: 1fr; } .lists-grid { grid-template-columns: 1fr; } }
</style>
