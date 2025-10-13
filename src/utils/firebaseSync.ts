import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore'
import { getFirebaseDb } from '@/config/firebase'

interface Level {
  name: string
  words: string[]
}

interface FirestoreData {
  levels: Record<string, Level>
  levelOrder: string[]
  lastModified: Timestamp
}

interface LocalData {
  levels: Record<string, Level>
  levelOrder: string[]
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

let syncUnsubscribe: Unsubscribe | null = null

/**
 * Upload levels to Firestore
 */
export const syncToFirestore = async (
  userId: string,
  levels: Record<string, Level>,
  levelOrder: string[]
): Promise<void> => {
  try {
    const firebaseDb = getFirebaseDb()
    if (!firebaseDb) {
      throw new Error('Firebase not initialized')
    }
    
    const userDocRef = doc(firebaseDb, 'users', userId, 'gameData', 'levels')
    const data: FirestoreData = {
      levels,
      levelOrder,
      lastModified: Timestamp.now(),
    }
    await setDoc(userDocRef, data)
  } catch (error) {
    console.error('Error syncing to Firestore:', error)
    throw error
  }
}

/**
 * Download levels from Firestore
 */
export const syncFromFirestore = async (
  userId: string
): Promise<{ levels: Record<string, Level>; levelOrder: string[] } | null> => {
  try {
    const firebaseDb = getFirebaseDb()
    if (!firebaseDb) {
      throw new Error('Firebase not initialized')
    }
    
    const userDocRef = doc(firebaseDb, 'users', userId, 'gameData', 'levels')
    const docSnap = await getDoc(userDocRef)

    if (docSnap.exists()) {
      const data = docSnap.data() as FirestoreData
      if (!data.levels) {
        return null // Handle malformed data
      }
      return {
        levels: data.levels,
        levelOrder: data.levelOrder || Object.keys(data.levels) // fallback for old data
      }
    }
    return null
  } catch (error) {
    console.error('Error syncing from Firestore:', error)
    throw error
  }
}

/**
 * Merge local and remote data with conflict resolution
 * Strategy: Last write wins based on timestamp
 */
export const mergeData = async (
  userId: string,
  localLevels: Record<string, Level>,
  localLevelOrder: string[],
  localLastModified: number
): Promise<{ levels: Record<string, Level>; levelOrder: string[]; lastModified: number }> => {
  try {
    const firebaseDb = getFirebaseDb()
    if (!firebaseDb) {
      throw new Error('Firebase not initialized')
    }
    
    const userDocRef = doc(firebaseDb, 'users', userId, 'gameData', 'levels')
    const docSnap = await getDoc(userDocRef)

    if (!docSnap.exists()) {
      // No remote data, upload local data
      await syncToFirestore(userId, localLevels, localLevelOrder)
      return { levels: localLevels, levelOrder: localLevelOrder, lastModified: localLastModified }
    }

    const remoteData = docSnap.data() as FirestoreData
    if (!remoteData.lastModified) {
      // If remote data has no timestamp, use local data
      await syncToFirestore(userId, localLevels, localLevelOrder)
      return { levels: localLevels, levelOrder: localLevelOrder, lastModified: localLastModified }
    }
    const remoteTimestamp = remoteData.lastModified.toMillis()


    // Compare actual timestamps to determine which is newer
    if (localLastModified > remoteTimestamp) {
      // Local is newer, upload to Firestore
      await syncToFirestore(userId, localLevels, localLevelOrder)
      return { levels: localLevels, levelOrder: localLevelOrder, lastModified: localLastModified }
    } else {
      // Remote is newer or same, use remote data
      return { 
        levels: remoteData.levels, 
        levelOrder: remoteData.levelOrder || Object.keys(remoteData.levels), // fallback for old data
        lastModified: remoteTimestamp 
      }
    }
  } catch (error) {
    console.error('Error merging data:', error)
    throw error
  }
}

/**
 * Enable real-time sync listener
 * Returns unsubscribe function
 */
export const enableAutoSync = (
  userId: string,
  onUpdate: (levels: Record<string, Level>, levelOrder: string[], lastModified: number) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  // Unsubscribe from previous listener if exists
  if (syncUnsubscribe) {
    syncUnsubscribe()
  }

  const firebaseDb = getFirebaseDb()
  if (!firebaseDb) {
    const error = new Error('Firebase not initialized')
    onError(error)
    return () => {} // Return empty unsubscribe function
  }

  const userDocRef = doc(firebaseDb, 'users', userId, 'gameData', 'levels')

  syncUnsubscribe = onSnapshot(
    userDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as FirestoreData
        onUpdate(
          data.levels, 
          data.levelOrder || Object.keys(data.levels), // fallback for old data
          data.lastModified.toMillis()
        )
      }
    },
    (error) => {
      console.error('Error in auto-sync listener:', error)
      onError(error)
    }
  )

  return syncUnsubscribe
}

/**
 * Disable real-time sync listener
 */
export const disableAutoSync = (): void => {
  if (syncUnsubscribe) {
    syncUnsubscribe()
    syncUnsubscribe = null
  }
}

/**
 * Check if offline
 */
export const isOffline = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false // Server-side, assume online
  }
  return !navigator.onLine
}

