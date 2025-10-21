<template>
  <div class="category-selector">
    <div class="category-grid">
      <button
        v-for="category in categories"
        :key="category.value"
        type="button" :class="['category-tag', { active: modelValue === category.value }]"
        @click="select(category.value)"
      >
        {{ category.emoji }} {{ category.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
})
const emit = defineEmits(['update:modelValue'])

const categories = [
  { value: 'Fruits', label: 'Fruits', emoji: '🍎' },
  { value: 'Vegetables', label: 'Vegetables', emoji: '🥕' },
  { value: 'Dairy', label: 'Dairy', emoji: '🥛' },
  { value: 'Meat', label: 'Meat', emoji: '🥩' },
  { value: 'Fish', label: 'Fish', emoji: '🐟' },
  { value: 'Groceries', label: 'Groceries', emoji: '🍞' },
  { value: 'Beverages', label: 'Beverages', emoji: '🥤' },
  { value: 'Household', label: 'Household', emoji: '🧼' },
  { value: 'Other', label: 'Other', emoji: '🛒' },
  { value: '', label: 'Uncategorized', emoji: '❌' },
]

const select = (value) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
/* Стили остаются без изменений */
.category-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.category-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
  font-size: 0.9rem;
  text-align: left;
  transition: all 0.2s ease;
}
.category-tag:hover {
  background: #f1f5f9;
}
.category-tag.active {
  background: #eff6ff; /* Голубой фон (под цвет темы) */
  border-color: var(--primary-color);
  color: var(--primary-color);
  font-weight: 600;
}
</style>
