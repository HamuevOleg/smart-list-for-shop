<template>
  <Transition name="slide-fade">
    <section class="add-item-card" v-if="store.isAddItemFormVisible">
      <div class="form-header">
        <h2>Add item 🛒</h2>
        <button class="btn-close" @click="store.hideAddItemForm">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="add-item-form">
        <div class="form-row">
          <div class="form-group large">
            <label for="name">Name</label>
            <input
              type="text"
              id="name"
              v-model="item.name"
              class="form-input"
              autocomplete="off" required
            />
          </div>
          <div class="form-group small">
            <label for="quantity">Qty</label>
            <input
              type="number"
              id="quantity"
              v-model.number="item.quantity"
              class="form-input"
              placeholder="1"
            />
          </div>
          <div class="form-group small">
            <label for="unit">Unit</label>
            <select id="unit" v-model="item.unit" class="form-input">
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
                  <span>{{ item.category || 'No category' }}</span>
                  <span>▼</span>
                </button>
              </template>
              <template #content="{ close }">
                <CustomCategorySelector
                  v-model="item.category"
                  @update:modelValue="close"
                />
              </template>
            </PopoverWrapper>
          </div>

          <div class="form-group">
            <label>Due date</label>
            <PopoverWrapper>
              <template #trigger>
                <button type="button" class="form-input popover-trigger">
                  <span>{{ formattedDate || 'Not set' }}</span>
                  <span>📅</span>
                </button>
              </template>
              <template #content="{ close }">
                <CustomCalendar
                  v-model="item.dueDate"
                  @update:modelValue="close"
                />
              </template>
            </PopoverWrapper>
          </div>
        </div>

        <div class="form-row prices">
          <div class="form-group">
            <label for="price1">Price (Store 1)</label>
            <input type="number" step="0.01" id="price1" v-model.number="item.priceStore1" class="form-input" placeholder="29.50" />
          </div>
          <div class="form-group">
            <label for="price2">Price (Store 2)</label>
            <input type="number" step="0.01" id="price2" v-model.number="item.priceStore2" class="form-input" placeholder="30.50" />
          </div>
          <div class="form-group">
            <label for="userPrice">My price</label>
            <input type="number" step="0.01" id="userPrice" v-model.number="item.userPrice" class="form-input" placeholder="30.00" />
          </div>
        </div>

        <div class="form-group">
          <label for="comment">Comment</label>
          <input type="text" id="comment" v-model="item.comment" class="form-input" autocomplete="off" />
        </div>

        <button type="submit" class="btn btn-primary btn-submit">
          Add
        </button>
      </form>
    </section>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useListStore } from '@/stores/listStore'
import PopoverWrapper from './common/PopoverWrapper.vue'
import CustomCategorySelector from './common/CustomCategorySelector.vue'
import CustomCalendar from './common/CustomCalendar.vue'

const store = useListStore()

const getInitialItem = () => ({
  name: '',
  quantity: 1,
  unit: 'pcs',
  category: '',
  dueDate: '',
  comment: '',
  priceStore1: null,
  priceStore2: null,
  userPrice: null,
})

const item = ref(getInitialItem())

const handleSubmit = () => {
  console.log('🚀 Submitting item:', item.value)
  store.addItem(item.value)
  item.value = getInitialItem()
}

const formattedDate = computed(() => {
  if (!item.value.dueDate) return ''
  const [y, m, d] = item.value.dueDate.split('-')
  return `${d}.${m}.${y}`
})
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
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
.add-item-card {
  background: var(--card-color);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
  position: relative;
}
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--secondary-color);
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  color: var(--text-light);
  padding: 0.5rem;
}
.add-item-form {
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
</style>
