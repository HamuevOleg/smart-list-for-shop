import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { gplClient } from '@/api/gplClient'

export const useListStore = defineStore('list', () => {
  // --- STATE ---
  const lists = ref([])
  const activeListId = ref(null)
  const isLoading = ref(false)

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
      console.error('Failed to load lists:', e)
    } finally {
      isLoading.value = false
    }
  }

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
      const data = await gplClient(query, { name: name || 'New List' })
      lists.value.push(data.createList)
      activeListId.value = data.createList.id
    } catch (e) {
      console.error('Failed to create list:', e)
    }
  }

  const addItem = async (item) => {
    if (!activeList.value) return
    const listId = activeList.value.id
    const { __typename, ...itemInput } = item

    console.log('📦 Adding item (before AI):', itemInput)

    try {
      // 1. Create item WITHOUT image
      const createQuery = `
        mutation($listId: ID!, $itemInput: AddItemInput!) {
          addItem(listId: $listId, itemInput: $itemInput) {
            id name quantity unit category dueDate comment priceStore1 priceStore2 userPrice completed imageUrl
          }
        }
      `
      const { imageUrl, ...createInput } = itemInput
      const createData = await gplClient(createQuery, { listId, itemInput: createInput })

      let newItem = createData.addItem
      console.log('✅ Item created (from server):', newItem)

      // 2. Search for image
      if (newItem.name) {
        console.log(`🔍 Searching image for: ${newItem.name}`)
        const searchQuery = `
          query($query: String!) {
            searchImages(query: $query)
          }
        `
        const searchData = await gplClient(searchQuery, { query: newItem.name })

        // 3. If image found, UPDATE item
        if (searchData.searchImages && searchData.searchImages.length > 0) {
          const foundImageUrl = searchData.searchImages[0]
          console.log(`🖼️ Image found, updating: ${foundImageUrl}`)

          const updateInput = {
            name: newItem.name,
            quantity: newItem.quantity,
            unit: newItem.unit,
            category: newItem.category,
            dueDate: newItem.dueDate,
            comment: newItem.comment,
            priceStore1: newItem.priceStore1,
            priceStore2: newItem.priceStore2,
            userPrice: newItem.userPrice,
            imageUrl: foundImageUrl
          }

          const updateQuery = `
            mutation($listId: ID!, $itemId: ID!, $itemInput: UpdateItemInput!) {
              updateItem(listId: $listId, itemId: $itemId, itemInput: $itemInput) {
                id name quantity unit category dueDate comment priceStore1 priceStore2 userPrice completed imageUrl
              }
            }
          `
          const updateData = await gplClient(updateQuery, {
            listId: listId,
            itemId: newItem.id,
            itemInput: updateInput
          })

          newItem = updateData.updateItem
          console.log('🖼️ Item updated with image:', newItem)
        }
      }

      // 4. Add to UI
      console.log('➕ Adding final item to UI:', newItem)
      activeList.value.items = [newItem, ...activeList.value.items]
      console.log('📋 Full items list:', activeList.value.items)
      isAddItemFormVisible.value = false
    } catch (e) {
      console.error('Failed to add item:', e)
    }
  }

  const removeItem = async (itemId) => {
    if (!activeList.value) return
    const listId = activeList.value.id
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
    } catch (e) {
      console.error('Failed to remove item:', e)
      activeList.value.items.splice(index, 0, removedItem)
      alert('Failed to remove item. Try again.')
    }
  }

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
      item.completed = newCompletedState
      await gplClient(query, { listId, itemId, completed: newCompletedState })
    } catch (e) {
      console.error('Failed to toggle item:', e)
      item.completed = !newCompletedState
    }
  }

  const saveEdit = async () => {
    if (!editingItem.value || !activeList.value) return

    const listId = activeList.value.id
    const itemId = editingItem.value.id
    const { id, completed, __typename, ...itemInput } = editingItem.value

    try {
      if (!itemInput.imageUrl && itemInput.name) {
        console.log(`🔍 Searching image for: ${itemInput.name}`)
        const searchQuery = `
          query($query: String!) {
            searchImages(query: $query)
          }
        `
        const searchData = await gplClient(searchQuery, { query: itemInput.name })

        if (searchData.searchImages && searchData.searchImages.length > 0) {
          itemInput.imageUrl = searchData.searchImages[0]
          console.log(`🖼️ Image found: ${itemInput.imageUrl}`)
        }
      }

      const updateQuery = `
        mutation($listId: ID!, $itemId: ID!, $itemInput: UpdateItemInput!) {
          updateItem(listId: $listId, itemId: $itemId, itemInput: $itemInput) {
            id name quantity unit category dueDate comment priceStore1 priceStore2 userPrice completed imageUrl
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

  const startViewing = (item) => {
    viewingItem.value = item
  }

  const cancelViewing = () => {
    viewingItem.value = null
  }

  const startEditing = (item) => {
    cancelViewing()
    editingItem.value = { ...item }
  }

  const cancelEdit = () => {
    editingItem.value = null
  }

  const selectList = (id) => {
    activeListId.value = id
  }

  const backToListSelector = () => {
    activeListId.value = null
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

  return {
    lists,
    activeListId,
    isLoading,
    isShareModalOpen,
    editingItem,
    viewingItem,
    isAddItemFormVisible,
    isTotalsSidebarOpen,
    activeList,
    groupedItems,
    totals,
    fetchLists,
    selectList,
    backToListSelector,
    createList,
    addItem,
    removeItem,
    toggleItem,
    startEditing,
    saveEdit,
    cancelEdit,
    startViewing,
    cancelViewing,
    showAddItemForm,
    hideAddItemForm,
    toggleTotalsSidebar,
    closeTotalsSidebar,
  }
})
