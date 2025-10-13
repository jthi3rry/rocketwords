'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/context/GameContext'
import BackButton from './BackButton'

export default function ParentLoginScreen() {
  const { state, dispatch } = useGame()
  const [challengeNumber, setChallengeNumber] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')

  const numberToWords = (n: number): string => {
    if (n === 0) return "zero"
    const units = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
    const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

    let words = ""

    // Hundreds
    if (n >= 100) {
      words += units[Math.floor(n / 100)] + " hundred"
      n %= 100
      if (n > 0) words += " and "
    }

    // Tens and Units
    if (n >= 20) {
      words += tens[Math.floor(n / 10)]
      n %= 10
      if (n > 0) words += "-" + units[n]
    } else if (n >= 10) {
      words += teens[n - 10]
    } else if (n > 0) {
      words += units[n]
    }
    return words.trim()
  }

  const generateChallenge = () => {
    const num = Math.floor(Math.random() * 900) + 100
    setChallengeNumber(num)
    setInputValue('')
    setError('')
  }

  const handleKeypadTap = (digit: string) => {
    if (inputValue.length < 3) {
      const newValue = inputValue + digit
      setInputValue(newValue)
      
      if (newValue.length === 3) {
        // Use the newValue directly instead of relying on state
        handleSubmit(newValue)
      }
    }
  }

  const handleSubmit = (value: string = inputValue) => {
    const enteredNumber = parseInt(value, 10)
    
    if (enteredNumber === challengeNumber) {
      dispatch({ type: 'SET_PARENT_LOGIN', payload: true })
      dispatch({ type: 'SET_SCREEN', payload: 'parentMode' })
      // Clear the state for next time
      setInputValue('')
      setError('')
    } else {
      setError('Incorrect number. Please try again.')
      generateChallenge()
    }
  }

  const handleClear = () => {
    setInputValue('')
  }

  const handleBack = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'welcome' })
  }

  useEffect(() => {
    generateChallenge()
  }, [])

  // Generate new challenge when returning to this screen
  useEffect(() => {
    if (state.currentScreen === 'parentLogin') {
      generateChallenge()
    }
  }, [state.currentScreen])

  if (state.currentScreen !== 'parentLogin') {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 h-full w-full transition-opacity duration-500">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-purple-400 mb-4 sm:mb-6 text-center">Parent Mode</h2>
      <p className="text-base sm:text-lg text-gray-400 mb-3 sm:mb-4 text-center">What&apos;s this number?</p>
      <p className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white text-center">{numberToWords(challengeNumber)}</p>
      
      <div className="w-full max-w-xs text-center">
        <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-purple-400 tracking-widest mb-3 sm:mb-4">
          {inputValue.padEnd(3, '_').split('').join(' ')}
        </p>
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
            <button
              key={digit}
              onClick={() => handleKeypadTap(digit.toString())}
              className="numeral-btn btn-game btn-mode px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-lg sm:text-xl md:text-2xl rounded-lg"
            >
              {digit}
            </button>
          ))}
          <button 
            onClick={handleClear}
            className="btn-game px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm sm:text-base md:text-lg rounded-lg bg-red-500 hover:bg-red-600 col-span-1"
          >
            Clear
          </button>
          <button
            onClick={() => handleKeypadTap('0')}
            className="numeral-btn btn-game btn-mode px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-lg sm:text-xl md:text-2xl rounded-lg"
          >
            0
          </button>
        </div>
      </div>
      
      {error && <p className="text-red-400 text-sm mt-3 sm:mt-4 text-center mb-8 sm:mb-12">{error}</p>}
      
      <BackButton onClick={handleBack} />
    </div>
  )
}
