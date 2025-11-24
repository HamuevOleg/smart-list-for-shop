<template>
  <Teleport to="body">
    <Transition name="popover-fade">
      <div class="modal-backdrop" v-if="store.editingItem" @click.self="store.cancelEdit">

        <div class="modal-content">
          <button class="btn-close" @click="store.cancelEdit">×</button>

          <h2 class="modal-title">Editing Item</h2>
          <div class="item-sub-name">{{ store.editingItem.name }}</div>

          <form @submit.prevent="store.saveEdit" class="edit-form">

            <div class="form-group">
              <label class="input-label">Name</label>
              <input
                type="text"
                v-model="store.editingItem.name"
                class="form-input dark-input"
                placeholder="Product name..."
                autocomplete="off" required
              />
            </div>

            <div class="toolbar-row">
              <div class="qty-group">
                <input
                  type="number"
                  v-model.number="store.editingItem.quantity"
                  class="form-input dark-input qty-input"
                  placeholder="1"
                />
                <select v-model="store.editingItem.unit" class="form-input dark-input unit-select">
                  <option>pcs</option>
                  <option>kg</option>
                  <option>g</option>
                  <option>l</option>
                  <option>ml</option>
                  <option>btl</option>
                  <option>pkg</option>
                </select>
              </div>

              <div class="spacer"></div>

              <div class="icon-actions">
                <div class="popover-right-align">
                  <PopoverWrapper>
                    <template #trigger>
                      <button type="button" class="btn-icon-trigger" :class="{ active: store.editingItem.category }">
                        <span>{{ getCategoryIcon(store.editingItem.category) }}</span>
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

                <div class="popover-right-align">
                  <PopoverWrapper>
                    <template #trigger>
                      <button type="button" class="btn-icon-trigger" :class="{ active: store.editingItem.dueDate }">
                        <span>📅</span>
                        <span v-if="store.editingItem.dueDate" class="status-dot"></span>
                        <span v-if="store.editingItem.dueDate" class="tiny-date">
                          {{ formatTinyDate(store.editingItem.dueDate) }}
                        </span>
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
            </div>

            <div class="prices-section">
              <div class="prices-grid">
                <div class="price-card">
                  <span class="price-label">Metro</span>
                  <input type="number" step="0.01" v-model.number="store.editingItem.priceStore1" class="price-input" placeholder="—" />
                </div>
                <div class="price-card">
                  <span class="price-label">Linella</span>
                  <input type="number" step="0.01" v-model.number="store.editingItem.priceStore2" class="price-input" placeholder="—" />
                </div>
                <div class="price-card">
                  <span class="price-label">My Price</span>
                  <input type="number" step="0.01" v-model.number="store.editingItem.userPrice" class="price-input" placeholder="—" />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="input-label">Comment</label>
              <input
                type="text"
                v-model="store.editingItem.comment"
                class="form-input dark-input"
                placeholder="Any notes?"
                autocomplete="off"
              />
            </div>

            <button type="submit" class="btn btn-primary btn-submit">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useListStore } from '@/stores/listStore'
import PopoverWrapper from './common/PopoverWrapper.vue'
import CustomCategorySelector from './common/CustomCategorySelector.vue'
import CustomCalendar from './common/CustomCalendar.vue'

const store = useListStore()

const formatTinyDate = (dateString) => {
  if (!dateString) return ''
  const [y, m, d] = dateString.split('-')
  return `${d}.${m}`
}

const getCategoryIcon = (categoryName) => {
  const map = {
    'Fruits': '🍎', 'Vegetables': '🥕', 'Dairy': '🥛',
    'Meat': '🥩', 'Fish': '🐟', 'Groceries': '🍞',
    'Beverages': '🥤', 'Household': '🧼', 'Other': '🛒'
  }
  return map[categoryName] || '🏷️'
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Поднял z-index чтобы наверняка */
  padding: 1rem;
  box-sizing: border-box; /* Важно для центрирования */
}

/* --- ОСНОВНОЙ КОНТЕЙНЕР --- */
.modal-content {
  background: var(--card-color);
  box-sizing: border-box; /* ФИКС: Учитываем padding в ширине */
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);

  width: 100%;
  max-width: 450px; /* Максимальная ширина на десктопе */
  margin: 0 auto;   /* Центрируем по горизонтали */

  position: relative;
  border-top: 4px solid var(--primary-color);

  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) transparent;
}

.btn-close {
  position: absolute; top: 0.8rem; right: 1rem;
  background: none; border: none;
  font-size: 1.8rem; cursor: pointer; color: var(--text-light);
  z-index: 2; transition: color 0.2s;
  line-height: 1;
}
.btn-close:hover { color: #fff; }

/* Заголовки по центру */
.modal-title {
  text-align: center;
  font-family: "Kumbh Sans", sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin: 0.5rem 0 0.2rem 0;
  line-height: 1.1;
}
.item-sub-name {
  text-align: center;
  font-size: 1rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
  font-style: italic;
  opacity: 0.8;
}

.edit-form { display: flex; flex-direction: column; gap: 1.2rem; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.input-label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); margin-left: 4px; }

/* Темные инпуты */
.dark-input {
  background: var(--bg-input);
  color: #fff;
  border: 1px solid transparent;
  padding: 0.8rem;
  border-radius: 8px; /* Добавил явное скругление */
  transition: all 0.2s;
  width: 100%; /* Гарантируем ширину */
  box-sizing: border-box;
}
.dark-input:focus {
  background: #2a1f35;
  border-color: var(--primary-color);
  outline: none;
}

/* --- TOOLBAR --- */
.toolbar-row {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.qty-group { display: flex; gap: 2px; }
.qty-input {
  width: 60px; text-align: center; font-weight: 600;
  border-top-right-radius: 0; border-bottom-right-radius: 0;
}
.unit-select {
  width: 70px; padding-left: 5px; cursor: pointer;
  border-top-left-radius: 0; border-bottom-left-radius: 0;
  border-left: 1px solid rgba(255,255,255,0.1);
}

.spacer { flex: 1; }
.icon-actions { display: flex; gap: 0.5rem; }

.btn-icon-trigger {
  width: 44px; height: 44px;
  border-radius: 10px; border: 1px solid transparent;
  background: var(--bg-input);
  font-size: 1.4rem; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative; transition: all 0.2s;
}
.btn-icon-trigger.active {
  background: rgba(255, 51, 102, 0.15); border-color: rgba(255, 51, 102, 0.4);
}

/* --- ЦЕНЫ --- */
.prices-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.6rem; }
.price-card {
  display: flex; flex-direction: column; align-items: center;
  background: var(--bg-input);
  padding: 0.6rem 0.2rem;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}
.price-card:focus-within { border-color: var(--primary-color); }

.price-label { font-size: 0.65rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.price-input {
  width: 100%; text-align: center; background: transparent;
  border: none; color: #fff; font-weight: 700; font-size: 1rem;
  padding: 0; outline: none;
}
.price-input::placeholder { color: rgba(255,255,255,0.2); }

.btn-submit {
  width: 100%; padding: 1rem;
  font-size: 1rem; font-weight: 700;
  margin-top: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  border: none;
  background: var(--primary-color);
  color: #fff;
}

/* Индикаторы */
.status-dot { position: absolute; top: 4px; right: 4px; width: 6px; height: 6px; background: #fbbf24; border-radius: 50%; box-shadow: 0 0 4px #fbbf24; }
.tiny-date { position: absolute; bottom: 2px; font-size: 0.5rem; font-weight: 800; color: #fbbf24; background: rgba(0,0,0,0.7); padding: 0 3px; border-radius: 4px; }

.popover-right-align :deep(.popover-content) { left: auto !important; right: 0 !important; transform-origin: top right; }

.popover-fade-enter-active, .popover-fade-leave-active { transition: all 0.2s ease; }
.popover-fade-enter-from, .popover-fade-leave-to { opacity: 0; transform: translateY(10px); }

/* --- МОБИЛЬНАЯ АДАПТАЦИЯ --- */
@media (max-width: 480px) {
  .modal-backdrop {
    padding: 0.5rem; /* Меньше отступ от краев экрана */
    align-items: center; /* Оставляем по центру, можно flex-end если хочешь снизу */
  }

  .modal-content {
    padding: 1.25rem; /* Уменьшаем внутренние отступы */
    width: 100%; /* Растягиваем на доступную ширину */
  }

  .modal-title { font-size: 1.5rem; }
  .btn-close { top: 0.5rem; right: 0.8rem; }

  /* Инпуты цен чуть компактнее */
  .prices-grid { gap: 0.4rem; }
  .price-card { padding: 0.5rem 0; }
}
</style>
