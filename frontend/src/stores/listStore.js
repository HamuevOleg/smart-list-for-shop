import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { gplClient } from '@/api/gplClient'
import { useUserStore } from './userStore'
import { db } from '@/db'
import { v4 as uuidv4 } from 'uuid'

export const useListStore = defineStore('list', () => {
  // === STATE ===
  const lists = ref([])
  const activeListId = ref(null)
  const isLoading = ref(false)
  const isAddingItem = ref(false)
  const isOnline = ref(navigator.onLine)

  // UI State
  const isShareModalOpen = ref(false)
  const editingItem = ref(null)
  const viewingItem = ref(null)
  const isAddItemFormVisible = ref(false)
  const isTotalsSidebarOpen = ref(false)
  const isTotalsModalOpen = ref(false)
  const isChatOpen = ref(false)
  const isHelpSidebarOpen = ref(true)

  // New State for "Best Shops" tab
  const isBestShopsOpen = ref(false)

  // === GETTERS ===
  const activeList = computed(() => {
    return lists.value.find((list) => list.id === activeListId.value)
  })

  const groupedItems = computed(() => {
    if (!activeList.value) return {}
    // Сортировка: сначала невыполненные
    const sorted = [...activeList.value.items].sort((a, b) => a.completed - b.completed)
    return sorted.reduce((acc, item) => {
      const category = item.category || 'Uncategorized'
      if (!acc[category]) acc[category] = []
      acc[category].push(item)
      return acc
    }, {})
  })

  const totals = computed(() => {
    if (!activeList.value) return { store1: 0, store2: 0, diff: 0 }

    let total1 = 0
    let total2 = 0
    let totalUser = 0 // Сумма товаров, где есть только "моя цена" или она приоритетна (опционально)

    // В текущей логике считаем просто сумму Metro vs Linella для некупленных товаров
    // Если есть userPrice, можно использовать его как "итоговую" для пользователя,
    // но для сравнения магазинов берем их цены.

    for (const item of activeList.value.items) {
      if (item.completed) continue

      const p1 = Number(item.priceStore1) || 0
      const p2 = Number(item.priceStore2) || 0
      const pUser = Number(item.userPrice) || 0

      // Простая логика: суммируем цены магазинов, если они есть
      if (p1 > 0) total1 += p1
      if (p2 > 0) total2 += p2

      // Если цены магазина нет, но есть userPrice, можно добавить её к обоим,
      // чтобы "дырки" не искажали общую картину (опционально)
      if (p1 === 0 && pUser > 0) total1 += pUser
      if (p2 === 0 && pUser > 0) total2 += pUser
    }

    return {
      store1: total1.toFixed(2),
      store2: total2.toFixed(2),
      diff: (total1 - total2).toFixed(2),
    }
  })

  // === ACTIONS (DB & API) ===

  const saveListsToDb = async () => {
    // Сохраняем в локальную БД (Dexie)
    const plainLists = JSON.parse(JSON.stringify(lists.value))
    await db.lists.bulkPut(plainLists)
  }

  const fetchLists = async () => {
    isLoading.value = true

    // 1. Грузим из локальной БД
    const localLists = await db.lists.toArray()
    if (localLists.length > 0) {
      lists.value = localLists
    }

    if (!navigator.onLine) {
      isLoading.value = false
      return
    }

    // 2. Грузим с сервера
    const query = `
      query {
        allLists {
          id name
          items {
            id name quantity unit category dueDate comment priceStore1 priceStore2 userPrice completed imageUrl
            addedBy addedByAvatar completedBy completedByAvatar
          }
        }
      }
    `
    try {
      const data = await gplClient(query)
      if (data.allLists) {
        lists.value = data.allLists
        await saveListsToDb()
      }
    } catch (e) {
      console.error('Offline mode active or Server Error:', e)
    } finally {
      isLoading.value = false
    }
  }

  const fetchListById = async (id, { background = false } = {}) => {
    if (!background) isLoading.value = true

    // Сначала из кэша
    const localList = await db.lists.get(id)
    if (localList) {
      const existingIndex = lists.value.findIndex(l => l.id === id)
      if (existingIndex !== -1) {
        lists.value[existingIndex] = localList
      } else {
        lists.value.push(localList)
      }
      activeListId.value = id
    }

    if (!navigator.onLine) {
      if (!background) isLoading.value = false
      return
    }

    const userStore = useUserStore()
    const query = `
      query($id: ID!, $user: UserInput) {
        listById(id: $id, user: $user) {
          id name
          items {
            id name quantity unit category dueDate comment priceStore1 priceStore2 userPrice completed imageUrl
            addedBy addedByAvatar completedBy completedByAvatar
          }
          participants { username avatar lastSeen }
          messages { id sender avatar text timestamp }
        }
      }
    `
    try {
      const user = userStore.isRegistered
        ? { username: userStore.user.username, avatar: userStore.user.avatar }
        : null

      const data = await gplClient(query, { id, user })

      if (data.listById) {
        const index = lists.value.findIndex(l => l.id === data.listById.id)
        if (index !== -1) {
          // Сохраняем локальные pending элементы при обновлении
          const pendingItems = lists.value[index].items.filter(i => i.syncStatus === 'pending')
          const serverItems = data.listById.items

          // Объединяем, чтобы не потерять то, что только что добавили офлайн
          data.listById.items = [...pendingItems, ...serverItems]

          lists.value[index] = data.listById
        } else {
          lists.value.push(data.listById)
        }
        activeListId.value = data.listById.id
        await saveListsToDb()
      }
    } catch (e) {
      console.error('Failed to update list from server', e)
    } finally {
      if (!background) isLoading.value = false
    }
  }

  const createList = async (name) => {
    if (!navigator.onLine) {
      alert('You need internet connection to create a new list.')
      return
    }
    const query = `mutation($name: String!) { createList(name: $name) { id name items { id } } }`
    try {
      const data = await gplClient(query, { name: name || 'New List' })
      lists.value.push(data.createList)
      activeListId.value = data.createList.id
      await saveListsToDb()
    } catch (e) {
      console.error(e)
    }
  }

  const addItem = async (item) => {
    if (!activeList.value) return
    const userStore = useUserStore()

    // Optimistic Update
    const tempId = uuidv4()
    const listId = activeList.value.id

    const newItem = {
      ...item,
      id: tempId,
      syncStatus: 'pending', // Маркер для UI
      completed: false,
      addedBy: userStore.user.username,
      addedByAvatar: userStore.user.avatar
    }

    // Добавляем в начало списка
    activeList.value.items.unshift(newItem)
    isAddItemFormVisible.value = false
    await saveListsToDb()

    // Задача для синхронизации
    const syncTask = {
      type: 'ADD_ITEM',
      listId: listId,
      tempId: tempId,
      payload: { ...item },
      user: { username: userStore.user.username, avatar: userStore.user.avatar }
    }

    if (navigator.onLine) {
      processSyncItem(syncTask)
    } else {
      await db.syncQueue.add(syncTask)
    }
  }

  const processSyncItem = async (task) => {
    try {
      if (task.type === 'ADD_ITEM') {
        const query = `
          mutation($listId: ID!, $itemInput: AddItemInput!, $user: UserInput!) {
            addItem(listId: $listId, itemInput: $itemInput, user: $user) {
              id name quantity unit category dueDate comment priceStore1 priceStore2 userPrice completed imageUrl
              addedBy addedByAvatar completedBy completedByAvatar
            }
          }
        `
        const data = await gplClient(query, {
          listId: task.listId,
          itemInput: task.payload,
          user: task.user
        })

        // Заменяем временный ID на настоящий
        const list = lists.value.find(l => l.id === task.listId)
        if (list) {
          const index = list.items.findIndex(i => i.id === task.tempId)
          if (index !== -1) {
            list.items[index] = data.addItem
            await saveListsToDb()
          }
        }
      }
      else if (task.type === 'TOGGLE_ITEM') {
        const query = `
          mutation($listId: ID!, $itemId: ID!, $completed: Boolean!, $user: UserInput!) {
            toggleItem(listId: $listId, itemId: $itemId, completed: $completed, user: $user) {
              id completed completedBy completedByAvatar
            }
          }
        `
        await gplClient(query, {
          listId: task.listId,
          itemId: task.itemId,
          completed: task.completed,
          user: task.user
        })
      }
      else if (task.type === 'REMOVE_ITEM') {
        const query = `mutation($listId: ID!, $itemId: ID!) { removeItem(listId: $listId, itemId: $itemId) }`
        await gplClient(query, { listId: task.listId, itemId: task.itemId })
      }

      // Если успешно - удаляем из очереди
      if (task.id) await db.syncQueue.delete(task.id)

    } catch (e) {
      console.error('Sync failed for task', task, e)
      // Если это не временная ошибка сети, возможно, стоит удалить задачу или пометить как failed
      if (!task.id) await db.syncQueue.add(task)
    }
  }

  const syncPendingActions = async () => {
    if (!navigator.onLine) return
    const tasks = await db.syncQueue.toArray()
    if (tasks.length === 0) return

    console.log(`Syncing ${tasks.length} offline actions...`)
    for (const task of tasks) {
      await processSyncItem(task)
    }
  }

  const toggleItem = async (itemId) => {
    if (!activeList.value) return
    const userStore = useUserStore()

    const item = activeList.value.items.find(i => i.id === itemId)
    if (!item) return

    // Optimistic
    item.completed = !item.completed
    await saveListsToDb()

    const task = {
      type: 'TOGGLE_ITEM',
      listId: activeList.value.id,
      itemId: itemId,
      completed: item.completed,
      user: { username: userStore.user.username, avatar: userStore.user.avatar }
    }

    if (navigator.onLine) processSyncItem(task)
    else await db.syncQueue.add(task)
  }

  const removeItem = async (itemId) => {
    if (!activeList.value) return

    // Для безопасности пока требуем онлайн для удаления,
    // но можно реализовать и офлайн удаление через очередь
    if (!navigator.onLine) {
      alert("Delete requires internet for now (Safety reasons)")
      return
    }

    const listId = activeList.value.id
    const index = activeList.value.items.findIndex((i) => i.id === itemId)
    if (index === -1) return

    // Optimistic
    activeList.value.items.splice(index, 1)
    await saveListsToDb()

    const query = `mutation($listId: ID!, $itemId: ID!) { removeItem(listId: $listId, itemId: $itemId) }`
    gplClient(query, { listId, itemId }).catch(console.error)
  }

  const sendMessage = async (text) => {
    if (!navigator.onLine || !activeList.value) return
    const userStore = useUserStore()

    // Тут можно добавить Optimistic Message, но пока отправляем сразу
    const query = `
      mutation($listId: ID!, $text: String!, $user: UserInput!) {
        sendMessage(listId: $listId, text: $text, user: $user) {
          id sender avatar text timestamp
        }
      }
    `
    try {
      const data = await gplClient(query, {
        listId: activeList.value.id,
        text,
        user: { username: userStore.user.username, avatar: userStore.user.avatar }
      })
      if (data.sendMessage) {
        if (!activeList.value.messages) activeList.value.messages = []
        activeList.value.messages.push(data.sendMessage)
        await saveListsToDb()
      }
    } catch(e) {
      console.error(e)
    }
  }

  // === UI ACTIONS ===
  const selectList = (id) => {
    activeListId.value = id
    isBestShopsOpen.value = false // Сбрасываем вкладку магазинов
  }
  const backToListSelector = () => {
    activeListId.value = null
    isBestShopsOpen.value = false
  }

  const openBestShops = () => { isBestShopsOpen.value = true }
  const closeBestShops = () => { isBestShopsOpen.value = false }

  const startViewing = (item) => { viewingItem.value = item }
  const cancelViewing = () => { viewingItem.value = null }
  const startEditing = (item) => { cancelViewing(); editingItem.value = { ...item } }
  const cancelEdit = () => { editingItem.value = null }

  const showAddItemForm = () => { isAddItemFormVisible.value = true }
  const hideAddItemForm = () => { isAddItemFormVisible.value = false }

  const toggleTotalsSidebar = () => { isTotalsSidebarOpen.value = !isTotalsSidebarOpen.value }
  const closeTotalsSidebar = () => { isTotalsSidebarOpen.value = false }

  const toggleTotalsModal = () => { isTotalsModalOpen.value = !isTotalsModalOpen.value }

  const toggleChat = () => { isChatOpen.value = !isChatOpen.value }
  const closeChat = () => { isChatOpen.value = false }

  const toggleHelpSidebar = () => { isHelpSidebarOpen.value = !isHelpSidebarOpen.value }

  const saveEdit = async () => {
    if (!editingItem.value) return
    // Простая реализация: обновление через API и локально
    // В продакшене добавить валидацию и офлайн-очередь
    alert("Edit works only online for now (Impl needed)")
  }

  // === RETURN EVERYTHING ===
  return {
    // State
    lists, activeListId, isLoading, isAddingItem, isOnline,
    isShareModalOpen, editingItem, viewingItem,
    isAddItemFormVisible, isTotalsSidebarOpen, isTotalsModalOpen, isChatOpen,
    isHelpSidebarOpen, isBestShopsOpen,

    // Getters
    activeList, groupedItems, totals,

    // Actions DB/API
    fetchLists, fetchListById, createList, addItem, removeItem, toggleItem,
    syncPendingActions, sendMessage, saveEdit,

    // Actions UI
    selectList, backToListSelector,
    openBestShops, closeBestShops, // <--- Важно для BestShops
    startViewing, cancelViewing, startEditing, cancelEdit,
    showAddItemForm, hideAddItemForm,
    toggleTotalsSidebar, closeTotalsSidebar, toggleTotalsModal,
    toggleChat, closeChat, toggleHelpSidebar
  }
})
