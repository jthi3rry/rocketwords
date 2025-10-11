import { 
  createMockUser,
  createMockFirestoreData,
  mockAuthStateManager,
  mockFirestoreManager 
} from '../../mocks/firebaseMocks'

// Helper functions for integration tests

export const createTestUserWithData = (userOverrides: any = {}, dataOverrides: any = {}) => {
  const user = createMockUser(userOverrides)
  const data = createMockFirestoreData(dataOverrides)
  
  // Set user in auth manager
  mockAuthStateManager.setUser(user)
  
  // Set user data in firestore manager
  const path = `users/${user.uid}/gameData/levels`
  mockFirestoreManager.setDocument(path, data)
  
  return { user, data }
}

export const signInTestUserWithData = async (user: any, data: any) => {
  mockAuthStateManager.setUser(user)
  const path = `users/${user.uid}/gameData/levels`
  mockFirestoreManager.setDocument(path, data)
  return Promise.resolve({ user })
}

export const createMultipleTestUsers = (count: number = 3) => {
  const users = []
  for (let i = 0; i < count; i++) {
    const user = createMockUser({
      uid: `test-user-${i}`,
      email: `test${i}@example.com`,
      displayName: `Test User ${i}`
    })
    const data = createMockFirestoreData({
      levels: {
        [`level${i}`]: { name: `Level ${i}`, words: [`word${i}1`, `word${i}2`] }
      }
    })
    
    const path = `users/${user.uid}/gameData/levels`
    mockFirestoreManager.setDocument(path, data)
    users.push({ user, data })
  }
  return users
}

export const testWithInvalidUser = () => {
  // Create a user with invalid/missing data
  const user = createMockUser({
    uid: 'invalid-user',
    email: 'invalid@example.com'
  })
  
  // Don't set any data for this user
  mockAuthStateManager.setUser(user)
  
  return user
}

// Helper to simulate different network conditions
export const simulateNetworkConditions = {
  online: () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
  },
  
  offline: () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })
  }
}

// Helper to create test scenarios
export const createTestScenarios = {
  // User with no data
  newUser: () => {
    const user = createMockUser({ uid: 'new-user' })
    mockAuthStateManager.setUser(user)
    return user
  },
  
  // User with existing data
  existingUser: (dataOverrides: any = {}) => {
    const user = createMockUser({ uid: 'existing-user' })
    const data = createMockFirestoreData(dataOverrides)
    const path = `users/${user.uid}/gameData/levels`
    mockFirestoreManager.setDocument(path, data)
    mockAuthStateManager.setUser(user)
    return { user, data }
  },
  
  // User with corrupted data
  corruptedUser: () => {
    const user = createMockUser({ uid: 'corrupted-user' })
    const corruptedData = {
      levels: null, // Invalid data
      lastModified: 'invalid-timestamp'
    }
    const path = `users/${user.uid}/gameData/levels`
    mockFirestoreManager.setDocument(path, corruptedData)
    mockAuthStateManager.setUser(user)
    return { user, data: corruptedData }
  }
}

// Helper to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper to create test timestamps
export const createTestTimestamps = {
  now: () => Date.now(),
  past: (hoursAgo: number = 1) => Date.now() - (hoursAgo * 60 * 60 * 1000),
  future: (hoursFromNow: number = 1) => Date.now() + (hoursFromNow * 60 * 60 * 1000)
}

// Additional helpers for sync integration tests
export const createUserWithFirestoreData = (userOverrides: any = {}, dataOverrides: any = {}) => {
  return createTestUserWithData(userOverrides, dataOverrides)
}

export const createConflictingData = () => {
  const user1 = createMockUser({ uid: 'user1' })
  const user2 = createMockUser({ uid: 'user2' })
  
  const data1 = createMockFirestoreData({
    levels: { level1: { name: 'Level 1', words: ['word1', 'word2'] } },
    lastModified: createMockTimestamp(Date.now() - 1000)
  })
  
  const data2 = createMockFirestoreData({
    levels: { level1: { name: 'Level 1', words: ['word3', 'word4'] } },
    lastModified: createMockTimestamp(Date.now())
  })
  
  return { user1, user2, data1, data2 }
}

export const waitForRealtimeUpdate = (timeout: number = 1000): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

export const measureSyncTime = async (syncFunction: () => Promise<any>): Promise<number> => {
  const start = Date.now()
  await syncFunction()
  return Date.now() - start
}

export const createTimestampedData = (timestamp: number, overrides: any = {}) => {
  return createMockFirestoreData({
    lastModified: createMockTimestamp(timestamp),
    ...overrides
  })
}
