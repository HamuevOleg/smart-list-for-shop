<template>
  <Transition name="expand-form">
    <section class="add-item-module glass-panel" v-if="store.isAddItemFormVisible">

      <div class="module-header">
        <div class="header-left">
          <span class="header-emoji">🛒</span>
          <h3>Add New Item</h3>
        </div>
        <button class="btn-close-module" @click="store.hideAddItemForm">
          <span class="close-icon">×</span>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="item-form">

        <div class="main-input-group">
          <div class="input-wrapper glow-focus">
            <span class="input-icon">✏️</span>
            <input
              type="text"
              v-model="item.name"
              class="hero-input"
              placeholder="What do you need?"
              ref="nameInputRef"
              required
            />
          </div>
        </div>

        <div class="qty-row">
          <div class="qty-control">
            <button type="button" class="btn-qty" @click="decrementQty">−</button>
            <input type="number" v-model.number="item.quantity" class="qty-display" />
            <button type="button" class="btn-qty" @click="incrementQty">+</button>
          </div>

          <div class="unit-selector">
            <select v-model="item.unit" class="unit-select">
              <option>pcs</option><option>kg</option><option>g</option><option>l</option><option>pkg</option>
            </select>
            <span class="select-arrow">▼</span>
          </div>
        </div>

        <div class="details-toggler" @click="isExpanded = !isExpanded" :class="{ open: isExpanded }">
          <span class="toggler-text">Add Price, Date & Category</span>
          <span class="toggler-icon">▼</span>
        </div>

        <div class="details-container" v-if="isExpanded">

          <div class="grid-2-col">
            <div class="detail-field">
              <label>Category (AI)</label>
              <PopoverWrapper>
                <template #trigger>
                  <button type="button" class="btn-trigger">
                    {{ item.category || 'Auto' }} <span class="trigger-icon">🏷️</span>
                  </button>
                </template>
                <template #content="{ close }">
                  <CustomCategorySelector v-model="item.category" @update:modelValue="close" />
                </template>
              </PopoverWrapper>
            </div>

            <div class="detail-field">
              <label>Due Date</label>
              <PopoverWrapper>
                <template #trigger>
                  <button type="button" class="btn-trigger">
                    {{ formattedDate || 'No Date' }} <span class="trigger-icon">📅</span>
                  </button>
                </template>
                <template #content="{ close }">
                  <CustomCalendar v-model="item.dueDate" @update:modelValue="close" />
                </template>
              </PopoverWrapper>
            </div>
          </div>

          <div class="detail-field full-width">
            <label>Estimated Prices</label>
            <div class="prices-grid">
              <div class="price-input-box">
                <span class="store-badge metro">M</span>
                <input type="number" step="0.01" v-model.number="item.priceStore1" placeholder="Metro" />
              </div>
              <div class="price-input-box">
                <span class="store-badge linella">L</span>
                <input type="number" step="0.01" v-model.number="item.priceStore2" placeholder="Linella" />
              </div>
              <div class="price-input-box">
                <span class="store-badge user">Me</span>
                <input type="number" step="0.01" v-model.number="item.userPrice" placeholder="My Price" />
              </div>
            </div>
          </div>

          <div class="detail-field full-width">
            <label>Note</label>
            <input type="text" v-model="item.comment" class="sub-input" placeholder="Brand, flavor, details..." />
          </div>

        </div>

        <button type="submit" class="btn-submit-hero" :disabled="store.isAddingItem">
          <span v-if="!store.isAddingItem">Add Item to List</span>
          <span v-else class="loading-state">Adding...</span>
        </button>

      </form>
    </section>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useListStore } from '@/stores/listStore'
import PopoverWrapper from './common/PopoverWrapper.vue'
import CustomCategorySelector from './common/CustomCategorySelector.vue'
import CustomCalendar from './common/CustomCalendar.vue'

const store = useListStore()
const isExpanded = ref(false)
const nameInputRef = ref(null)

const getInitialItem = () => ({
  name: '', quantity: 1, unit: 'pcs', category: '', dueDate: '',
  comment: '', priceStore1: null, priceStore2: null, userPrice: null
})

const item = ref(getInitialItem())

watch(() => store.isAddItemFormVisible, async (val) => {
  if (val) {
    await nextTick()
    nameInputRef.value?.focus()
  } else {
    isExpanded.value = false
  }
})

const incrementQty = () => item.value.quantity++
const decrementQty = () => { if (item.value.quantity > 1) item.value.quantity-- }

const handleSubmit = async () => {
  if (store.isAddingItem || !item.value.name.trim()) return
  await store.addItem(item.value)
  item.value = getInitialItem()
  // Не закрываем форму сразу для удобства добавления нескольких товаров, или закрываем - как удобно
  // store.hideAddItemForm()
  nameInputRef.value?.focus() // Вернуть фокус для следующего товара
}

const formattedDate = computed(() => {
  if (!item.value.dueDate) return ''
  const [y, m, d] = item.value.dueDate.split('-')
  return `${d}.${m}`
})
</script>

<style scoped>
/* Glass Panel */
.glass-panel {
  background: rgba(30, 30, 46, 0.75);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.6);
}

.add-item-module {
  padding: 1.5rem;
  margin-bottom: 2.5rem;
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.add-item-module::after {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--primary-color), #60a5fa);
  box-shadow: 0 0 15px var(--primary-color);
}

/* Header */
.module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.header-left { display: flex; align-items: center; gap: 10px; }
.header-emoji { font-size: 1.5rem; animation: bounce 2s infinite; }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.module-header h3 { margin: 0; font-size: 1.2rem; color: #fff; font-weight: 700; }
.btn-close-module {
  background: rgba(255, 255, 255, 0.08); border: none;
  width: 36px; height: 36px; border-radius: 50%; color: #aaa;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.btn-close-module:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; transform: rotate(90deg); }
.close-icon { font-size: 1.5rem; line-height: 1; }

/* Main Input */
.main-input-group { margin-bottom: 1rem; }
.input-wrapper {
  position: relative; display: flex; align-items: center;
  background: rgba(0, 0, 0, 0.3); border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}
.input-wrapper:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 51, 102, 0.15);
  background: rgba(0, 0, 0, 0.5);
}
.input-icon { position: absolute; left: 1rem; font-size: 1.2rem; opacity: 0.6; }
.hero-input {
  width: 100%; background: transparent; border: none;
  color: #fff; font-size: 1.1rem; font-weight: 600;
  padding: 1.1rem 1rem 1.1rem 3rem; outline: none;
}
.hero-input::placeholder { color: rgba(255, 255, 255, 0.3); font-weight: 400; }

/* Qty & Unit */
.qty-row { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1.2rem; }
.qty-control {
  display: flex; align-items: center; background: rgba(0, 0, 0, 0.3);
  border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}
.btn-qty {
  width: 44px; height: 100%; border: none; background: transparent;
  color: var(--primary-color); font-size: 1.5rem; font-weight: 300;
  cursor: pointer; transition: background 0.2s;
}
.btn-qty:hover { background: rgba(255, 51, 102, 0.1); }
.qty-display {
  flex: 1; text-align: center; background: transparent; border: none;
  color: #fff; font-size: 1.2rem; font-weight: 700;
  padding: 0.8rem 0; outline: none; appearance: none;
}
.unit-selector {
  position: relative; background: rgba(0, 0, 0, 0.3);
  border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex; align-items: center;
}
.unit-select {
  width: 100%; height: 100%; background: transparent; border: none;
  color: #ccc; font-weight: 600; font-size: 1rem;
  padding: 0 1rem; outline: none; appearance: none; cursor: pointer;
}
.unit-select option { background: #1a1f2e; }
.select-arrow { position: absolute; right: 1rem; font-size: 0.7rem; color: #777; pointer-events: none; }

/* Toggler */
.details-toggler {
  text-align: center; padding: 0.6rem; margin-bottom: 0.5rem;
  color: var(--text-light); font-size: 0.85rem; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: color 0.2s;
}
.details-toggler:hover { color: #fff; }
.toggler-icon { transition: transform 0.3s; font-size: 0.7rem; }
.details-toggler.open .toggler-icon { transform: rotate(180deg); }

/* Details Section */
.details-container {
  background: rgba(0, 0, 0, 0.15); border-radius: 18px; padding: 1rem;
  margin-bottom: 1.2rem; animation: slideDown 0.3s ease;
}
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

.grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.detail-field label { display: block; font-size: 0.75rem; color: #888; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

.btn-trigger {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem 1rem; border-radius: 12px; color: #fff; font-size: 0.95rem;
  cursor: pointer; transition: all 0.2s;
}
.btn-trigger:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); }

.prices-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
.price-input-box {
  position: relative; background: rgba(0, 0, 0, 0.3); border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center;
}
.store-badge {
  position: absolute; left: 8px; font-size: 0.65rem; font-weight: 800;
  width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
  border-radius: 6px;
}
.metro { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
.linella { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.user { background: rgba(16, 185, 129, 0.2); color: #34d399; }

.price-input-box input {
  width: 100%; background: transparent; border: none; color: #fff;
  padding: 0.7rem 0.5rem 0.7rem 2rem; font-weight: 600; font-size: 0.9rem; outline: none;
}
.sub-input {
  width: 100%; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px; padding: 0.8rem; color: #fff; font-size: 0.9rem; outline: none;
}
.sub-input:focus { border-color: var(--primary-color); }

/* Submit Button */
.btn-submit-hero {
  width: 100%; padding: 1.1rem; border-radius: 18px; border: none;
  background: linear-gradient(135deg, var(--primary-color), #e91e63);
  color: white; font-size: 1.1rem; font-weight: 700;
  cursor: pointer; box-shadow: 0 5px 20px rgba(255, 51, 102, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-top: 0.5rem;
}
.btn-submit-hero:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 10px 30px rgba(255, 51, 102, 0.5);
}
.btn-submit-hero:active { transform: scale(0.98); }

/* Transitions */
.expand-form-enter-active, .expand-form-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); max-height: 800px; opacity: 1; transform: translateY(0); }
.expand-form-enter-from, .expand-form-leave-to { max-height: 0; opacity: 0; transform: translateY(-30px); margin-bottom: 0; padding: 0; }
</style>
