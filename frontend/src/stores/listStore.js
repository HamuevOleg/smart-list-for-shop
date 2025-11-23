import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { gplClient } from '@/api/gplClient'
import { useUserStore } from './userStore'

export const useListStore = defineStore('list', () => {
  // --- STATE ---
  const lists = ref([])
  const activeListId = ref(null)
  const isLoading = ref(false)
  const isAddingItem = ref(false)

  // --- UI STATE ---
  const isShareModalOpen = ref(false)
  const editingItem = ref(null)
  const viewingItem = ref(null)
  const isAddItemFormVisible = ref(false)
  const isTotalsSidebarOpen = ref(false)

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

  // --- ACTIONS ---
  const fetchLists = async () => {
    isLoading.value = true
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
    } catch (e) {
      console.error('Failed to load lists:', e)
    } finally {
      isLoading.value = false
    }
  }

  // Обновленный fetchListById (теперь запрашивает и сообщения)
  const fetchListById = async (id, { background = false } = {}) => {
    if (!background) isLoading.value = true

    const userStore = useUserStore()

    const query = `
      query($id: ID!, $user: UserInput) {
        listById(id: $id, user: $user) {
          id
          name
          items {
            id name quantity unit category dueDate comment priceStore1 priceStore2 userPrice completed imageUrl
            addedBy addedByAvatar completedBy completedByAvatar
          }
          participants {
            username avatar lastSeen
          }
          # Запрашиваем сообщения чата
          messages {
            id sender avatar text timestamp
          }
        }
      }
    `

    try {
      const user = userStore.isRegistered
        ? { username: userStore.user.username, avatar: userStore.user.avatar }
        : null

      const data = await gplClient(query, { id, user })

      if (data.listById) {
        lists.value = [data.listById]
        activeListId.value = data.listById.id
      } else {
        if (!background) console.error('List not found by ID')
        activeListId.value = null
      }
    } catch (e) {
      console.error('Failed to load list by ID:', e)
      activeListId.value = null
    } finally {
      if (!background) isLoading.value = false
    }
  }

  const createList = async (name) => {
    const query = `
      mutation($name: String!) {
        createList(name: $name) { id name items { id } }
      }
    `
    try {
      const data = await gplClient(query, { name: name || 'New List' })
      lists.value.push(data.createList)
      activeListId.value = data.createList.id
    } catch (e) {
      console.error('Failed to create list:', e)
    }
  }

  const addItem = async (item) => {
    if (!activeList.value) return
    const userStore = useUserStore()
    if (!userStore.isRegistered) return

    isAddingItem.value = true

    const listId = activeList.value.id
    const { __typename, ...itemInput } = item
    try {
      const createQuery = `
        mutation($listId: ID!, $itemInput: AddItemInput!, $user: UserInput!) {
          addItem(listId: $listId, itemInput: $itemInput, user: $user) {
            id name quantity unit category dueDate comment priceStore1 priceStore2 userPrice completed imageUrl
            addedBy addedByAvatar completedBy completedByAvatar
          }
        }
      `
      const { imageUrl, ...createInput } = itemInput
      const user = { username: userStore.user.username, avatar: userStore.user.avatar }

      const createData = await gplClient(createQuery, { listId, itemInput: createInput, user })
      let newItem = createData.addItem

      if (newItem.name) {
        const searchQuery = `query($query: String!) { searchImages(query: $query) }`
        const searchData = await gplClient(searchQuery, { query: newItem.name })

        if (searchData.searchImages && searchData.searchImages.length > 0) {
          const foundImageUrl = searchData.searchImages[0]
          const updateInput = {
            name: newItem.name, quantity: newItem.quantity, unit: newItem.unit,
            category: newItem.category, dueDate: newItem.dueDate, comment: newItem.comment,
            priceStore1: newItem.priceStore1, priceStore2: newItem.priceStore2,
            userPrice: newItem.userPrice, imageUrl: foundImageUrl
          }
          const updateQuery = `
            mutation($listId: ID!, $itemId: ID!, $itemInput: UpdateItemInput!) {
              updateItem(listId: $listId, itemId: $itemId, itemInput: $itemInput) {
                id name quantity unit category dueDate comment priceStore1 priceStore2 userPrice completed imageUrl
                addedBy addedByAvatar completedBy completedByAvatar
              }
            }
          `
          const updateData = await gplClient(updateQuery, { listId, itemId: newItem.id, itemInput: updateInput })
          newItem = updateData.updateItem
        }
      }

      activeList.value.items = [newItem, ...activeList.value.items]
      isAddItemFormVisible.value = false
    } catch (e) {
      console.error('Failed to add item:', e)
    } finally {
      isAddingItem.value = false
    }
  }

  const removeItem = async (itemId) => {
    if (!activeList.value) return
    const listId = activeList.value.id
    const index = activeList.value.items.findIndex((i) => i.id === itemId)
    if (index === -1) return
    const removedItem = activeList.value.items.splice(index, 1)[0]
    const query = `mutation($listId: ID!, $itemId: ID!) { removeItem(listId: $listId, itemId: $itemId) }`
    try {
      await gplClient(query, { listId, itemId })
    } catch (e) {
      console.error('Failed to remove item:', e)
      activeList.value.items.splice(index, 0, removedItem)
      alert('Failed to remove item. Try again.')
    }
  }

  const toggleItem = async (itemId) => {
    if (!activeList.value) return
    const userStore = useUserStore()

    const listId = activeList.value.id
    const item = activeList.value.items.find((i) => i.id === itemId)
    if (!item) return
    const newCompletedState = !item.completed

    const query = `
      mutation($listId: ID!, $itemId: ID!, $completed: Boolean!, $user: UserInput!) {
        toggleItem(listId: $listId, itemId: $itemId, completed: $completed, user: $user) {
          id completed completedBy completedByAvatar
        }
      }
    `
    try {
      item.completed = newCompletedState
      if (newCompletedState) {
        item.completedBy = userStore.user.username
        item.completedByAvatar = userStore.user.avatar
      } else {
        item.completedBy = null
        item.completedByAvatar = null
      }

      const user = { username: userStore.user.username, avatar: userStore.user.avatar }
      await gplClient(query, { listId, itemId, completed: newCompletedState, user })
    } catch (e) {
      console.error('Failed to toggle item:', e)
      item.completed = !newCompletedState
    }
  }

  const saveEdit = async () => {
    if (!editingItem.value || !activeList.value) return
    const listId = activeList.value.id
    const itemId = editingItem.value.id
    const { id, completed, addedBy, addedByAvatar, completedBy, completedByAvatar, __typename, ...itemInput } = editingItem.value
    try {
      if (!itemInput.imageUrl && itemInput.name) {
        const searchQuery = `query($query: String!) { searchImages(query: $query) }`
        const searchData = await gplClient(searchQuery, { query: itemInput.name })
        if (searchData.searchImages && searchData.searchImages.length > 0) {
          itemInput.imageUrl = searchData.searchImages[0]
        }
      }
      const updateQuery = `
        mutation($listId: ID!, $itemId: ID!, $itemInput: UpdateItemInput!) {
          updateItem(listId: $listId, itemId: $itemId, itemInput: $itemInput) {
            id name quantity unit category dueDate comment priceStore1 priceStore2 userPrice completed imageUrl
            addedBy addedByAvatar completedBy completedByAvatar
          }
        }
      `
      const data = await gplClient(updateQuery, { listId, itemId, itemInput })
      const index = activeList.value.items.findIndex((i) => i.id === itemId)
      if (index !== -1) {
        activeList.value.items[index] = data.updateItem
      }
      editingItem.value = null
    } catch (e) {
      console.error('Failed to update item:', e)
    }
  }

  // --- НОВАЯ ФУНКЦИЯ ОТПРАВКИ СООБЩЕНИЯ ---
  const sendMessage = async (text) => {
    if (!activeList.value) return
    const userStore = useUserStore()

    const query = `
      mutation($listId: ID!, $text: String!, $user: UserInput!) {
        sendMessage(listId: $listId, text: $text, user: $user) {
          id sender avatar text timestamp
        }
      }
    `

    try {
      const user = { username: userStore.user.username, avatar: userStore.user.avatar }
      const data = await gplClient(query, { listId: activeList.value.id, text, user })

      // Оптимистичное добавление (сразу видим сообщение)
      if (!activeList.value.messages) activeList.value.messages = []
      activeList.value.messages.push(data.sendMessage)

    } catch (e) {
      console.error('Failed to send message', e)
    }
  }

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

  return {
    lists, activeListId, isLoading, isShareModalOpen, editingItem, viewingItem,
    isAddItemFormVisible, isTotalsSidebarOpen, isAddingItem,
    activeList, groupedItems, totals,
    fetchLists, fetchListById, selectList, backToListSelector, createList, addItem,
    removeItem, toggleItem, startEditing, saveEdit, cancelEdit, startViewing, cancelViewing,
    showAddItemForm, hideAddItemForm, toggleTotalsSidebar, closeTotalsSidebar,
    sendMessage // Экспортируем новую функцию
  }
})
