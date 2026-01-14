<template>
  <div class="activity-view">
    <h1 class="page-title">⚡ Recent Activity</h1>

    <div class="activity-timeline">
      <div v-for="item in activityLog" :key="item.id" class="timeline-item">
        <div class="timeline-icon" :class="item.type">
          {{ getIcon(item.type) }}
        </div>
        <div class="timeline-content">
          <p class="timeline-text">
            <strong>{{ item.user }}</strong> {{ item.action }}
            <span class="highlight">{{ item.target }}</span>
          </p>
          <span class="timeline-time">{{ item.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const getIcon = (type) => {
  const map = { add: '➕', complete: '✅', delete: '🗑️', join: '👋' };
  return map[type] || '•';
};

const activityLog = ref([
  { id: 1, user: 'Rune', action: 'added', target: 'Milk', type: 'add', time: '2 mins ago' },
  { id: 2, user: 'Sarah', action: 'completed', target: 'Bananas', type: 'complete', time: '15 mins ago' },
  { id: 3, user: 'Rune', action: 'joined', target: 'Family List', type: 'join', time: '1 hour ago' },
  { id: 4, user: 'Mike', action: 'deleted', target: 'Old List', type: 'delete', time: 'Yesterday' },
]);
</script>

<style scoped>
.page-title { font-size: 2rem; font-weight: 800; margin-bottom: 2rem; color: #fff; }
.activity-timeline { display: flex; flex-direction: column; gap: 1.5rem; position: relative; }
.activity-timeline::before { content: ''; position: absolute; left: 24px; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.1); }
.timeline-item { display: flex; gap: 1.5rem; align-items: flex-start; position: relative; }
.timeline-icon { width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; z-index: 1; }
.timeline-icon.add { color: #60a5fa; border-color: #60a5fa; }
.timeline-icon.complete { color: #10b981; border-color: #10b981; }
.timeline-content { background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; flex: 1; border: 1px solid rgba(255,255,255,0.05); }
.timeline-text { margin: 0 0 0.5rem 0; color: #d1d5db; }
.highlight { color: #fff; font-weight: 600; }
.timeline-time { font-size: 0.8rem; color: #6b7280; }
</style>
