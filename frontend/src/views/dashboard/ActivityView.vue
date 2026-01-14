<template>
  <div class="activity-view">
    <h1 class="page-title">⚡ Recent Activity</h1>

    <div v-if="loading" class="loading-state">Loading activity...</div>
    <div v-else-if="error" class="error-state">Error loading activity: {{ error.message }}</div>

    <div v-else class="activity-timeline">
      <div v-for="item in activityLog" :key="item.id" class="timeline-item">
        <div class="timeline-icon" :class="item.type">
          {{ getIcon(item.type) }}
        </div>
        <div class="timeline-content">
          <p class="timeline-text">
            <strong>{{ item.user }}</strong> {{ item.action }}
            <span class="highlight">{{ item.target }}</span>
          </p>
          <span class="timeline-time">{{ formatTime(item.timestamp) }}</span>
        </div>
      </div>

      <div v-if="activityLog.length === 0" class="empty-state">
        No recent activity found.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

// GraphQL запрос
const RECENT_ACTIVITY_QUERY = gql`
  query RecentActivity {
    recentActivity {
      id
      user
      action
      target
      type
      timestamp
    }
  }
`;

// Выполняем запрос
const { result, loading, error } = useQuery(RECENT_ACTIVITY_QUERY, null, {
  pollInterval: 5000, // Обновлять каждые 5 секунд
  fetchPolicy: 'network-only' // Всегда запрашивать свежие данные
});

const activityLog = computed(() => result.value?.recentActivity || []);

const getIcon = (type) => {
  const map = {
    add: '➕',
    complete: '✅',
    delete: '🗑️',
    join: '👋',
    uncheck: '↩️'
  };
  return map[type] || '•';
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp));
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return date.toLocaleDateString();
};
</script>

<style scoped>
.page-title { font-size: 2rem; font-weight: 800; margin-bottom: 2rem; color: #fff; }
.activity-timeline { display: flex; flex-direction: column; gap: 1.5rem; position: relative; }
.activity-timeline::before { content: ''; position: absolute; left: 24px; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.1); }
.timeline-item { display: flex; gap: 1.5rem; align-items: flex-start; position: relative; }
.timeline-icon { width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; z-index: 1; backdrop-filter: blur(5px); }
.timeline-icon.add { color: #60a5fa; border-color: rgba(96, 165, 250, 0.3); }
.timeline-icon.complete { color: #10b981; border-color: rgba(16, 185, 129, 0.3); }
.timeline-icon.delete { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }
.timeline-icon.join { color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); }

.timeline-content { background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; flex: 1; border: 1px solid rgba(255,255,255,0.05); transition: transform 0.2s; }
.timeline-content:hover { transform: translateX(5px); background: rgba(255,255,255,0.05); }

.timeline-text { margin: 0 0 0.5rem 0; color: #d1d5db; }
.highlight { color: #fff; font-weight: 600; }
.timeline-time { font-size: 0.8rem; color: #6b7280; }

.loading-state, .error-state, .empty-state { color: rgba(255,255,255,0.5); font-style: italic; margin-top: 20px; }
</style>
