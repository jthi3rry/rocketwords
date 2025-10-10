'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook for speech synthesis functionality
 * @returns Object with playWord function
 */
export const useSpeechSynthesis = () => {
  const [synthesizer, setSynthesizer] = useState<SpeechSynthesis | null>(null)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      const synth = window.speechSynthesis
      setSynthesizer(synth)
      
      const selectVoice = () => {
        const voices = synth.getVoices()
        const selectedVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
                             voices.find(v => v.name.includes('Microsoft') && v.lang.startsWith('en')) ||
                             voices.find(v => v.lang.startsWith('en-AU')) ||
                             voices.find(v => v.lang.startsWith('en-NZ')) ||
                             voices.find(v => v.lang.startsWith('en-GB')) ||
                             voices.find(v => v.lang.startsWith('en-US')) ||
                             voices.find(v => v.lang.startsWith('en'))
        setVoice(selectedVoice || null)
      }

      synth.onvoiceschanged = selectVoice
      selectVoice() // Call immediately in case voices are already loaded
    }
  }, [])

  const playWord = (word: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis && synthesizer) {
      // Stop any current speech before playing new word
      synthesizer.cancel()
      
      const utterance = new SpeechSynthesisUtterance(word)
      if (voice) {
        utterance.voice = voice
      }
      utterance.rate = 0.6
      utterance.pitch = 1.2
      synthesizer.speak(utterance)
    }
  }

  return {
    playWord
  }
}
