'use client'

import { useState, useEffect, useRef } from 'react'
import { useGame } from '@/context/GameContext'
import { useAuth } from '@/context/AuthContext'
import SyncStatusIndicator from './SyncStatusIndicator'
import { getFirstLevelKey, getSortedLevelKeys, getSortedLevelKeysExcluding, formatWord } from '@/utils/gameUtils'
import BackButton from './BackButton'

export default function ParentModeScreen() {
  const { state, dispatch } = useGame()
  const { user, deleteAccount, signOut, loading } = useAuth()

  // Helper function to determine account type
  const getAccountTypeIcon = () => {
    if (!user) return '🔗'
    
    // Check if user signed in with Google
    const isGoogleAccount = user.providerData.some(provider => provider.providerId === 'google.com')
    
    if (isGoogleAccount) {
      return (
        <img 
          src="/assets/icons/google-logo.svg" 
          alt="Google" 
          className="w-4 h-4"
        />
      )
    } else {
      return '✉️' // Email icon
    }
  }
  const [selectedLevel, setSelectedLevel] = useState('')
  const [newLevelName, setNewLevelName] = useState('')
  const [levelName, setLevelName] = useState('')
  const [newWord, setNewWord] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [wordToDelete, setWordToDelete] = useState<string | null>(null)
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false)
  const [showDeletionSuccess, setShowDeletionSuccess] = useState(false)
  const [showAddLevelInput, setShowAddLevelInput] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const addLevelTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const firstLevelKey = getFirstLevelKey(state.levels)
    if (firstLevelKey && !selectedLevel) {
      setSelectedLevel(firstLevelKey)
    }
  }, [state.levels, selectedLevel])

  // Update levelName when selectedLevel changes
  useEffect(() => {
    if (selectedLevel && state.levels[selectedLevel]) {
      setLevelName(state.levels[selectedLevel].name)
    }
  }, [selectedLevel, state.levels])

  const handleAddLevel = () => {
    const newName = newLevelName.trim()
    if (newName) {
      const newKey = `level_${Date.now()}`
      dispatch({
        type: 'ADD_LEVEL',
        payload: {
          key: newKey,
          level: { name: newName, words: [] }
        }
      })
      setNewLevelName('')
      setSelectedLevel(newKey)
      setLevelName(newName) // Set the level name for the new level
      setShowAddLevelInput(false) // Hide the input after creating
    }
  }

  const handleShowAddLevelInput = () => {
    setShowAddLevelInput(true)
    setNewLevelName('')
  }

  const handleCancelAddLevel = () => {
    setShowAddLevelInput(false)
    setNewLevelName('')
  }

  const handleNewLevelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setNewLevelName(newName)
    
    // Clear existing timeout
    if (addLevelTimeoutRef.current) {
      clearTimeout(addLevelTimeoutRef.current)
    }
    
    // Only set timeout if input is not empty
    if (newName.trim()) {
      // Set new timeout for auto-save (2 second delay)
      addLevelTimeoutRef.current = setTimeout(() => {
        const trimmedName = newName.trim()
        if (trimmedName) {
          const newKey = `level_${Date.now()}`
          dispatch({
            type: 'ADD_LEVEL',
            payload: {
              key: newKey,
              level: { name: trimmedName, words: [] }
            }
          })
          setNewLevelName('')
          setSelectedLevel(newKey)
          setLevelName(trimmedName)
          setShowAddLevelInput(false)
        }
      }, 2000)
    }
  }

  const handleNewLevelNameBlur = () => {
    // Save immediately on blur only if not empty
    if (addLevelTimeoutRef.current) {
      clearTimeout(addLevelTimeoutRef.current)
    }
    const trimmedName = newLevelName.trim()
    if (trimmedName) {
      const newKey = `level_${Date.now()}`
      dispatch({
        type: 'ADD_LEVEL',
        payload: {
          key: newKey,
          level: { name: trimmedName, words: [] }
        }
      })
      setNewLevelName('')
      setSelectedLevel(newKey)
      setLevelName(trimmedName)
      setShowAddLevelInput(false)
    } else {
      // If empty, just exit add mode without creating a level
      setShowAddLevelInput(false)
      setNewLevelName('')
    }
  }

  const handleRemoveLevel = () => {
    if (Object.keys(state.levels).length > 1) {
      dispatch({ type: 'REMOVE_LEVEL', payload: selectedLevel })
      const remainingKeys = getSortedLevelKeysExcluding(state.levels, selectedLevel)
      setSelectedLevel(remainingKeys[0] || '')
      setShowDeleteConfirm(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const handleSaveLevelName = () => {
    const newName = levelName.trim()
    if (newName && state.levels[selectedLevel] && state.levels[selectedLevel].name !== newName) {
      dispatch({
        type: 'UPDATE_LEVEL_NAME',
        payload: {
          key: selectedLevel,
          name: newName
        }
      })
    }
  }

  const handleLevelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setLevelName(newName)
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Set new timeout for auto-save (1 second delay)
    saveTimeoutRef.current = setTimeout(() => {
      const trimmedName = newName.trim()
      if (trimmedName && state.levels[selectedLevel] && state.levels[selectedLevel].name !== trimmedName) {
        dispatch({
          type: 'UPDATE_LEVEL_NAME',
          payload: {
            key: selectedLevel,
            name: trimmedName
          }
        })
      }
    }, 1000)
  }

  const handleLevelNameBlur = () => {
    // Save immediately on blur
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    handleSaveLevelName()
  }

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      if (addLevelTimeoutRef.current) {
        clearTimeout(addLevelTimeoutRef.current)
      }
    }
  }, [])

  const handleAddWord = () => {
    const input = newWord.trim()
    if (input && state.levels[selectedLevel]) {
      // Split by spaces or commas, then clean up each word
      const words = input
        .split(/[,\s]+/) // Split by commas or spaces
        .map(word => word.trim().toLowerCase()) // Trim and lowercase each word
        .filter(word => word.length > 0) // Remove empty strings
        .filter(word => !state.levels[selectedLevel].words.includes(word)) // Remove duplicates
      
      // Add each word
      words.forEach(word => {
        dispatch({
          type: 'ADD_WORD',
          payload: {
            levelKey: selectedLevel,
            word: word
          }
        })
      })
      
      setNewWord('')
    }
  }

  const handleRemoveWord = (wordToRemove: string) => {
    dispatch({
      type: 'REMOVE_WORD',
      payload: {
        levelKey: selectedLevel,
        word: wordToRemove
      }
    })
    setWordToDelete(null)
  }

  const handleDeleteWordClick = (word: string) => {
    setWordToDelete(word)
  }

  const handleCancelWordDelete = () => {
    setWordToDelete(null)
  }



  const handleBack = () => {
    dispatch({ type: 'SET_PARENT_LOGIN', payload: false })
    dispatch({ type: 'RESET_GAME' })
    dispatch({ type: 'SET_SCREEN', payload: 'welcome' })
  }

  const handleAccountManagement = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'accountManagement' })
  }

  const handleSignOut = () => {
    signOut()
  }

  const handleDeleteAccount = () => {
    setShowDeleteAccountConfirm(true)
  }

  const handleConfirmDeleteAccount = async () => {
    try {
      await deleteAccount()
      // After successful deletion, user will be signed out automatically
      // Stay on parent mode page - user can continue managing words locally
      setShowDeletionSuccess(true)
      // Hide the success message after 5 seconds
      setTimeout(() => {
        setShowDeletionSuccess(false)
      }, 5000)
    } catch (error) {
      console.error('Error deleting account:', error)
    }
    setShowDeleteAccountConfirm(false)
  }

  const handleCancelDeleteAccount = () => {
    setShowDeleteAccountConfirm(false)
  }

  const currentWords = showAddLevelInput ? [] : (selectedLevel ? (state.levels[selectedLevel]?.words || []) : [])
  const canRemoveLevel = Object.keys(state.levels).length > 1

  // Parent mode works locally without authentication
  // Account management is only for cloud backup linking

  if (state.currentScreen !== 'parentMode') {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 h-full w-full transition-opacity duration-500 overflow-y-auto" style={{ touchAction: 'manipulation' }}>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-400 mb-2 sm:mb-3 text-center">Create Learning Adventures! 📚</h2>
      <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 text-center max-w-md">
        Add words and create levels to help your child learn and grow! 🌟
      </p>
      
      
      {/* Level Management Section */}
      <div className="w-full max-w-lg mb-4 sm:mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg sm:text-xl font-bold">Manage Levels 📚</h3>
          <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
            {Object.keys(state.levels).length} level{Object.keys(state.levels).length !== 1 ? 's' : ''}
          </span>
        </div>
        
      
        {/* Level Management */}
        <div className="p-3 bg-gray-800 rounded-lg border-2 border-gray-600">
          
          {/* Level Selector Pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Add New Level Pill */}
            <button
              onClick={handleShowAddLevelInput}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                showAddLevelInput
                  ? 'bg-green-500 text-white shadow-lg transform scale-105'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <span>+</span> Add
            </button>
            
            {getSortedLevelKeys(state.levels).map(key => (
              <div
                key={key}
                className={`group relative inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedLevel === key && !showAddLevelInput
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white'
                }`}
              >
                <button
                  onClick={() => {
                    setSelectedLevel(key)
                    setShowAddLevelInput(false) // Exit add mode when selecting existing level
                  }}
                  className="pr-1"
                >
                  {state.levels[key].name}
                </button>
                {!showDeleteConfirm && canRemoveLevel && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick()
                    }}
                    className="text-red-400 hover:text-red-300 font-bold text-xs p-0.5 rounded-full hover:bg-red-900/20 transition-colors"
                    title="Delete this level"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
      
          {/* Conditional UI based on add/edit mode */}
          {showAddLevelInput ? (
            /* Add New Level UI */
            <div className="flex gap-2 items-center">
              <input 
                type="text" 
                value={newLevelName}
                onChange={handleNewLevelNameChange}
                onBlur={handleNewLevelNameBlur}
                placeholder="e.g., 'Animals 🐱'" 
                className="flex-1 px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm bg-gray-700 text-white"
                autoFocus
              />
            </div>
          ) : (
            /* Edit Existing Level UI */
            <div className="flex gap-2 items-center">
              <input 
                type="text" 
                value={levelName}
                onChange={handleLevelNameChange}
                onBlur={handleLevelNameBlur}
                placeholder="Level name" 
                className="flex-1 px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm bg-gray-700 text-white"
              />
              {showDeleteConfirm && (
                <div className="flex gap-1">
                  <button 
                    onClick={handleCancelDelete}
                    className="btn-game px-2 py-2 rounded-lg text-xs font-bold text-gray-300 bg-gray-600 hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRemoveLevel}
                    className="btn-game px-2 py-2 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    Delete ✕
                  </button>
                </div>
              )}
            </div>
          )}
          
          {showDeleteConfirm && (
            <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-300">
                Delete &ldquo;<span className="font-semibold">{state.levels[selectedLevel]?.name}</span>&rdquo; and all {currentWords.length} word{currentWords.length !== 1 ? 's' : ''}?
              </p>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2">Changes save automatically ✨</p>
        </div>
      </div>

      {/* Manage Words Section */}
      <div className="w-full max-w-lg mb-4 sm:mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg sm:text-xl font-bold">
            {showAddLevelInput ? 'Words in New Level 📖' : 'Words in This Level 📖'}
          </h3>
          <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
            {currentWords.length} word{currentWords.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {currentWords.length === 0 ? (
          <div className="bg-gray-800 p-6 sm:p-8 rounded-xl border-2 border-dashed border-gray-600 text-center">
            <p className="text-gray-400 text-sm sm:text-base mb-2">No words yet! 🌱</p>
            <p className="text-gray-500 text-xs sm:text-sm">Add your first word below to get started</p>
          </div>
        ) : (
          <div className="bg-gray-800 p-3 sm:p-4 rounded-xl border-2 border-gray-600 max-h-48 sm:max-h-64 overflow-y-auto">
            {wordToDelete ? (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg mb-3">
                <p className="text-sm text-red-300 mb-3">
                  Delete &ldquo;<span className="font-semibold">{wordToDelete}</span>&rdquo;?
                </p>
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={handleCancelWordDelete}
                    className="btn-game px-3 py-1 rounded-full text-xs font-bold text-gray-300 bg-gray-600 hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleRemoveWord(wordToDelete)}
                    className="btn-game px-3 py-1 rounded-full text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    Delete ✕
                  </button>
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {currentWords.map((word, index) => (
                <div
                  key={index}
                  className="group relative inline-flex items-center px-3 py-1.5 bg-gray-700 rounded-full text-sm font-medium text-gray-200 hover:bg-gray-600 transition-colors"
                >
                  <span className="pr-1">{formatWord(word, state.isUpperCase)}</span>
                  <button 
                    onClick={() => handleDeleteWordClick(word)}
                    className="text-red-400 hover:text-red-300 font-bold text-xs p-0.5 rounded-full hover:bg-red-900/20 transition-colors"
                    title="Remove word"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="w-full max-w-lg mb-4 sm:mb-6 flex flex-col md:flex-row gap-2 items-center">
        <input 
          type="text" 
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Words (space or comma separated)... ✍️" 
          className="flex-grow px-3 py-2 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 text-sm bg-gray-800 text-white w-full md:w-auto"
        />
        <button 
          onClick={handleAddWord}
          className="btn-game px-3 py-2 rounded-full text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-colors w-full md:w-auto"
        >
          Add Words ➕
        </button>
      </div>
      
      {/* Cloud Backup Section */}
      <div className="w-full max-w-lg mt-6 sm:mt-8 mb-8 sm:mb-12">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg sm:text-xl font-bold">Cloud Backup ☁️</h3>
        </div>
        
        {user ? (
          /* Authenticated user - show account management */
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                {getAccountTypeIcon()}
              </div>
              <span className="text-sm text-gray-300 truncate flex-1 min-w-0">
                {user.email}
              </span>
              <div className="flex-shrink-0">
                <SyncStatusIndicator status={state.syncStatus} variant="pill" />
              </div>
            </div>
            
            {!showDeleteAccountConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSignOut}
                  className="btn-game px-3 py-2 rounded-lg text-sm font-bold text-white bg-gray-500 hover:bg-gray-600 transition-colors flex-1"
                >
                  Sign Out
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="btn-game px-3 py-2 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex-1"
                >
                  Delete Account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-3">
                  <p className="text-center text-yellow-200 font-semibold mb-2 text-sm">
                    ⚠️ This will permanently delete:
                  </p>
                  <ul className="text-xs text-yellow-100 space-y-1">
                    <li>• Your account information</li>
                    <li>• Your cloud backup, including levels and words</li>
                  </ul>
                  <p className="text-center text-yellow-300 font-bold mt-2 text-sm">
                    This cannot be undone!
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmDeleteAccount}
                    className="flex-1 btn-game px-3 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={handleCancelDeleteAccount}
                    className="flex-1 btn-game px-3 py-2 rounded-lg text-sm font-bold text-white bg-gray-600 hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* No authenticated user - show link account option */
          <div className="flex flex-col gap-3">
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
              <p className="text-center text-gray-200 font-semibold mb-2 text-sm">
                Link your account for cloud backup
              </p>
              <p className="text-xs text-gray-300 text-center">
                Your words and levels will be backed up and synced across devices
              </p>
            </div>
            <button
              onClick={handleAccountManagement}
              className="btn-game px-4 py-3 rounded-lg text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              Link Account
            </button>
          </div>
        )}
      </div>
      
      {/* Account Deletion Success Message */}
      {showDeletionSuccess && (
        <div className="w-full max-w-lg mb-4 sm:mb-6 p-4 bg-green-500 text-white rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">✅</span>
            <span className="font-bold text-lg">Account Deleted Successfully</span>
          </div>
          <p className="text-sm text-green-100">
            Your cloud account has been removed. You can continue managing words locally or link a new account anytime.
          </p>
        </div>
      )}
      
      <BackButton onClick={handleBack} />
    </div>
  )
}

