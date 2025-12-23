<script setup>
defineProps({
  className: { type: String, default: '' }
});
</script>

<template>
  <div :class="['scroll-stack-card', className]">
    <slot />
  </div>
</template>

<style>
/* Глобальный стиль для карточки, чтобы JS мог ей управлять */
.scroll-stack-card {
  width: 100%;
  margin: 0 auto;
  /* Важно: карточка не должна схлопываться */
  display: block;
}
</style>
