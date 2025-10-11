'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useGame } from '@/context/GameContext'
import SyncStatusIndicator from './SyncStatusIndicator'

export default function AccountManagementScreen() {
  const { user, signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword, resetPassword, signOut, deleteAccount, error, clearError } = useAuth()
  const { state, dispatch } = useGame()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setLocalError('')
      clearError()
      await signInWithGoogle()
      // User ID will be set in GameContainer
    } catch (error: any) {
      setLocalError(error.message)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    if (!email || !password) {
      setLocalError('Please enter email and password')
      return
    }

    try {
      await signInWithEmailPassword(email, password)
      // User ID will be set in GameContainer
      setEmail('')
      setPassword('')
    } catch (error: any) {
      setLocalError(error.message)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    if (!email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    try {
      await signUpWithEmailPassword(email, password)
      // User ID will be set in GameContainer
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setLocalError(error.message)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()
    setSuccessMessage('')

    if (!email) {
      setLocalError('Please enter your email address')
      return
    }

    try {
      await resetPassword(email)
      setSuccessMessage('Password reset email sent! Check your inbox.')
      setEmail('')
      setTimeout(() => {
        setShowForgotPassword(false)
        setSuccessMessage('')
      }, 3000)
    } catch (error: any) {
      setLocalError(error.message)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      dispatch({ type: 'SET_USER_ID', payload: null })
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'idle' })
    } catch (error: any) {
      setLocalError(error.message)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount()
      dispatch({ type: 'SET_USER_ID', payload: null })
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'idle' })
      setShowDeleteConfirm(false)
    } catch (error: any) {
      setLocalError(error.message)
      setShowDeleteConfirm(false)
    }
  }

  const handleBack = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'parentMode' })
  }

  if (state.currentScreen !== 'accountManagement') {
    return null
  }

  const displayError = error || localError

  return (
    <div className="flex flex-col items-center justify-start p-8 h-full w-full transition-opacity duration-500 overflow-y-auto">
      <h2 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-6">Account Management</h2>
      
      {displayError && (
        <div className="w-full max-w-lg mb-4 p-4 bg-red-500 text-white rounded-lg">
          {displayError}
        </div>
      )}

      {successMessage && (
        <div className="w-full max-w-lg mb-4 p-4 bg-green-500 text-white rounded-lg">
          {successMessage}
        </div>
      )}

      {!user ? (
        // Sign In Section
        <div className="w-full max-w-lg space-y-6">
          <div className="bg-gray-800 p-6 rounded-xl border-2 border-gray-600">
            <p className="text-center text-gray-300 mb-6">
              Sign in to sync your levels across devices
            </p>

            {showForgotPassword ? (
              // Forgot Password Form
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <h3 className="text-xl font-bold text-center">Reset Password</h3>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 text-lg bg-gray-700 text-white"
                />
                <button
                  type="submit"
                  className="w-full btn-game px-6 py-3 rounded-full text-lg font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  Send Reset Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setEmail('')
                    setLocalError('')
                  }}
                  className="w-full text-gray-400 hover:text-gray-300 text-sm"
                >
                  Back to Sign In
                </button>
              </form>
            ) : isSignUp ? (
              // Sign Up Form
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <h3 className="text-xl font-bold text-center">Create Account</h3>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 text-lg bg-gray-700 text-white"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 characters)"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 text-lg bg-gray-700 text-white"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 text-lg bg-gray-700 text-white"
                />
                <button
                  type="submit"
                  className="w-full btn-game px-6 py-3 rounded-full text-lg font-bold text-white bg-green-500 hover:bg-green-600 transition-colors"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false)
                    setPassword('')
                    setConfirmPassword('')
                    setLocalError('')
                  }}
                  className="w-full text-gray-400 hover:text-gray-300 text-sm"
                >
                  Already have an account? Sign In
                </button>
              </form>
            ) : (
              // Sign In Form
              <div className="space-y-4">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 text-lg bg-gray-700 text-white"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 text-lg bg-gray-700 text-white"
                  />
                  <button
                    type="submit"
                    className="w-full btn-game px-6 py-3 rounded-full text-lg font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                  >
                    Sign In
                  </button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">OR</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  className="w-full btn-game px-6 py-3 rounded-full text-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>

                <div className="flex justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true)
                      setLocalError('')
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true)
                      setLocalError('')
                    }}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Account Info Section
        <div className="w-full max-w-lg space-y-6">
          <div className="bg-gray-800 p-6 rounded-xl border-2 border-gray-600">
            <h3 className="text-xl font-bold mb-4 text-center">Account Information</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="text-lg text-white break-all">{user.email}</p>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Cloud Backup</p>
                <SyncStatusIndicator status={state.syncStatus} variant="pill" />
              </div>

              <button
                onClick={handleSignOut}
                className="w-full btn-game px-6 py-3 rounded-full text-lg font-bold text-white bg-gray-600 hover:bg-gray-500 transition-colors"
              >
                Sign Out
              </button>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full btn-game px-6 py-3 rounded-full text-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
                    <p className="text-center text-yellow-200 font-semibold mb-2">
                      ⚠️ This will permanently delete:
                    </p>
                    <ul className="text-sm text-yellow-100 space-y-1">
                      <li>• Your account information</li>
                      <li>• Your cloud backup, including levels and words</li>
                    </ul>
                    <p className="text-center text-yellow-300 font-bold mt-3">
                      This cannot be undone!
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 btn-game px-6 py-3 rounded-full text-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      Yes, Delete My Data
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 btn-game px-6 py-3 rounded-full text-lg font-bold text-white bg-gray-600 hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleBack}
        className="btn-game px-6 py-2 rounded-full text-sm font-bold text-gray-400 bg-gray-700 hover:bg-gray-600 transition-colors mt-6"
      >
        Back to Parent Mode
      </button>
    </div>
  )
}

