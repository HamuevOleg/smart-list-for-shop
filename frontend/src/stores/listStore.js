import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { gplClient } from '@/api/gplClient' // <-- Наш клиент

export const useListStore = defineStore('list', () => {
  // --- STATE (Состояние) ---

  // 1. Списки теперь по умолчанию пустые и ждут загрузки
  const lists = ref([])
  const activeListId = ref(null)
  const isLoading = ref(false) // <-- Добавим индикатор загрузки

  // 3. Состояние UI (остается)
  const isShareModalOpen = ref(false)
  const editingItem = ref(null)
  const isAddItemFormVisible = ref(false)
  const isTotalsSidebarOpen = ref(false)

  // --- GETTERS (Геттеры) ---

  // (Остаются без изменений, т.к. они просто читают state)
  const activeList = computed(() => {
    return lists.value.find((list) => list.id === activeListId.value)
  })

  const groupedItems = computed(() => {
    // ... (код геттера не меняется)
    if (!activeList.value) return {}
    const sorted = [...activeList.value.items].sort((a, b) => a.completed - b.completed)
    return sorted.reduce((acc, item) => {
      const category = item.category || 'Без категории'
      if (!acc[category]) acc[category] = []
      acc[category].push(item)
      return acc
    }, {})
  })

  const totals = computed(() => {
    // ... (код геттера не меняется)
    if (!activeList.value) return { store1: 0, store2: 0, user: 0, diff: 0 }
    // ... (логика подсчета)
    let total1 = 0, total2 = 0, totalUser = 0;
    for (const item of activeList.value.items) {
      if (item.completed) continue;
      const p1 = Number(item.priceStore1) || 0;
      const p2 = Number(item.priceStore2) || 0;
      const pUser = Number(item.userPrice) || 0;
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
  // (Вот здесь все меняется!)

  // 1. НОВЫЙ ACTION: Загрузка списков с сервера
  const fetchLists = async () => {
    isLoading.value = true
    const query = `
      query {
        allLists {
          id
          name
          items {
            id
            name
            quantity
            unit
            category
            dueDate
            comment
            priceStore1
            priceStore2
            userPrice
            completed
            imageUrl
          }
        }
      }
    `
    try {
      const data = await gplClient(query)
      lists.value = data.allLists
    } catch (e) {
      console.error('Не удалось загрузить списки:', e)
    } finally {
      isLoading.value = false
    }
  }

  // 2. ИЗМЕНЕННЫЙ ACTION: Создание списка
  const createList = async (name) => {
    const query = `
      mutation($name: String!) {
        createList(name: $name) {
          id
          name
          items { id }
        }
      }
    `
    try {
      const data = await gplClient(query, { name: name || 'Новый список' })
      lists.value.push(data.createList) // Добавляем новый список в state
      activeListId.value = data.createList.id // Сразу открываем его
    } catch (e) {
      console.error('Не удалось создать список:', e)
    }
  }

  // 3. ИЗМЕНЕННЫЙ ACTION: Добавление товара
  const addItem = async (item) => {
    if (!activeList.value) return
    const listId = activeList.value.id
    const query = `
      mutation($listId: ID!, $itemInput: AddItemInput!) {
        addItem(listId: $listId, itemInput: $itemInput) {
          id
          name
          quantity
          unit
          category
          dueDate
          comment
          priceStore1
          priceStore2
          userPrice
          completed
          imageUrl
        }
      }
    `
    try {
      // Убираем __typename, если он вдруг есть (Pinia его не любит)
      const { __typename, ...itemInput } = item
      const data = await gplClient(query, { listId, itemInput })

      // Обновляем state: добавляем новый товар в начало
      activeList.value.items.unshift(data.addItem)
      isAddItemFormVisible.value = false
    } catch (e) {
      console.error('Не удалось добавить товар:', e)
    }
  }

  // 4. ИЗМЕНЕННЫЙ ACTION: Удаление товара
  const removeItem = async (itemId) => {
    if (!activeList.value) return
    const listId = activeList.value.id

    // Оптимистичное обновление: сначала удаляем из UI
    const index = activeList.value.items.findIndex((i) => i.id === itemId)
    if (index === -1) return
    const removedItem = activeList.value.items.splice(index, 1)[0]

    const query = `
      mutation($listId: ID!, $itemId: ID!) {
        removeItem(listId: $listId, itemId: $itemId)
      }
    `
    try {
      await gplClient(query, { listId, itemId })
      // Все хорошо, товар удален
    } catch (e) {
      console.error('Ошибка удаления товара на сервере:', e)
      // Откат: возвращаем товар на место, если сервер вернул ошибку
      activeList.value.items.splice(index, 0, removedItem)
      alert('Не удалось удалить товар. Попробуйте снова.')
    }
  }

  // 5. ИЗМЕНЕННЫЙ ACTION: Переключение
  const toggleItem = async (itemId) => {
    if (!activeList.value) return
    const listId = activeList.value.id
    const item = activeList.value.items.find((i) => i.id === itemId)
    if (!item) return

    const newCompletedState = !item.completed

    const query = `
      mutation($listId: ID!, $itemId: ID!, $completed: Boolean!) {
        toggleItem(listId: $listId, itemId: $itemId, completed: $completed) {
          id
          completed
        }
      }
    `
    try {
      // Обновляем UI сразу (оптимистично)
      item.completed = newCompletedState
      await gplClient(query, { listId, itemId, completed: newCompletedState })
    } catch (e) {
      console.error('Ошибка переключения товара:', e)
      // Откат
      item.completed = !newCompletedState
    }
  }

  // 6. ИЗМЕНЕННЫЙ ACTION: Сохранение
  const saveEdit = async () => {
    if (!editingItem.value || !activeList.value) return

    const listId = activeList.value.id
    const itemId = editingItem.value.id

    // В input-объект идут только те поля, что есть в схеме UpdateItemInput
    const { id, completed, __typename, ...itemInput } = editingItem.value

    const query = `
      mutation($listId: ID!, $itemId: ID!, $itemInput: UpdateItemInput!) {
        updateItem(listId: $listId, itemId: $itemId, itemInput: $itemInput) {
          id
          name
          quantity
          unit
          category
          dueDate
          comment
          priceStore1
          priceStore2
          userPrice
          completed
          imageUrl
        }
      }
    `
    try {
      const data = await gplClient(query, { listId, itemId, itemInput })

      // Обновляем state
      const index = activeList.value.items.findIndex((i) => i.id === itemId)
      if (index !== -1) {
        activeList.value.items[index] = data.updateItem
      }
      editingItem.value = null // Закрываем модалку
    } catch(e) {
      console.error('Не удалось обновить товар:', e)
    }
  }


  // --- Остальные Actions (UI) ---
  // (Они не изменились)
  const selectList = (id) => {
    activeListId.value = id
  }
  const backToListSelector = () => {
    activeListId.value = null
  }
  const startEditing = (item) => {
    editingItem.value = { ...item } // Клонируем
  }
  const cancelEdit = () => {
    editingItem.value = null
  }
  const showAddItemForm = () => {
    isAddItemFormVisible.value = true
  }
  const hideAddItemForm = () => {
    isAddItemFormVisible.value = false
  }
  const toggleTotalsSidebar = () => {
    isTotalsSidebarOpen.value = !isTotalsSidebarOpen.value
  }
  const closeTotalsSidebar = () => {
    isTotalsSidebarOpen.value = false
  }

  // Возвращаем все
  return {
    lists,
    activeListId,
    isShareModalOpen,
    editingItem,
    isAddItemFormVisible,
    activeList,
    groupedItems,
    totals,
    isLoading, // <-- Не забудь вернуть
    fetchLists, // <-- Наш новый action
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
