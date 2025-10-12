import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth as FirebaseAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, Firestore as FirebaseFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAnalytics, Analytics } from 'firebase/analytics'

// Environment variable validation
const requiredEnvVars = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Validate environment variables (only in browser environment)
<<<<<<< Updated upstream
const missingEnvVars = Object.entries(requiredEnvVars)
=======
const requiredEnvVarsForValidation = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const missingEnvVars = Object.entries(requiredEnvVarsForValidation)
>>>>>>> Stashed changes
  .filter(([key, value]) => !value)
  .map(([key]) => key)

// Only throw error in browser environment, not during build/SSR
if (typeof window !== 'undefined' && missingEnvVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingEnvVars.join(', ')}. ` +
    'Please check your .env.local file and ensure all Firebase configuration values are set.'
  )
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: requiredEnvVars.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: requiredEnvVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: requiredEnvVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase app (singleton pattern)
let app: FirebaseApp | null = null
let firebaseAuth: FirebaseAuth | null = null
let firebaseDb: FirebaseFirestore | null = null
let firebaseGoogleProvider: GoogleAuthProvider | null = null
let firebaseAnalytics: Analytics | null = null

// Initialize Firebase services
const initializeFirebase = () => {
  if (typeof window === 'undefined') {
    // Return null values for SSR/SSG contexts
    return { app: null, auth: null, db: null, googleProvider: null, analytics: null }
  }

  // Only initialize once
  if (app) {
    return { app, auth: firebaseAuth, db: firebaseDb, googleProvider: firebaseGoogleProvider, analytics: firebaseAnalytics }
  }

  try {
    // Initialize Firebase app
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }

    // Initialize services
    firebaseAuth = getAuth(app)
    firebaseDb = getFirestore(app)
    firebaseGoogleProvider = new GoogleAuthProvider()
    
    // Initialize Analytics (browser only)
    try {
      firebaseAnalytics = getAnalytics(app)
    } catch (error) {
      console.warn('⚠️ Firebase Analytics initialization failed:', error)
      firebaseAnalytics = null
    }
    
    // Customize Google provider settings
    firebaseGoogleProvider.setCustomParameters({
      prompt: 'select_account'
    })

    // Connect to Firebase Emulators in development
    const isLocalhost = window.location.hostname === 'localhost'
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isLocalhost && isDevelopment) {
      try {
        // Try to connect to emulators (will fail if already connected)
        connectAuthEmulator(firebaseAuth, 'http://localhost:9099', { disableWarnings: true })
        console.log('✅ Firebase Auth Emulator connected')
        
        connectFirestoreEmulator(firebaseDb, 'localhost', 8080)
        console.log('✅ Firebase Firestore Emulator connected')
      } catch (error: any) {
        // Only log error if it's not about already being connected
        if (!error.message?.includes('already been called') && !error.message?.includes('already connected')) {
          console.warn('⚠️ Firebase Emulators not available. Using production Firebase.')
          console.warn('To use emulators, run: firebase emulators:start')
        }
      }
    }

    return { app, auth: firebaseAuth, db: firebaseDb, googleProvider: firebaseGoogleProvider, analytics: firebaseAnalytics }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error)
    throw error
  }
}

// Initialize Firebase services
const firebaseServices = initializeFirebase()

// Export services with proper SSR/SSG handling
export const getFirebaseAuth = (): FirebaseAuth | null => {
  if (typeof window === 'undefined') return null
  return firebaseServices.auth || initializeFirebase().auth
}

export const getFirebaseDb = (): FirebaseFirestore | null => {
  if (typeof window === 'undefined') return null
  return firebaseServices.db || initializeFirebase().db
}

export const getGoogleProvider = (): GoogleAuthProvider | null => {
  if (typeof window === 'undefined') return null
  return firebaseServices.googleProvider || initializeFirebase().googleProvider
}

<<<<<<< Updated upstream
=======
export const getFirebaseAnalytics = (): Analytics | null => {
  if (typeof window === 'undefined') return null
  return firebaseServices.analytics || initializeFirebase().analytics
}


>>>>>>> Stashed changes
// Legacy exports for backward compatibility (will be null in SSR/SSG)
// Note: These exports are deprecated. Use getFirebaseAuth(), getFirebaseDb(), getGoogleProvider(), getFirebaseAnalytics() instead
export const auth = firebaseServices.auth
export const db = firebaseServices.db  
export const googleProvider = firebaseServices.googleProvider
export const analytics = firebaseServices.analytics

