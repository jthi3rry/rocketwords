// Re-export the actual firebaseSync functions for integration testing
export {
  syncToFirestore,
  syncFromFirestore,
  mergeData,
  enableAutoSync,
  disableAutoSync,
  isOffline
} from '../../../utils/firebaseSync'

// Additional test utilities for firebaseSync
import { 
  mockFirestoreManager, 
  createMockFirestoreData,
  createMockTimestamp 
} from '../../mocks/firebaseMocks'

export const createTestLevels = (overrides: any = {}) => ({
  level1: { name: 'Level 1', words: ['test1', 'test2'] },
  level2: { name: 'Level 2', words: ['test3', 'test4'] },
  ...overrides,
})

export const createTestFirestoreData = (overrides: any = {}) => 
  createMockFirestoreData(overrides)

export const setTestDocument = (path: string, data: any) => {
  mockFirestoreManager.setDocument(path, data)
}

export const getTestDocument = (path: string) => {
  return mockFirestoreManager.getDocument(path)
}

export const clearTestDocument = (path: string) => {
  mockFirestoreManager.clearDocument(path)
}

export const clearAllTestData = () => {
  mockFirestoreManager.clearAll()
}
