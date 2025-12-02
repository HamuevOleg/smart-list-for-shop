import Dexie from 'dexie'

export const db = new Dexie('SmartListDatabase')

db.version(1).stores({
  lists: 'id, name', // Stores the lists themselves
  syncQueue: '++id, type, status' // Queue for offline actions
})
