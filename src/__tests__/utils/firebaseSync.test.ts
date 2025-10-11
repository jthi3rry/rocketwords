import {
  syncToFirestore,
  syncFromFirestore,
  mergeData,
  enableAutoSync,
  disableAutoSync,
  isOffline,
  SyncStatus
} from '@/utils/firebaseSync'
import { 
  createMockFirestoreData, 
  createMockTimestamp,
  createMockFirebaseError,
  FirebaseErrorCodes,
  mockFirestoreManager,
  simulateNetworkError
} from '../mocks/firebaseMocks'
import { 
  getDoc, 
  setDoc, 
  onSnapshot, 
  doc,
  Timestamp 
} from 'firebase/firestore'

// Mock Firebase modules
jest.mock('firebase/firestore')

const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>
const mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>
const mockDoc = doc as jest.MockedFunction<typeof doc>
const mockTimestamp = Timestamp as jest.Mocked<typeof Timestamp>

describe('firebaseSync', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFirestoreManager.clearAll()
  })

  describe('syncToFirestore', () => {
    it('should upload levels data successfully', async () => {
      const userId = 'test-user-123'
      const levels = {
        level1: { name: 'Level 1', words: ['cat', 'dog'] },
        level2: { name: 'Level 2', words: ['bird', 'fish'] }
      }

      mockSetDoc.mockResolvedValue(undefined)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      await syncToFirestore(userId, levels)

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'users', userId, 'gameData', 'levels')
      expect(mockSetDoc).toHaveBeenCalledWith(
        { path: `users/${userId}/gameData/levels` },
        expect.objectContaining({
          levels,
          lastModified: expect.any(Object)
        })
      )
    })

    it('should include timestamp in uploaded data', async () => {
      const userId = 'test-user-123'
      const levels = { level1: { name: 'Level 1', words: ['cat'] } }
      const mockTimestampValue = createMockTimestamp(1234567890)

      mockTimestamp.now.mockReturnValue(mockTimestampValue)
      mockSetDoc.mockResolvedValue(undefined)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      await syncToFirestore(userId, levels)

      expect(mockSetDoc).toHaveBeenCalledWith(
        { path: `users/${userId}/gameData/levels` },
        {
          levels,
          lastModified: mockTimestampValue
        }
      )
    })

    it('should handle network errors', async () => {
      const userId = 'test-user-123'
      const levels = { level1: { name: 'Level 1', words: ['cat'] } }
      const error = createMockFirebaseError(FirebaseErrorCodes.NETWORK_REQUEST_FAILED)

      mockSetDoc.mockRejectedValue(error)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      await expect(syncToFirestore(userId, levels)).rejects.toThrow('Firebase error: auth/network-request-failed')
    })

    it('should handle permission errors', async () => {
      const userId = 'test-user-123'
      const levels = { level1: { name: 'Level 1', words: ['cat'] } }
      const error = createMockFirebaseError(FirebaseErrorCodes.PERMISSION_DENIED)

      mockSetDoc.mockRejectedValue(error)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      await expect(syncToFirestore(userId, levels)).rejects.toThrow('Firebase error: auth/permission-denied')
    })
  })

  describe('syncFromFirestore', () => {
    it('should download existing data successfully', async () => {
      const userId = 'test-user-123'
      const mockData = createMockFirestoreData()
      const mockDocSnap = {
        exists: () => true,
        data: () => mockData
      }

      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      const result = await syncFromFirestore(userId)

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'users', userId, 'gameData', 'levels')
      expect(mockGetDoc).toHaveBeenCalled()
      expect(result).toEqual(mockData.levels)
    })

    it('should return null when document does not exist', async () => {
      const userId = 'test-user-123'
      const mockDocSnap = {
        exists: () => false,
        data: () => null
      }

      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      const result = await syncFromFirestore(userId)

      expect(result).toBeNull()
    })

    it('should handle network errors', async () => {
      const userId = 'test-user-123'
      const error = createMockFirebaseError(FirebaseErrorCodes.NETWORK_REQUEST_FAILED)

      mockGetDoc.mockRejectedValue(error)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      await expect(syncFromFirestore(userId)).rejects.toThrow('Firebase error: auth/network-request-failed')
    })

    it('should handle permission errors', async () => {
      const userId = 'test-user-123'
      const error = createMockFirebaseError(FirebaseErrorCodes.PERMISSION_DENIED)

      mockGetDoc.mockRejectedValue(error)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      await expect(syncFromFirestore(userId)).rejects.toThrow('Firebase error: auth/permission-denied')
    })
  })

  describe('mergeData', () => {
    it('should upload local data when no remote data exists', async () => {
      const userId = 'test-user-123'
      const localLevels = {
        level1: { name: 'Level 1', words: ['cat', 'dog'] }
      }
      const localLastModified = 1234567890

      const mockDocSnap = {
        exists: () => false,
        data: () => null
      }

      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockSetDoc.mockResolvedValue(undefined)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      const result = await mergeData(userId, localLevels, localLastModified)

      expect(mockSetDoc).toHaveBeenCalled()
      expect(result).toEqual({
        levels: localLevels,
        lastModified: localLastModified
      })
    })

    it('should use local data when local is newer', async () => {
      const userId = 'test-user-123'
      const localLevels = {
        level1: { name: 'Level 1', words: ['cat', 'dog', 'bird'] }
      }
      const localLastModified = 1234567890
      const remoteLastModified = 1234567800 // 90 seconds earlier

      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          levels: { level1: { name: 'Level 1', words: ['cat', 'dog'] } },
          lastModified: createMockTimestamp(remoteLastModified)
        })
      }

      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockSetDoc.mockResolvedValue(undefined)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      const result = await mergeData(userId, localLevels, localLastModified)

      expect(mockSetDoc).toHaveBeenCalled()
      expect(result).toEqual({
        levels: localLevels,
        lastModified: localLastModified
      })
    })

    it('should use remote data when remote is newer', async () => {
      const userId = 'test-user-123'
      const localLevels = {
        level1: { name: 'Level 1', words: ['cat', 'dog'] }
      }
      const localLastModified = 1234567800
      const remoteLastModified = 1234567890 // 90 seconds later
      const remoteLevels = {
        level1: { name: 'Level 1', words: ['cat', 'dog', 'bird'] }
      }

      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          levels: remoteLevels,
          lastModified: createMockTimestamp(remoteLastModified)
        })
      }

      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      const result = await mergeData(userId, localLevels, localLastModified)

      expect(mockSetDoc).not.toHaveBeenCalled()
      expect(result).toEqual({
        levels: remoteLevels,
        lastModified: remoteLastModified
      })
    })

    it('should use remote data when timestamps are equal', async () => {
      const userId = 'test-user-123'
      const localLevels = {
        level1: { name: 'Level 1', words: ['cat', 'dog'] }
      }
      const localLastModified = 1234567890
      const remoteLastModified = 1234567890 // Same timestamp
      const remoteLevels = {
        level1: { name: 'Level 1', words: ['cat', 'dog', 'bird'] }
      }

      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          levels: remoteLevels,
          lastModified: createMockTimestamp(remoteLastModified)
        })
      }

      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      const result = await mergeData(userId, localLevels, localLastModified)

      expect(mockSetDoc).not.toHaveBeenCalled()
      expect(result).toEqual({
        levels: remoteLevels,
        lastModified: remoteLastModified
      })
    })

    it('should handle network errors during merge', async () => {
      const userId = 'test-user-123'
      const localLevels = { level1: { name: 'Level 1', words: ['cat'] } }
      const localLastModified = 1234567890
      const error = createMockFirebaseError(FirebaseErrorCodes.NETWORK_REQUEST_FAILED)

      mockGetDoc.mockRejectedValue(error)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      await expect(mergeData(userId, localLevels, localLastModified)).rejects.toThrow('Firebase error: auth/network-request-failed')
    })
  })

  describe('enableAutoSync', () => {
    it('should set up real-time listener', () => {
      const userId = 'test-user-123'
      const onUpdate = jest.fn()
      const onError = jest.fn()

      mockOnSnapshot.mockReturnValue(() => {})
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      const unsubscribe = enableAutoSync(userId, onUpdate, onError)

      expect(mockOnSnapshot).toHaveBeenCalledWith(
        { path: `users/${userId}/gameData/levels` },
        expect.any(Function),
        expect.any(Function)
      )
      expect(typeof unsubscribe).toBe('function')
    })

    it('should call onUpdate when document exists', () => {
      const userId = 'test-user-123'
      const onUpdate = jest.fn()
      const onError = jest.fn()
      const mockData = createMockFirestoreData()

      let snapshotCallback: (snapshot: any) => void
      mockOnSnapshot.mockImplementation((docRef, callback, errorCallback) => {
        snapshotCallback = callback
        return () => {}
      })
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      enableAutoSync(userId, onUpdate, onError)

      // Simulate document update
      const mockDocSnap = {
        exists: () => true,
        data: () => mockData
      }
      snapshotCallback!(mockDocSnap)

      expect(onUpdate).toHaveBeenCalledWith(mockData.levels, mockData.lastModified.toMillis())
    })

    it('should not call onUpdate when document does not exist', () => {
      const userId = 'test-user-123'
      const onUpdate = jest.fn()
      const onError = jest.fn()

      let snapshotCallback: (snapshot: any) => void
      mockOnSnapshot.mockImplementation((docRef, callback, errorCallback) => {
        snapshotCallback = callback
        return () => {}
      })
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      enableAutoSync(userId, onUpdate, onError)

      // Simulate document that doesn't exist
      const mockDocSnap = {
        exists: () => false,
        data: () => null
      }
      snapshotCallback!(mockDocSnap)

      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('should call onError when listener encounters error', () => {
      const userId = 'test-user-123'
      const onUpdate = jest.fn()
      const onError = jest.fn()
      const error = createMockFirebaseError(FirebaseErrorCodes.PERMISSION_DENIED)

      let capturedErrorCallback: (error: any) => void
      mockOnSnapshot.mockImplementation((docRef, callback, errorCallback) => {
        capturedErrorCallback = errorCallback
        return () => {}
      })
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      enableAutoSync(userId, onUpdate, onError)

      // Simulate error
      capturedErrorCallback!(error)

      expect(onError).toHaveBeenCalledWith(error)
    })

    it('should unsubscribe from previous listener when called multiple times', () => {
      const userId = 'test-user-123'
      const onUpdate = jest.fn()
      const onError = jest.fn()
      const unsubscribe1 = jest.fn()
      const unsubscribe2 = jest.fn()

      mockOnSnapshot
        .mockReturnValueOnce(unsubscribe1)
        .mockReturnValueOnce(unsubscribe2)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      // First call
      enableAutoSync(userId, onUpdate, onError)
      expect(unsubscribe1).not.toHaveBeenCalled()

      // Second call should unsubscribe from first
      enableAutoSync(userId, onUpdate, onError)
      expect(unsubscribe1).toHaveBeenCalled()
    })
  })

  describe('disableAutoSync', () => {
    it('should unsubscribe from current listener', () => {
      const userId = 'test-user-123'
      const onUpdate = jest.fn()
      const onError = jest.fn()
      const unsubscribe = jest.fn()

      mockOnSnapshot.mockReturnValue(unsubscribe)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      enableAutoSync(userId, onUpdate, onError)
      disableAutoSync()

      expect(unsubscribe).toHaveBeenCalled()
    })

    it('should handle case when no listener is active', () => {
      // Should not throw
      expect(() => disableAutoSync()).not.toThrow()
    })

    it('should set syncUnsubscribe to null after disabling', () => {
      const userId = 'test-user-123'
      const onUpdate = jest.fn()
      const onError = jest.fn()
      const unsubscribe = jest.fn()

      mockOnSnapshot.mockReturnValue(unsubscribe)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      enableAutoSync(userId, onUpdate, onError)
      disableAutoSync()

      // Second call should not call unsubscribe again
      disableAutoSync()
      expect(unsubscribe).toHaveBeenCalledTimes(1)
    })
  })

  describe('isOffline', () => {
    it('should return false when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      })

      expect(isOffline()).toBe(false)
    })

    it('should return true when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      expect(isOffline()).toBe(true)
    })

    it('should return false when window is undefined (server-side)', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      // @ts-ignore
      delete global.navigator

      expect(isOffline()).toBe(false)

      global.window = originalWindow
      // @ts-ignore
      global.navigator = { onLine: true }
    })
  })

  describe('error handling', () => {
    it('should handle malformed data gracefully', async () => {
      const userId = 'test-user-123'
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          levels: null, // Malformed data
          lastModified: createMockTimestamp(1234567890)
        })
      }

      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      const result = await syncFromFirestore(userId)

      expect(result).toEqual(null)
    })

    it('should handle missing lastModified field', async () => {
      const userId = 'test-user-123'
      const localLevels = { level1: { name: 'Level 1', words: ['cat'] } }
      const localLastModified = 1234567890

      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          levels: { level1: { name: 'Level 1', words: ['cat', 'dog'] } },
          // Missing lastModified field
        })
      }

      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockDoc.mockReturnValue({ path: `users/${userId}/gameData/levels` } as any)

      // Should handle gracefully and use local data
      const result = await mergeData(userId, localLevels, localLastModified)

      expect(mockSetDoc).toHaveBeenCalled()
      expect(result).toEqual({
        levels: localLevels,
        lastModified: localLastModified
      })
    })
  })
})
