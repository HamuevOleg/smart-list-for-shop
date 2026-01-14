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
  const isBestShopsOpen = ref(false)

  // === GETTERS ===
  const activeList = computed(() => {
    return lists.value.find((list) => list.id === activeListId.value)
  })

  const groupedItems = computed(() => {
    if (!activeList.value) return {}
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

    for (const item of activeList.value.items) {
      if (item.completed) continue
      const p1 = Number(item.priceStore1) || 0
      const p2 = Number(item.priceStore2) || 0
      const pUser = Number(item.userPrice) || 0

      if (p1 > 0) total1 += p1
      if (p2 > 0) total2 += p2
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
    const plainLists = JSON.parse(JSON.stringify(lists.value))
    await db.lists.bulkPut(plainLists)
  }

  const fetchLists = async () => {
    isLoading.value = true

    const localLists = await db.lists.toArray()
    if (localLists.length > 0) {
      lists.value = localLists
    }

    if (!navigator.onLine) {
      isLoading.value = false
      return
    }

    // --- ВАЖНО: Добавлено createdAt в запрос ---
    const query = `
      query {
        allLists {
          id name owner
          items {
            id name quantity unit category dueDate comment
            priceStore1 priceStore2 userPrice completed imageUrl createdAt
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
    // --- ВАЖНО: Добавлено createdAt в запрос ---
    const query = `
      query($id: ID!, $user: UserInput) {
        listById(id: $id, user: $user) {
          id name owner
          items {
            id name quantity unit category dueDate comment
            priceStore1 priceStore2 userPrice completed imageUrl createdAt
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
          const pendingItems = lists.value[index].items.filter(i => i.syncStatus === 'pending')
          const serverItems = data.listById.items
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
      throw e
    }
  }

  const deleteList = async (id) => {
    if (!navigator.onLine) {
      alert('You need internet connection to delete a list.')
      return
    }

    const query = `mutation($id: ID!) { deleteList(id: $id) }`

    try {
      const data = await gplClient(query, { id })

      if (data.deleteList) {
        lists.value = lists.value.filter(l => l.id !== id)
        await db.lists.delete(id)
        if (activeListId.value === id) {
          activeListId.value = null
        }
      } else {
        throw new Error("Failed to delete list (Server returned false)")
      }
    } catch (e) {
      console.error("Delete List Error:", e)
      throw e
    }
  }

  const addItem = async (item) => {
    if (!activeList.value) return
    const userStore = useUserStore()

    const tempId = uuidv4()
    const listId = activeList.value.id

    const newItem = {
      ...item,
      id: tempId,
      syncStatus: 'pending',
      completed: false,
      addedBy: userStore.user.username,
      addedByAvatar: userStore.user.avatar,
      // ВАЖНО: Добавляем дату локально, чтобы график обновился мгновенно
      createdAt: String(Date.now())
    }

    activeList.value.items.unshift(newItem)
    isAddItemFormVisible.value = false
    await saveListsToDb()

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
        // --- ВАЖНО: Добавлено createdAt в ответ мутации ---
        const query = `
          mutation($listId: ID!, $itemInput: AddItemInput!, $user: UserInput!) {
            addItem(listId: $listId, itemInput: $itemInput, user: $user) {
              id name quantity unit category dueDate comment
              priceStore1 priceStore2 userPrice completed imageUrl createdAt
              addedBy addedByAvatar completedBy completedByAvatar
            }
          }
        `
        const data = await gplClient(query, {
          listId: task.listId,
          itemInput: task.payload,
          user: task.user
        })

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

      if (task.id) await db.syncQueue.delete(task.id)

    } catch (e) {
      console.error('Sync failed for task', task, e)
      if (!task.id) await db.syncQueue.add(task)
    }
  }

  const syncPendingActions = async () => {
    if (!navigator.onLine) return
    const tasks = await db.syncQueue.toArray()
    if (tasks.length === 0) return

    for (const task of tasks) {
      await processSyncItem(task)
    }
  }

  const toggleItem = async (itemId) => {
    if (!activeList.value) return
    const userStore = useUserStore()

    const item = activeList.value.items.find(i => i.id === itemId)
    if (!item) return

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

    if (!navigator.onLine) {
      alert("Delete requires internet for now (Safety reasons)")
      return
    }

    const listId = activeList.value.id
    const index = activeList.value.items.findIndex((i) => i.id === itemId)
    if (index === -1) return

    activeList.value.items.splice(index, 1)
    await saveListsToDb()

    const query = `mutation($listId: ID!, $itemId: ID!) { removeItem(listId: $listId, itemId: $itemId) }`
    gplClient(query, { listId, itemId }).catch(console.error)
  }

  const sendMessage = async (text) => {
    if (!navigator.onLine || !activeList.value) return
    const userStore = useUserStore()

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
    isBestShopsOpen.value = false
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
    alert("Edit works only online for now (Impl needed)")
  }

  // === RETURN EVERYTHING ===
  return {
    lists, activeListId, isLoading, isAddingItem, isOnline,
    isShareModalOpen, editingItem, viewingItem,
    isAddItemFormVisible, isTotalsSidebarOpen, isTotalsModalOpen, isChatOpen,
    isHelpSidebarOpen, isBestShopsOpen,

    activeList, groupedItems, totals,

    fetchLists,
    fetchListById,
    createList,
    deleteList,
    addItem,
    removeItem,
    toggleItem,
    syncPendingActions,
    sendMessage,
    saveEdit,

    selectList, backToListSelector,
    openBestShops, closeBestShops,
    startViewing, cancelViewing, startEditing, cancelEdit,
    showAddItemForm, hideAddItemForm,
    toggleTotalsSidebar, closeTotalsSidebar, toggleTotalsModal,
    toggleChat, closeChat, toggleHelpSidebar
  }
})
