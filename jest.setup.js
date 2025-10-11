import '@testing-library/jest-dom'
import { 
  mockAuthStateManager, 
  mockFirestoreManager, 
  createMockTimestamp,
  clearAllFirebaseMocks 
} from './src/__tests__/mocks/firebaseMocks'

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn().mockReturnValue({}),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    setCustomParameters: jest.fn(),
  })),
  connectAuthEmulator: jest.fn(),
  signInWithPopup: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  deleteUser: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn().mockReturnValue({}),
  connectFirestoreEmulator: jest.fn(),
  doc: jest.fn().mockImplementation((db, ...pathSegments) => ({
    path: pathSegments.join('/'),
    id: pathSegments[pathSegments.length - 1],
  })),
  getDoc: mockFirestoreManager.getDoc,
  setDoc: mockFirestoreManager.setDoc,
  deleteDoc: mockFirestoreManager.deleteDoc,
  onSnapshot: mockFirestoreManager.onSnapshot,
  Timestamp: {
    now: jest.fn(() => createMockTimestamp()),
  },
}))

// Mock Firebase config
jest.mock('@/config/firebase', () => ({
  auth: {},
  db: {},
  googleProvider: {
    setCustomParameters: jest.fn(),
  },
  getFirebaseAuth: jest.fn(() => ({})),
  getFirebaseDb: jest.fn(() => ({})),
  getGoogleProvider: jest.fn(() => ({
    setCustomParameters: jest.fn(),
  })),
}))

// Note: AuthContext is not mocked globally - individual tests can mock it if needed

// Note: GameContext is not mocked globally - individual tests can mock it if needed


// Mock Speech Synthesis API
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(() => [
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
    { name: 'Alex', lang: 'en-US' },
  ]),
  onvoiceschanged: null,
}

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  voice: null,
  rate: 1,
  pitch: 1,
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Global test cleanup
beforeEach(() => {
  clearAllFirebaseMocks()
  
  // Set up default mock implementations
  const { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, deleteUser } = require('firebase/auth')
  
  // Default successful implementations
  signInWithPopup.mockImplementation(() => Promise.resolve({ user: mockAuthStateManager.currentUser }))
  signInWithEmailAndPassword.mockImplementation(() => Promise.resolve({ user: mockAuthStateManager.currentUser }))
  createUserWithEmailAndPassword.mockImplementation(() => Promise.resolve({ user: mockAuthStateManager.currentUser }))
  signOut.mockImplementation(() => Promise.resolve())
  sendPasswordResetEmail.mockImplementation(() => Promise.resolve())
  deleteUser.mockImplementation(() => Promise.resolve())
  
  // Set up onAuthStateChanged to use our mock manager
  onAuthStateChanged.mockImplementation(mockAuthStateManager.onAuthStateChanged)
})
