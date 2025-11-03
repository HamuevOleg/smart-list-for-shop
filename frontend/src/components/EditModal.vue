<template>
  <Transition name="popover-fade">
    <div class="modal-backdrop" v-if="store.editingItem" @click.self="store.cancelEdit">
      <div class="modal-content">
        <button class="btn-close" @click="store.cancelEdit">×</button>
        <h2>Edit item</h2>

        <form
          v-if="store.editingItem"
          @submit.prevent="store.saveEdit"
          class="edit-form"
        >
          <div class="form-row">
            <div class="form-group large">
              <label for="edit-name">Name</label>
              <input
                type="text"
                id="edit-name"
                v-model="store.editingItem.name"
                class="form-input"
                autocomplete="off" required
              />
            </div>
            <div class="form-group small">
              <label for="edit-quantity">Qty</label>
              <input type="number" id="edit-quantity" v-model.number="store.editingItem.quantity" class="form-input" />
            </div>
            <div class="form-group small">
              <label for="edit-unit">Unit</label>
              <select id="edit-unit" v-model="store.editingItem.unit" class="form-input">
                <option>pcs</option>
                <option>kg</option>
                <option>g</option>
                <option>l</option>
                <option>ml</option>
                <option>btl</option>
                <option>pkg</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Category</label>
              <PopoverWrapper>
                <template #trigger>
                  <button type="button" class="form-input popover-trigger">
                    <span>{{ store.editingItem.category || 'No category' }}</span>
                    <span>▼</span>
                  </button>
                </template>
                <template #content="{ close }">
                  <CustomCategorySelector
                    v-model="store.editingItem.category"
                    @update:modelValue="close"
                  />
                </template>
              </PopoverWrapper>
            </div>

            <div class="form-group">
              <label>Срок (до)</label>
              <PopoverWrapper>
                <template #trigger>
                  <button type="button" class="form-input popover-trigger">
                    <span>{{ formattedDate(store.editingItem.dueDate) || 'Не указан' }}</span>
                    <span>📅</span>
                  </button>
                </template>
                <template #content="{ close }">
                  <CustomCalendar
                    v-model="store.editingItem.dueDate"
                    @update:modelValue="close"
                  />
                </template>
              </PopoverWrapper>
            </div>
          </div>

          <div class="form-row prices">
            <div class="form-group">
              <label for="edit-price1">Цена (Магаз 1)</label>
              <input type="number" step="0.01" id="edit-price1" v-model.number="store.editingItem.priceStore1" class="form-input" />
            </div>
            <div class="form-group">
              <label for="edit-price2">Цена (Магаз 2)</label>
              <input type="number" step="0.01" id="edit-price2" v-model.number="store.editingItem.priceStore2" class="form-input" />
            </div>
            <div class="form-group">
              <label for="edit-userPrice">Моя цена</label>
              <input type="number" step="0.01" id="edit-userPrice" v-model.number="store.editingItem.userPrice" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label for="edit-comment">Комментарий</label>
            <input type="text" id="edit-comment" v-model="store.editingItem.comment" class="form-input" autocomplete="off" />
          </div>

          <button type="submit" class="btn btn-primary btn-submit">Сохранить</button>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
// ... (весь <script setup> остается без изменений) ...
import { useListStore } from '@/stores/listStore'
// Импортируем наши новые компоненты
import PopoverWrapper from './common/PopoverWrapper.vue'
import CustomCategorySelector from './common/CustomCategorySelector.vue'
import CustomCalendar from './common/CustomCalendar.vue'

const store = useListStore()

const formattedDate = (dateString) => {
  if (!dateString) return ''
  const [y, m, d] = dateString.split('-')
  return `${d}.${m}.${y}`
}
</script>

<style scoped>
/* ... (все <style scoped> остаются без изменений) ... */
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
  max-width: 600px; /* Сделаем модалку чуть шире */
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

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-row {
  display: flex;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}
.form-group.large { flex: 3; }
.form-group.small { flex: 1; }
.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-light);
}
.btn-submit {
  margin-top: 1rem;
}

/* Стили для кнопки-триггера */
.popover-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  background: #f8fafc;
  font-size: 1rem;
  font-family: inherit;
  color: var(--text-color);
}
.popover-trigger:hover {
  background: #f1f5f9;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
}

/* Анимация */
.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: all 0.2s ease;
}
.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
}
</style>
