import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { gplClient } from '@/api/gplClient'
import { useUserStore } from './userStore'
import { db } from '@/db'
import { v4 as uuidv4 } from 'uuid'

export const useListStore = defineStore('list', () => {
  // --- STATE ---
  const lists = ref([])
  const activeListId = ref(null)
  const isLoading = ref(false)
  const isAddingItem = ref(false)
  const isOnline = ref(navigator.onLine)

  // --- UI STATE ---
  const isShareModalOpen = ref(false)
  const editingItem = ref(null)
  const viewingItem = ref(null)
  const isAddItemFormVisible = ref(false)
  const isTotalsSidebarOpen = ref(false)
  const isTotalsModalOpen = ref(false)
  const isChatOpen = ref(false)

  // --- GETTERS ---
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
    if (!activeList.value) return { store1: 0, store2: 0, user: 0, diff: 0 }
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

  // --- HELPER: SAVE LOCAL ---
  const saveListsToDb = async () => {
    // Save a deep copy to avoid Proxy issues with Dexie
    const plainLists = JSON.parse(JSON.stringify(lists.value))
    await db.lists.bulkPut(plainLists)
  }

  // --- ACTIONS ---

  // 1. Fetch Lists (Local DB first, then Network)
  const fetchLists = async () => {
    isLoading.value = true

    // Load from local DB immediately
    const localLists = await db.lists.toArray()
    if (localLists.length > 0) {
      lists.value = localLists
    }

    // If offline, stop here
    if (!navigator.onLine) {
      isLoading.value = false
      return
    }

    // Try to update from network
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
      lists.value = data.allLists
      await saveListsToDb() // Update cache
    } catch (e) {
      console.error('Offline mode active or Server Error:', e)
    } finally {
      isLoading.value = false
    }
  }

  // 2. Fetch List by ID
  const fetchListById = async (id, { background = false } = {}) => {
    if (!background) isLoading.value = true

    // Check local first
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
          // Merge logic: Keep pending items, overwrite others with server data
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

  // 3. Create List
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

  // 4. Add Item (OFFLINE FIRST)
  const addItem = async (item) => {
    if (!activeList.value) return
    const userStore = useUserStore()

    // Generate temp ID and set status to pending
    const tempId = uuidv4()
    const listId = activeList.value.id

    const newItem = {
      ...item,
      id: tempId,
      syncStatus: 'pending', // IMPORTANT: UI Marker
      completed: false,
      addedBy: userStore.user.username,
      addedByAvatar: userStore.user.avatar
    }

    // 1. Optimistic UI Update
    activeList.value.items.unshift(newItem)
    isAddItemFormVisible.value = false
    await saveListsToDb()

    // 2. Create Sync Task
    const syncTask = {
      type: 'ADD_ITEM',
      listId: listId,
      tempId: tempId,
      payload: { ...item }, // send raw data without ID or syncStatus
      user: { username: userStore.user.username, avatar: userStore.user.avatar }
    }

    // 3. If online, send immediately
    if (navigator.onLine) {
      processSyncItem(syncTask)
    } else {
      // Otherwise, add to queue
      await db.syncQueue.add(syncTask)
    }
  }

  // 5. Process Single Sync Task
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

        // Replace temporary item with server item
        const list = lists.value.find(l => l.id === task.listId)
        if (list) {
          const index = list.items.findIndex(i => i.id === task.tempId)
          if (index !== -1) {
            list.items[index] = data.addItem // Has real ID, no syncStatus
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
        // Note: If item was created offline and doesn't have a server ID yet, this will fail.
        // Queue processing should ideally be sequential.
        await gplClient(query, {
          listId: task.listId,
          itemId: task.itemId,
          completed: task.completed,
          user: task.user
        })
      }

      // Remove from queue on success
      if (task.id) await db.syncQueue.delete(task.id)

    } catch (e) {
      console.error('Sync failed for task', task, e)
      // If task didn't have an ID (immediate call), save it to retry later
      if (!task.id) await db.syncQueue.add(task)
    }
  }

  // 6. Global Synchronizer (Called when network returns)
  const syncPendingActions = async () => {
    if (!navigator.onLine) return
    const tasks = await db.syncQueue.toArray()
    if (tasks.length === 0) return

    console.log(`Syncing ${tasks.length} offline actions...`)

    // Process sequentially
    for (const task of tasks) {
      await processSyncItem(task)
    }
  }

  // 7. Toggle Item (Offline Support)
  const toggleItem = async (itemId) => {
    if (!activeList.value) return
    const userStore = useUserStore()
    const item = activeList.value.items.find(i => i.id === itemId)
    if (!item) return

    // Optimistic UI
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

  // Remove Item (Online only for safety for now)
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

  // UI Toggles
  const selectList = (id) => { activeListId.value = id }
  const backToListSelector = () => { activeListId.value = null }
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

  // Edit (Online only placeholder)
  const saveEdit = async () => {
    // Implement QUEUE logic here for offline editing support
    alert("Edit works only online for now")
  }

  // Send Message (Online only placeholder)
  const sendMessage = async (text) => {
    if(!navigator.onLine) return
    // ... same as before ...
  }

  return {
    lists, activeListId, isLoading, isShareModalOpen, editingItem, viewingItem,
    isAddItemFormVisible, isTotalsSidebarOpen, isTotalsModalOpen, isChatOpen, isAddingItem,
    activeList, groupedItems, totals,
    fetchLists, fetchListById, createList, addItem, removeItem, toggleItem,
    selectList, backToListSelector, startViewing, cancelViewing, startEditing, cancelEdit, saveEdit,
    showAddItemForm, hideAddItemForm, toggleTotalsSidebar, closeTotalsSidebar, toggleTotalsModal,
    toggleChat, closeChat, sendMessage,
    syncPendingActions // Export this to call from App.vue
  }
})
