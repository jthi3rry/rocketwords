'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  deleteUser,
} from 'firebase/auth'
import { doc, deleteDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/config/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInWithEmailPassword: (email: string, password: string) => Promise<void>
  signUpWithEmailPassword: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleError = (error: any) => {
    let message = 'An error occurred'
    
    if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address'
    } else if (error.code === 'auth/user-disabled') {
      message = 'This account has been disabled'
    } else if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email'
    } else if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password'
    } else if (error.code === 'auth/email-already-in-use') {
      message = 'An account with this email already exists'
    } else if (error.code === 'auth/weak-password') {
      message = 'Password should be at least 6 characters'
    } else if (error.code === 'auth/popup-closed-by-user') {
      message = 'Sign-in popup was closed'
    } else if (error.code === 'auth/cancelled-popup-request') {
      message = 'Sign-in cancelled'
    } else if (error.message) {
      message = error.message
    }
    
    setError(message)
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      setLoading(true)
      await signInWithPopup(auth, googleProvider)
    } catch (error: any) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const signUpWithEmailPassword = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      handleError(error)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await firebaseSignOut(auth)
    } catch (error: any) {
      handleError(error)
    }
  }

  const deleteAccount = async () => {
    try {
      setError(null)
      if (user) {
        // Delete user's Firestore data first
        const userDocRef = doc(db, 'users', user.uid, 'gameData', 'levels')
        await deleteDoc(userDocRef)
        
        // Then delete the Firebase Auth account
        await deleteUser(user)
      }
    } catch (error: any) {
      handleError(error)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signInWithEmailPassword,
        signUpWithEmailPassword,
        resetPassword,
        signOut,
        deleteAccount,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

