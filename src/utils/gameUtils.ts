/**
 * Pure utility functions for game logic
 */

interface Level {
  name: string
  words: string[]
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm
 * @param array - The array to shuffle
 * @returns The shuffled array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Generates multiple choice options for a word from a word list
 * @param correctWord - The correct word
 * @param wordList - The list of all words to choose from
 * @param numOptions - Number of options to generate (default: 4)
 * @returns Array of option words including the correct one
 */
export const generateMultipleChoiceOptions = (
  correctWord: string, 
  wordList: string[], 
  numOptions: number = 4
): string[] => {
  if (wordList.length === 0) return []
  
  const shuffledWords = shuffleArray([...wordList])
  const options = shuffledWords.slice(0, numOptions)
  
  // Ensure the correct word is included
  if (!options.includes(correctWord)) {
    const randomIndex = Math.floor(Math.random() * options.length)
    options[randomIndex] = correctWord
  }
  
  return shuffleArray(options)
}

/**
 * Generates letter options from a word for typing games, including all letters (duplicates)
 * @param word - The word to extract letters from
 * @returns Array of all letters with unique identifiers, shuffled
 */
export const generateLetterOptions = (word: string): { letter: string; id: string }[] => {
  const letters = word.split('').map((letter, index) => ({
    letter,
    id: `${letter}-${index}`
  }))
  return shuffleArray(letters)
}

/**
 * Formats a word with proper case handling
 * @param word - The word to format
 * @param isUpperCase - Whether to use uppercase
 * @returns The formatted word
 */
export const formatWord = (word: string, isUpperCase: boolean): string => {
  // Always capitalize 'I' regardless of case setting
  if (word.toLowerCase() === 'i') {
    return 'I'
  }

  // Apply case based on toggle
  return isUpperCase ? word.toUpperCase() : word.toLowerCase()
}

/**
 * Formats a letter with proper case handling
 * @param letter - The letter to format
 * @param isUpperCase - Whether to use uppercase
 * @returns The formatted letter
 */
export const formatLetter = (letter: string, isUpperCase: boolean): string => {
  // Apply case based on toggle without special "I" handling for letter buttons
  return isUpperCase ? letter.toUpperCase() : letter.toLowerCase()
}

/**
 * Sorts level keys by level name in ascending order
 * @param levels - The levels object
 * @returns Array of level keys sorted by name
 */
export const getSortedLevelKeys = (levels: Record<string, Level>): string[] => {
  return Object.keys(levels).sort((a, b) => 
    levels[a].name.localeCompare(levels[b].name)
  )
}

/**
 * Gets the first level key after sorting by name
 * @param levels - The levels object
 * @returns The first level key alphabetically, or null if no levels
 */
export const getFirstLevelKey = (levels: Record<string, Level>): string | null => {
  const sortedKeys = getSortedLevelKeys(levels)
  return sortedKeys.length > 0 ? sortedKeys[0] : null
}

/**
 * Gets level keys excluding a specific level, sorted by name
 * @param levels - The levels object
 * @param excludeKey - The level key to exclude
 * @returns Array of level keys (excluding the specified one) sorted by name
 */
export const getSortedLevelKeysExcluding = (
  levels: Record<string, Level>, 
  excludeKey: string
): string[] => {
  return Object.keys(levels)
    .filter(key => key !== excludeKey)
    .sort((a, b) => levels[a].name.localeCompare(levels[b].name))
}

