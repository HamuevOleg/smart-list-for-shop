import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useListStore = defineStore('list', () => {
  // --- STATE (Состояние) ---

  // 1. Храним ВСЕ списки пользователя
  const lists = ref([
    // Заглушка, чтобы было с чего начать
    {
      id: 101,
      name: 'Products on the week',
      items: [
        {
              id: 1, name: 'Bananas',
              quantity: 2, unit: 'kg', // <-- ИЗМЕНЕНО
              category: 'Fruits', dueDate: '', comment: '',
              priceStore1: 29.50, priceStore2: 30.50, userPrice: null, completed: false,
            },
            {
              id: 2, name: 'Milk',
              quantity: 3, unit: 'bottle.', // <-- ИЗМЕНЕНО
              category: 'Milk things', dueDate: '', comment: '3.2%',
              priceStore1: 18.00, priceStore2: 17.50, userPrice: null, completed: true,
            },
          ],
        },
        {
          id: 102,
          name: 'For birthday',
          items: [
            {
              id: 3, name: 'Cake',
              quantity: 1, unit: 'шт.', // <-- ИЗМЕНЕНО
              category: 'Other', dueDate: '', comment: '',
              priceStore1: null, priceStore2: null, userPrice: 250, completed: false,
            }
          ],
        },
      ])

  // 2. ID активного списка (null = мы на экране выбора списка)
  const activeListId = ref(null)

  // 3. Состояние UI
  const isShareModalOpen = ref(false)
  const editingItem = ref(null)
  const isAddItemFormVisible = ref(false) // Для скрытия/показа формы
  const isTotalsSidebarOpen = ref(false)

  // --- GETTERS (Геттеры) ---

  // 4. Геттер для получения активного списка
  const activeList = computed(() => {
    return lists.value.find((list) => list.id === activeListId.value)
  })

  // 5. Геттер для сгруппированных товаров (теперь работает с activeList)
  const groupedItems = computed(() => {
    if (!activeList.value) return {}
    const sorted = [...activeList.value.items].sort((a, b) => a.completed - b.completed)
    return sorted.reduce((acc, item) => {
      const category = item.category || 'Без категории'
      if (!acc[category]) acc[category] = []
      acc[category].push(item)
      return acc
    }, {})
  })

  // 6. Геттеры для подсчета тоталов (новая фича)
  const totals = computed(() => {
    if (!activeList.value) return { store1: 0, store2: 0, user: 0, diff: 0 }

    let total1 = 0, total2 = 0, totalUser = 0;

    for (const item of activeList.value.items) {
      if (item.completed) continue; // Не считаем купленные

      const p1 = Number(item.priceStore1) || 0;
      const p2 = Number(item.priceStore2) || 0;
      const pUser = Number(item.userPrice) || 0;

      // Логика подсчета: юзерский прайс в приоритете, иначе берем меньший из магазинов
      if (pUser > 0) {
        totalUser += pUser;
      } else if (p1 > 0 && p2 > 0) {
        total1 += p1;
        total2 += p2;
      } else {
        total1 += p1;
        total2 += p2;
      }
    }

    const finalTotal1 = totalUser + total1;
    const finalTotal2 = totalUser + total2;

    return {
      store1: finalTotal1.toFixed(2),
      store2: finalTotal2.toFixed(2),
      diff: (finalTotal1 - finalTotal2).toFixed(2),
    }
  })


  // --- ACTIONS (Действия) ---


  const toggleTotalsSidebar = () => {
    isTotalsSidebarOpen.value = !isTotalsSidebarOpen.value
  }
  const closeTotalsSidebar = () => {
    isTotalsSidebarOpen.value = false
  }
  // 7. Действия для управления списками
  const selectList = (id) => {
    activeListId.value = id
  }
  const backToListSelector = () => {
    activeListId.value = null
  }
  const createList = (name) => {
    const newList = {
      id: Date.now(),
      name: name || 'Новый список',
      items: [],
    }
    lists.value.push(newList)
    activeListId.value = newList.id // Сразу открываем его
  }

  // 8. Действия для управления товарами (теперь меняют activeList)
  const addItem = (item) => {
    if (!activeList.value) return
    activeList.value.items.unshift({
      ...item,
      id: Date.now(),
      completed: false,
    })
    isAddItemFormVisible.value = false // Авто-скрываем форму после добавления
  }

  const removeItem = (itemId) => {
    if (!activeList.value) return
    activeList.value.items = activeList.value.items.filter(
      (item) => item.id !== itemId
    )
  }

  const toggleItem = (itemId) => {
    if (!activeList.value) return
    const item = activeList.value.items.find((item) => item.id === itemId)
    if (item) item.completed = !item.completed
  }

  // 9. Действия для редактирования (тоже меняют activeList)
  const startEditing = (item) => {
    editingItem.value = { ...item } // Клонируем
  }

  const saveEdit = () => {
    if (!editingItem.value || !activeList.value) return
    const index = activeList.value.items.findIndex(
      (i) => i.id === editingItem.value.id
    )
    if (index !== -1) {
      activeList.value.items[index] = { ...editingItem.value }
    }
    editingItem.value = null // Закрываем модалку
  }

  const cancelEdit = () => {
    editingItem.value = null
  }

  // 10. Показать/скрыть форму
  const showAddItemForm = () => {
    isAddItemFormVisible.value = true;
  }
  const hideAddItemForm = () => {
    isAddItemFormVisible.value = false;
  }

  return {
    lists,
    activeListId,
    isShareModalOpen,
    editingItem,
    isAddItemFormVisible,
    activeList,
    groupedItems,
    totals,
    selectList,
    backToListSelector,
    createList,
    addItem,
    removeItem,
    toggleItem,
    startEditing,
    saveEdit,
    cancelEdit,
    showAddItemForm,
    hideAddItemForm,
    isTotalsSidebarOpen,
    toggleTotalsSidebar,
    closeTotalsSidebar,
  }
})
