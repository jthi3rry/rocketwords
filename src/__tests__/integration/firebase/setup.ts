import { 
  mockAuthStateManager, 
  mockFirestoreManager, 
  createMockUser,
  createMockFirestoreData,
  clearAllFirebaseMocks 
} from '../../mocks/firebaseMocks'

// Integration test setup and teardown
export const setupIntegrationTests = async () => {
  // Clear all mocks before starting
  clearAllFirebaseMocks()
  
  // Set up default test environment
  process.env.NODE_ENV = 'test'
}

export const teardownIntegrationTests = async () => {
  // Clean up after tests
  clearAllFirebaseMocks()
  
  // Reset environment
  delete process.env.NODE_ENV
}

// Test user management
export const createTestUser = (overrides: any = {}) => {
  const user = createMockUser(overrides)
  mockAuthStateManager.setUser(user)
  return user
}

export const signInTestUser = async (user: any) => {
  mockAuthStateManager.setUser(user)
  return Promise.resolve({ user })
}

export const signOutTestUser = async () => {
  mockAuthStateManager.setUser(null)
  return Promise.resolve()
}

export const waitForAuthState = (expectedUser: any = null, timeout = 1000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const checkAuthState = () => {
      const currentUser = mockAuthStateManager.currentUser
      
      if (expectedUser === null && currentUser === null) {
        resolve()
        return
      }
      
      if (expectedUser && currentUser && currentUser.uid === expectedUser.uid) {
        resolve()
        return
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Auth state did not change to expected state within ${timeout}ms`))
        return
      }
      
      setTimeout(checkAuthState, 10)
    }
    
    checkAuthState()
  })
}

export const createTestUserData = (userId: string, overrides: any = {}) => {
  const data = createMockFirestoreData(overrides)
  const path = `users/${userId}/gameData/levels`
  mockFirestoreManager.setDocument(path, data)
  return data
}

// Helper to simulate network errors
export const simulateNetworkError = (errorCode: string = 'auth/network-request-failed') => {
  const { getDoc, setDoc, onSnapshot } = require('firebase/firestore')
  
  getDoc.mockRejectedValueOnce(new Error(`Firebase error: ${errorCode}`))
  setDoc.mockRejectedValueOnce(new Error(`Firebase error: ${errorCode}`))
  onSnapshot.mockImplementationOnce((docRef: any, onNext: any, onError: any) => {
    if (onError) {
      onError(new Error(`Firebase error: ${errorCode}`))
    }
    return () => {}
  })
}

// Helper to simulate permission errors
export const simulatePermissionError = () => {
  simulateNetworkError('auth/permission-denied')
}
