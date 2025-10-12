import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth as FirebaseAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, Firestore as FirebaseFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAnalytics, Analytics } from 'firebase/analytics'

// Utility functions
const isBrowser = () => typeof window !== 'undefined'

const isEmulatorMode = (): boolean => {
  if (!isBrowser()) return false
  return window.location.hostname === 'localhost' && process.env.NODE_ENV === 'development'
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Validate environment variables (only in browser environment)
if (isBrowser()) {
  const missingVars = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key)
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env.local file and ensure all Firebase configuration values are set.'
    )
  }
}

// Initialize Firebase app (singleton pattern)
let app: FirebaseApp | null = null
let firebaseAuth: FirebaseAuth | null = null
let firebaseDb: FirebaseFirestore | null = null
let firebaseGoogleProvider: GoogleAuthProvider | null = null
let firebaseAnalytics: Analytics | null = null

// Initialize Firebase services
const initializeFirebase = () => {
  if (!isBrowser()) {
    return { app: null, auth: null, db: null, googleProvider: null, analytics: null }
  }

  // Only initialize once
  if (app) {
    return { app, auth: firebaseAuth, db: firebaseDb, googleProvider: firebaseGoogleProvider, analytics: firebaseAnalytics }
  }

  try {
    // Initialize Firebase app
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

    // Initialize services
    firebaseAuth = getAuth(app)
    firebaseDb = getFirestore(app)
    firebaseGoogleProvider = new GoogleAuthProvider()
    firebaseGoogleProvider.setCustomParameters({ prompt: 'select_account' })

    // Handle emulator vs production mode
    if (isEmulatorMode()) {
      connectToEmulators()
      firebaseAnalytics = null // Skip analytics in emulator mode
    } else {
      initializeAnalytics(app)
    }

    return { app, auth: firebaseAuth, db: firebaseDb, googleProvider: firebaseGoogleProvider, analytics: firebaseAnalytics }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error)
    throw error
  }
}

// Connect to Firebase emulators
const connectToEmulators = () => {
  try {
    connectAuthEmulator(firebaseAuth!, 'http://localhost:9099', { disableWarnings: true })
    connectFirestoreEmulator(firebaseDb!, 'localhost', 8080)
    console.log('✅ Firebase Emulators connected (Auth: 9099, Firestore: 8080)')
    console.log('ℹ️ Skipping Analytics initialization in emulator mode')
  } catch (error: any) {
    if (!error.message?.includes('already been called') && !error.message?.includes('already connected')) {
      console.warn('⚠️ Firebase Emulators not available. Using production Firebase.')
      console.warn('To use emulators, run: firebase emulators:start')
    }
  }
}

// Initialize Analytics in production mode
const initializeAnalytics = (app: FirebaseApp) => {
  try {
    firebaseAnalytics = getAnalytics(app)
    console.log('✅ Firebase Analytics initialized')
  } catch (error) {
    console.warn('⚠️ Firebase Analytics initialization failed:', error)
    firebaseAnalytics = null
  }
}

// Initialize Firebase services
const firebaseServices = initializeFirebase()

// Generic getter function to reduce repetition
const createServiceGetter = <T>(serviceKey: keyof typeof firebaseServices): (() => T | null) => {
  return (): T | null => {
    if (!isBrowser()) return null
    return (firebaseServices[serviceKey] || initializeFirebase()[serviceKey]) as T | null
  }
}

// Export services with proper SSR/SSG handling
export const getFirebaseAuth = createServiceGetter<FirebaseAuth>('auth')
export const getFirebaseDb = createServiceGetter<FirebaseFirestore>('db')
export const getGoogleProvider = createServiceGetter<GoogleAuthProvider>('googleProvider')
export const getFirebaseAnalytics = createServiceGetter<Analytics>('analytics')

// Export utility function
export { isEmulatorMode }

// Legacy exports for backward compatibility (will be null in SSR/SSG)
// Note: These exports are deprecated. Use getFirebaseAuth(), getFirebaseDb(), getGoogleProvider(), getFirebaseAnalytics() instead
export const auth = firebaseServices.auth
export const db = firebaseServices.db  
export const googleProvider = firebaseServices.googleProvider
export const analytics = firebaseServices.analytics

