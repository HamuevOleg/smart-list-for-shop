<template>
  <div class="modal-backdrop" v-if="store.isShareModalOpen" @click.self="close">
    <div class="modal-content">
      <button class="btn-close" @click="close">×</button>
      <h2>Share the list</h2>
      <p>Send this link to your friends so they can join the list:</p>
      <div class="share-link-wrapper">
        <input type="text" :value="fakeLink" readonly class="form-input" />
        <button class="btn btn-primary" @click="copyLink">Copy</button>
      </div>
      <p v-if="copied" class="copy-success">Copied!</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useListStore } from '@/stores/listStore'

const store = useListStore()
const fakeLink = 'https://my-shop-list.com/list/xyz123' // Заглушка
const copied = ref(false)

const close = () => {
  store.isShareModalOpen = false
  copied.value = false
}

const copyLink = () => {
  navigator.clipboard.writeText(fakeLink).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: var(--card-color);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  position: relative;
}

.btn-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-light);
}

h2 {
  margin-top: 0;
  color: var(--secondary-color);
}

.share-link-wrapper {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.share-link-wrapper .form-input {
  background: var(--bg-color);
}

.copy-success {
  color: var(--primary-color);
  font-weight: 600;
  text-align: center;
  margin-top: 1rem;
}
</style>
