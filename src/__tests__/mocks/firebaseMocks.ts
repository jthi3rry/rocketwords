import { User } from 'firebase/auth'
import { Timestamp } from 'firebase/firestore'

// Mock User structure
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  uid: 'mock-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  tenantId: null,
  providerData: [],
  refreshToken: 'mock-refresh-token',
  providerId: 'firebase',
  ...overrides,
})

// Mock Timestamp
export const createMockTimestamp = (date?: number | Date): Timestamp => {
  let d: Date
  if (typeof date === 'number') {
    d = new Date(date)
  } else if (date instanceof Date) {
    d = date
  } else {
    d = new Date()
  }
  return {
    toMillis: () => d.getTime(),
    toDate: () => d,
    isEqual: (other: Timestamp) => d.getTime() === other.toMillis(),
  } as Timestamp
}

// Mock Firebase Error Codes
export const FirebaseErrorCodes = {
  NETWORK_REQUEST_FAILED: 'auth/network-request-failed',
  PERMISSION_DENIED: 'auth/permission-denied',
  UNAVAILABLE: 'auth/unavailable',
  UNAUTHENTICATED: 'auth/unauthenticated',
  NOT_FOUND: 'auth/not-found',
  ALREADY_EXISTS: 'auth/already-exists',
  FAILED_PRECONDITION: 'auth/failed-precondition',
  ABORTED: 'auth/aborted',
  OUT_OF_RANGE: 'auth/out-of-range',
  UNIMPLEMENTED: 'auth/unimplemented',
  INTERNAL: 'auth/internal',
  DATA_LOSS: 'auth/data-loss',
  POPUP_CLOSED_BY_USER: 'auth/popup-closed-by-user',
  CANCELLED_POPUP_REQUEST: 'auth/cancelled-popup-request',
  INVALID_EMAIL: 'auth/invalid-email',
  USER_DISABLED: 'auth/user-disabled',
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',
}

// Mock Firebase Error
export const createMockFirebaseError = (code: string, message?: string): Error => {
  const error = new Error(message || `Firebase error: ${code}`)
  ;(error as any).code = code
  return error
}

// Simple mock auth state manager
export class MockAuthStateManager {
  private listeners: Array<(user: User | null) => void> = []
  private _currentUser: User | null = null

  onAuthStateChanged = (auth: any, callback?: (user: User | null) => void) => {
    // Handle both (auth, callback) and (callback) signatures
    if (typeof auth === 'function') {
      callback = auth
      auth = null
    }

    if (typeof callback !== 'function') {
      console.warn('onAuthStateChanged called with non-function callback:', callback)
      return () => {}
    }

    this.listeners.push(callback)
    // Immediately call with current state
    try {
      callback(this._currentUser)
    } catch (error) {
      console.warn('Error calling auth state callback:', error)
    }

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  setUser(user: User | null) {
    this._currentUser = user
    this.listeners.forEach(listener => {
      if (typeof listener === 'function') {
        try {
          listener(user)
        } catch (error) {
          console.warn('Error calling auth state listener:', error)
        }
      }
    })
  }

  clearListeners() {
    this.listeners = []
  }

  get currentUser() {
    return this._currentUser
  }
}

// Simple mock firestore manager
export class MockFirestoreManager {
  private data: Record<string, any> = {}
  private listeners: Record<string, Array<(doc: any) => void>> = {}

  setDocument(path: string, data: any) {
    this.data[path] = { ...data, lastModified: createMockTimestamp() }
    this.notifyListeners(path)
  }

  getDocument(path: string) {
    return this.data[path]
  }

  clearDocument(path: string) {
    delete this.data[path]
    this.notifyListeners(path)
  }

  getDoc = jest.fn(async (docRef: any) => {
    const data = this.data[docRef.path]
    return {
      exists: () => !!data,
      data: () => data,
      id: docRef.id,
    }
  })

  setDoc = jest.fn(async (docRef: any, data: any) => {
    this.setDocument(docRef.path, data)
  })

  deleteDoc = jest.fn(async (docRef: any) => {
    this.clearDocument(docRef.path)
  })

  onSnapshot = jest.fn((docRef: any, callback: (doc: any) => void) => {
    if (!this.listeners[docRef.path]) {
      this.listeners[docRef.path] = []
    }
    this.listeners[docRef.path].push(callback)

    // Initial call
    callback({
      exists: () => !!this.data[docRef.path],
      data: () => this.data[docRef.path],
      id: docRef.id,
    })

    return () => {
      this.listeners[docRef.path] = this.listeners[docRef.path].filter(
        listener => listener !== callback
      )
    }
  })

  clearAll() {
    this.data = {}
    this.listeners = {}
  }

  private notifyListeners(path: string) {
    if (this.listeners[path]) {
      this.listeners[path].forEach(callback =>
        callback({
          exists: () => !!this.data[path],
          data: () => this.data[path],
          id: path.split('/').pop(),
        })
      )
    }
  }
}

// Create instances
export const mockAuthStateManager = new MockAuthStateManager()
export const mockFirestoreManager = new MockFirestoreManager()

// Clear all mocks
export const clearAllFirebaseMocks = () => {
  mockAuthStateManager.setUser(null)
  mockFirestoreManager.data = {}
  mockFirestoreManager.listeners = {}
  jest.clearAllMocks()
}

// Helper to create mock Firestore data
export const createMockFirestoreData = (overrides: any = {}) => ({
  levels: {
    level1: { name: 'Level 1', words: ['mock1', 'mock2'] },
  },
  lastModified: createMockTimestamp(),
  ...overrides,
})
