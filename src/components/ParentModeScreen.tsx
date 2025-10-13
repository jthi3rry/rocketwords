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
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null)
  const [newLevelName, setNewLevelName] = useState('')
  const [levelName, setLevelName] = useState('')
  const [newWord, setNewWord] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false)
  const [showDeletionSuccess, setShowDeletionSuccess] = useState(false)
  const [showAddLevelInput, setShowAddLevelInput] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const addLevelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const levelNameInputRef = useRef<HTMLInputElement | null>(null)
  const newLevelNameInputRef = useRef<HTMLInputElement | null>(null)

  // Update levelName when expandedLevel changes (but not when user is typing)
  useEffect(() => {
    if (expandedLevel && state.levels[expandedLevel]) {
      // Only update if the input is not currently focused (user not typing)
      if (document.activeElement !== levelNameInputRef.current) {
        setLevelName(state.levels[expandedLevel].name)
      }
    }
  }, [expandedLevel, state.levels])

  // Focus on the level name input when a new level is expanded (after auto-save)
  useEffect(() => {
    if (expandedLevel && levelNameInputRef.current && !showAddLevelInput) {
      // Small delay to ensure the DOM has updated
      const focusTimer = setTimeout(() => {
        if (levelNameInputRef.current) {
          levelNameInputRef.current.focus()
          // Set cursor to end of text
          const length = levelNameInputRef.current.value.length
          levelNameInputRef.current.setSelectionRange(length, length)
        }
      }, 100)
      
      return () => clearTimeout(focusTimer)
    }
  }, [expandedLevel, showAddLevelInput])


  const handleAddLevel = (clearInput = true) => {
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
      if (clearInput) {
        setNewLevelName('')
        setExpandedLevel(newKey) // Auto-expand the new level
        setLevelName(newName) // Set the level name for the new level
        setShowAddLevelInput(false) // Hide the input after creating
      }
    }
  }

  const handleShowAddLevelInput = () => {
    setShowAddLevelInput(true)
    setNewLevelName('')
    setExpandedLevel(null) // Collapse any currently expanded level
    // Focus will be set by autoFocus on the input field
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
        // Save the level and transition to the newly created level's input
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
          // Clear the add level input and hide it
          setNewLevelName('')
          setShowAddLevelInput(false)
          // Expand the newly created level
          setExpandedLevel(newKey)
          setLevelName(trimmedName)
          // Focus will be set on the newly created level's input field
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
      // Check if a level with this name already exists (from auto-save)
      const existingLevel = Object.values(state.levels).find(level => level.name === trimmedName)
      
      if (existingLevel) {
        // Level already exists from auto-save, just expand it and clear input
        const existingKey = Object.keys(state.levels).find(key => state.levels[key].name === trimmedName)
        if (existingKey) {
          setExpandedLevel(existingKey)
          setLevelName(trimmedName)
        }
        setNewLevelName('')
        setShowAddLevelInput(false)
      } else {
        // Create new level
        const newKey = `level_${Date.now()}`
        dispatch({
          type: 'ADD_LEVEL',
          payload: {
            key: newKey,
            level: { name: trimmedName, words: [] }
          }
        })
        setNewLevelName('')
        setExpandedLevel(newKey) // Auto-expand the new level
        setLevelName(trimmedName)
        setShowAddLevelInput(false)
      }
    } else {
      // If empty, just exit add mode without creating a level
      setShowAddLevelInput(false)
      setNewLevelName('')
    }
  }

  const handleRemoveLevel = (levelKey: string) => {
    if (Object.keys(state.levels).length > 1) {
      dispatch({ type: 'REMOVE_LEVEL', payload: levelKey })
      // If we're deleting the expanded level, collapse all
      if (expandedLevel === levelKey) {
        setExpandedLevel(null)
      }
      setShowDeleteConfirm(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const handleSaveLevelName = (levelKey: string) => {
    const newName = levelName.trim()
    if (newName && state.levels[levelKey] && state.levels[levelKey].name !== newName) {
      dispatch({
        type: 'UPDATE_LEVEL_NAME',
        payload: {
          key: levelKey,
          name: newName
        }
      })
      // Update the local state to match what was saved (trimmed version)
      // This prevents the useEffect from overwriting the user's input
      setLevelName(newName)
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
    // Capture the current value to avoid race conditions
    saveTimeoutRef.current = setTimeout(() => {
      if (expandedLevel) {
        // Use the current value from the input, not the state
        const currentValue = levelNameInputRef.current?.value || ''
        const trimmedValue = currentValue.trim()
        if (trimmedValue && state.levels[expandedLevel] && state.levels[expandedLevel].name !== trimmedValue) {
          dispatch({
            type: 'UPDATE_LEVEL_NAME',
            payload: {
              key: expandedLevel,
              name: trimmedValue
            }
          })
          // Update the local state to match what was saved
          setLevelName(trimmedValue)
        }
      }
    }, 1000)
  }

  const handleLevelNameBlur = () => {
    // Save immediately on blur
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    if (expandedLevel) {
      handleSaveLevelName(expandedLevel)
    }
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

  const handleAddWord = (levelKey: string) => {
    const input = newWord.trim()
    if (input && state.levels[levelKey]) {
      // Split by spaces or commas, then clean up each word
      const words = input
        .split(/[,\s]+/) // Split by commas or spaces
        .map(word => word.trim().toLowerCase()) // Trim and lowercase each word
        .filter(word => word.length > 0) // Remove empty strings
        .filter(word => !state.levels[levelKey].words.includes(word)) // Remove duplicates
      
      // Add each word
      words.forEach(word => {
        dispatch({
          type: 'ADD_WORD',
          payload: {
            levelKey: levelKey,
            word: word
          }
        })
      })
      
      setNewWord('')
    }
  }


  const handleDeleteWordClick = (levelKey: string, word: string) => {
    dispatch({
      type: 'REMOVE_WORD',
      payload: {
        levelKey: levelKey,
        word: word
      }
    })
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

  const canRemoveLevel = Object.keys(state.levels).length > 1

  // Accordion toggle functionality
  const toggleAccordion = (levelKey: string) => {
    if (expandedLevel === levelKey) {
      setExpandedLevel(null) // Collapse if already expanded
    } else {
      setExpandedLevel(levelKey) // Expand the clicked level
    }
  }

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
        
        {/* Accordion List */}
        <div className="space-y-2">
          {getSortedLevelKeys(state.levels, state.levelOrder).map(key => {
            const level = state.levels[key]
            const isExpanded = expandedLevel === key
            const words = level.words || []
            
            return (
              <div key={key} className="bg-gray-800 rounded-lg border-2 border-gray-600 overflow-hidden">
                {/* Accordion Header */}
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => toggleAccordion(key)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    <span className="font-medium text-gray-200 truncate">{level.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                      {words.length} word{words.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="border-t border-gray-600 p-3 space-y-3">
                    {/* Level Name Edit */}
                    <div className="relative">
                      <input 
                        ref={levelNameInputRef}
                        type="text" 
                        value={levelName}
                        onChange={handleLevelNameChange}
                        onBlur={handleLevelNameBlur}
                        placeholder="Level name" 
                        className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm bg-gray-700 text-white"
                      />
                      {canRemoveLevel && !showDeleteConfirm && (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors"
                          title="Delete level"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Delete Confirmation */}
                    {showDeleteConfirm && (
                      <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-300 mb-3">
                          Delete &ldquo;<span className="font-semibold">{level.name}</span>&rdquo; and all {words.length} word{words.length !== 1 ? 's' : ''}?
                        </p>
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={handleCancelDelete}
                            className="btn-game px-3 py-1 rounded-full text-xs font-bold text-gray-300 bg-gray-600 hover:bg-gray-500 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleRemoveLevel(key)}
                            className="btn-game px-3 py-1 rounded-full text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                          >
                            Delete ✕
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Words Display */}
                    {words.length === 0 ? (
                      <div className="p-4 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 text-center">
                        <p className="text-gray-400 text-sm mb-2">No words yet! 🌱</p>
                        <p className="text-gray-500 text-xs">Add your first word below to get started</p>
                      </div>
                    ) : (
                      <div className="bg-gray-700 p-3 rounded-lg border border-gray-600 max-h-48 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          {words.map((word, index) => (
                            <div
                              key={index}
                              className="group relative inline-flex items-center px-3 py-1.5 bg-gray-600 rounded-full text-sm font-medium text-gray-200 hover:bg-gray-500 transition-colors"
                            >
                              <span className="pr-1">{formatWord(word, state.isUpperCase)}</span>
                              <button 
                                onClick={() => handleDeleteWordClick(key, word)}
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

                    {/* Add Word Input */}
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        placeholder="Words (space or comma separated)... ✍️" 
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 text-sm bg-gray-700 text-white"
                      />
                      <button 
                        onClick={() => handleAddWord(key)}
                        className="btn-game px-3 py-2 rounded-full text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-colors"
                      >
                        Add ➕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* New Level Creation - Appears as a real accordion item */}
          {showAddLevelInput && (
            <div className="bg-gray-800 rounded-lg border-2 border-gray-600 overflow-hidden">
              {/* Accordion Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="transform transition-transform duration-200 rotate-90">
                    ▶
                  </span>
                  <span className="font-medium text-gray-200 truncate">New Level</span>
                  <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                    0 words
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCancelAddLevel}
                    className="btn-game px-3 py-1 rounded-full text-xs font-bold text-gray-300 bg-gray-600 hover:bg-gray-500 transition-colors"
                    title="Cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Accordion Content */}
              <div className="border-t border-gray-600 p-3 space-y-3">
                {/* Level Name Edit */}
                <div className="flex gap-2 items-center">
                  <input 
                    ref={newLevelNameInputRef}
                    type="text" 
                    value={newLevelName}
                    onChange={handleNewLevelNameChange}
                    onBlur={handleNewLevelNameBlur}
                    placeholder="Level name" 
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm bg-gray-700 text-white"
                    autoFocus
                  />
                </div>

                {/* Words Display - Empty state */}
                <div className="p-4 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 text-center">
                  <p className="text-gray-400 text-sm mb-2">No words yet! 🌱</p>
                  <p className="text-gray-500 text-xs">Add your first word below to get started</p>
                </div>

                {/* Add Word Input - Disabled until level is saved */}
                <div className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    placeholder="Words (space or comma separated)... ✍️" 
                    className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 text-sm bg-gray-700 text-white"
                    disabled
                  />
                  <button 
                    className="btn-game px-3 py-2 rounded-full text-sm font-bold text-gray-300 bg-gray-600 cursor-not-allowed"
                    disabled
                  >
                    Add ➕
                  </button>
                </div>
                <p className="text-xs text-gray-500">Save the level name first to add words</p>
              </div>
            </div>
          )}
        </div>

        {/* Add New Level Button */}
        <div className="mt-4">
          <button
            onClick={handleShowAddLevelInput}
            className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-600 text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            Add New Level
          </button>
        </div>
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
              <span className="text-sm text-gray-300 truncate flex-1 min-w-0 text-left">
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

