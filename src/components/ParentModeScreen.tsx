'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/context/GameContext'

export default function ParentModeScreen() {
  const { state, dispatch } = useGame()
  const [selectedLevel, setSelectedLevel] = useState('')
  const [newLevelName, setNewLevelName] = useState('')
  const [levelName, setLevelName] = useState('')
  const [newWord, setNewWord] = useState('')

  useEffect(() => {
    const levelKeys = Object.keys(state.levels)
    if (levelKeys.length > 0 && !selectedLevel) {
      setSelectedLevel(levelKeys[0])
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
    }
  }

  const handleRemoveLevel = () => {
    if (Object.keys(state.levels).length > 1) {
      dispatch({ type: 'REMOVE_LEVEL', payload: selectedLevel })
      const remainingKeys = Object.keys(state.levels).filter(key => key !== selectedLevel)
      setSelectedLevel(remainingKeys[0] || '')
    }
  }

  const handleSaveLevelName = () => {
    const newName = levelName.trim()
    if (newName && state.levels[selectedLevel]) {
      dispatch({
        type: 'UPDATE_LEVEL_NAME',
        payload: {
          key: selectedLevel,
          name: newName
        }
      })
    }
  }

  const handleAddWord = () => {
    const word = newWord.trim().toLowerCase()
    if (word && state.levels[selectedLevel] && !state.levels[selectedLevel].words.includes(word)) {
      dispatch({
        type: 'ADD_WORD',
        payload: {
          levelKey: selectedLevel,
          word: word
        }
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
  }

  const handleBack = () => {
    dispatch({ type: 'SET_PARENT_LOGIN', payload: false })
    dispatch({ type: 'RESET_GAME' })
    dispatch({ type: 'SET_SCREEN', payload: 'welcome' })
  }

  const currentWords = selectedLevel ? (state.levels[selectedLevel]?.words || []) : []
  const canRemoveLevel = Object.keys(state.levels).length > 1

  if (state.currentScreen !== 'parentMode') {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-start p-8 h-full w-full transition-opacity duration-500 overflow-y-auto">
      <h2 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-6">Manage Words & Levels</h2>
      
      {/* Add/Remove Level Section */}
      <div className="w-full max-w-lg mb-6 flex flex-col md:flex-row gap-2 items-center">
        <input 
          type="text" 
          value={newLevelName}
          onChange={(e) => setNewLevelName(e.target.value)}
          placeholder="New Level Name" 
          className="flex-grow px-4 py-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 text-lg bg-gray-800 text-white w-full md:w-auto"
        />
        <button 
          onClick={handleAddLevel}
          className="btn-game px-6 py-3 rounded-full text-lg font-bold text-white bg-green-500 hover:bg-green-600 transition-colors w-full md:w-auto"
        >
          Add Level
        </button>
      </div>
      
      {/* Select/Edit Level Section */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex gap-2 items-center mb-2">
          <label className="block text-xl font-bold">Select Level:</label>
          <button 
            onClick={handleRemoveLevel}
            disabled={!canRemoveLevel}
            className="btn-game px-4 py-2 rounded-full text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove
          </button>
        </div>
        <select 
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="w-full p-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 text-center text-lg bg-gray-800 text-white"
        >
          {Object.keys(state.levels).map(key => (
            <option key={key} value={key}>
              {state.levels[key].name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Edit Level Name Section */}
      <div className="w-full max-w-lg mb-6 flex flex-col md:flex-row gap-2 items-center">
        <input 
          type="text" 
          value={levelName}
          onChange={(e) => setLevelName(e.target.value)}
          placeholder="Edit Level Name" 
          className="flex-grow px-4 py-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 text-lg bg-gray-800 text-white w-full md:w-auto"
        />
        <button 
          onClick={handleSaveLevelName}
          className="btn-game px-6 py-3 rounded-full text-lg font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors w-full md:w-auto"
        >
          Save Name
        </button>
      </div>

      {/* Manage Words Section */}
      <div className="w-full max-w-lg mb-6">
        <h3 className="text-xl font-bold mb-2">Current Words:</h3>
        <div className="bg-gray-800 p-4 rounded-xl border-2 border-dashed border-gray-600 min-h-[100px] max-h-64 overflow-y-auto">
          {currentWords.map((word, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded-lg mb-2 text-gray-200">
              <span>{word}</span>
              <button 
                onClick={() => handleRemoveWord(word)}
                className="text-red-400 hover:text-red-300 font-bold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="w-full max-w-lg mb-6 flex flex-col md:flex-row gap-2 items-center">
        <input 
          type="text" 
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Add new word" 
          className="flex-grow px-4 py-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 text-lg bg-gray-800 text-white w-full md:w-auto"
        />
        <button 
          onClick={handleAddWord}
          className="btn-game px-6 py-3 rounded-full text-lg font-bold text-white bg-green-500 hover:bg-green-600 transition-colors w-full md:w-auto"
        >
          Add Word
        </button>
      </div>
      
      <button 
        onClick={handleBack}
        className="btn-game px-6 py-2 rounded-full text-sm font-bold text-gray-400 bg-gray-700 hover:bg-gray-600 transition-colors mt-4"
      >
        Done
      </button>
    </div>
  )
}

