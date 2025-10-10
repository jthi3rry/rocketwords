'use client'

import { useState } from 'react'

const CORRECT_PHRASES = [
  "Great!", "Awesome!", "You got it!", "Good job!", "Exactly!", 
  "You nailed it!", "Fantastic!", "Spot on!", "You're on fire!"
]

const INCORRECT_PHRASES = [
  "Good try!", "Not quite!", "Keep trying!", "Don't give up!", 
  "So close!", "Almost!", "Think about this!", "Give it another shot!"
]

/**
 * Generates a random feedback message for correct or incorrect answers
 * @param isCorrect - Whether the answer was correct
 * @returns Object with emoji and message
 */
const generateFeedbackMessage = (isCorrect: boolean) => {
  const emoji = isCorrect ? "✅" : "❌"
  const phrases = isCorrect ? CORRECT_PHRASES : INCORRECT_PHRASES
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)]
  
  return {
    emoji,
    message: emoji + " " + randomPhrase
  }
}

/**
 * Custom hook for managing game feedback display
 * @returns Object with feedback state and show function
 */
export const useGameFeedback = () => {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const showInlineFeedback = (isCorrect: boolean) => {
    const { message } = generateFeedbackMessage(isCorrect)
    setFeedbackMessage(message)
    setShowFeedback(true)
    
    setTimeout(() => {
      setShowFeedback(false)
    }, 1500)
  }

  return {
    showFeedback,
    feedbackMessage,
    showInlineFeedback
  }
}
