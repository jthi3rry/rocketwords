import {
  shuffleArray,
  generateMultipleChoiceOptions,
  generateLetterOptions,
  formatWord,
  formatLetter,
} from '@/utils/gameUtils'

describe('gameUtils', () => {
  describe('shuffleArray', () => {
    it('should return an array of the same length', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = shuffleArray(original)
      expect(shuffled).toHaveLength(original.length)
    })

    it('should contain all original elements', () => {
      const original = ['a', 'b', 'c', 'd']
      const shuffled = shuffleArray(original)
      original.forEach(item => {
        expect(shuffled).toContain(item)
      })
    })

    it('should not modify the original array', () => {
      const original = [1, 2, 3, 4, 5]
      const originalCopy = [...original]
      shuffleArray(original)
      expect(original).toEqual(originalCopy)
    })

    it('should handle empty array', () => {
      const result = shuffleArray([])
      expect(result).toEqual([])
    })

    it('should handle single element array', () => {
      const result = shuffleArray([42])
      expect(result).toEqual([42])
    })

    it('should produce different order (statistical test)', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const results = new Set()
      
      // Run multiple times to check for randomization
      for (let i = 0; i < 100; i++) {
        const shuffled = shuffleArray(original)
        results.add(JSON.stringify(shuffled))
      }
      
      // Should have multiple different arrangements
      expect(results.size).toBeGreaterThan(1)
    })
  })

  describe('generateMultipleChoiceOptions', () => {
    const wordList = ['cat', 'dog', 'bird', 'fish', 'frog', 'duck', 'lion', 'bear']

    it('should generate correct number of options', () => {
      const options = generateMultipleChoiceOptions('cat', wordList, 4)
      expect(options).toHaveLength(4)
    })

    it('should include the correct word', () => {
      const correctWord = 'cat'
      const options = generateMultipleChoiceOptions(correctWord, wordList, 4)
      expect(options).toContain(correctWord)
    })

    it('should return empty array for empty word list', () => {
      const options = generateMultipleChoiceOptions('cat', [], 4)
      expect(options).toEqual([])
    })

    it('should handle word list smaller than requested options', () => {
      const smallList = ['cat', 'dog']
      const options = generateMultipleChoiceOptions('cat', smallList, 4)
      expect(options).toHaveLength(2)
      expect(options).toContain('cat')
    })

    it('should handle word list with only the correct word', () => {
      const singleWordList = ['cat']
      const options = generateMultipleChoiceOptions('cat', singleWordList, 4)
      expect(options).toEqual(['cat'])
    })

    it('should use default number of options when not specified', () => {
      const options = generateMultipleChoiceOptions('cat', wordList)
      expect(options).toHaveLength(4)
    })

    it('should shuffle the options', () => {
      const correctWord = 'cat'
      const results = new Set()
      
      // Run multiple times to check for shuffling
      for (let i = 0; i < 50; i++) {
        const options = generateMultipleChoiceOptions(correctWord, wordList, 4)
        results.add(JSON.stringify(options))
      }
      
      // Should have multiple different arrangements
      expect(results.size).toBeGreaterThan(1)
    })
  })

  describe('generateLetterOptions', () => {
    it('should extract all letters from a word including duplicates', () => {
      const result = generateLetterOptions('hello')
      expect(result).toHaveLength(5) // h, e, l, l, o
      expect(result.map(opt => opt.letter)).toEqual(expect.arrayContaining(['h', 'e', 'l', 'l', 'o']))
      
      // Check that each letter has a unique id
      const ids = result.map(opt => opt.id)
      expect(new Set(ids).size).toBe(5) // All ids should be unique
    })

    it('should handle words with repeated letters', () => {
      const result = generateLetterOptions('book')
      expect(result).toHaveLength(4) // b, o, o, k
      
      // Should have two 'o' letters with different ids
      const oLetters = result.filter(opt => opt.letter === 'o')
      expect(oLetters).toHaveLength(2)
      expect(oLetters[0].id).not.toBe(oLetters[1].id)
    })

    it('should handle single letter word', () => {
      const result = generateLetterOptions('a')
      expect(result).toHaveLength(1)
      expect(result[0].letter).toBe('a')
      expect(result[0].id).toBe('a-0')
    })

    it('should handle empty string', () => {
      const result = generateLetterOptions('')
      expect(result).toEqual([])
    })

    it('should shuffle the letters', () => {
      const word = 'hello'
      const results = new Set()
      
      // Run multiple times to check for shuffling
      for (let i = 0; i < 50; i++) {
        const letters = generateLetterOptions(word)
        results.add(JSON.stringify(letters.map(opt => opt.letter)))
      }
      
      // Should have multiple different arrangements
      expect(results.size).toBeGreaterThan(1)
    })

    it('should generate unique ids for each letter position', () => {
      const result = generateLetterOptions('aaa')
      expect(result).toHaveLength(3)
      
      // All should be 'a' but with different ids
      result.forEach(opt => expect(opt.letter).toBe('a'))
      
      const ids = result.map(opt => opt.id)
      // Should contain all expected ids (order may vary due to shuffling)
      expect(ids).toEqual(expect.arrayContaining(['a-0', 'a-1', 'a-2']))
      // All ids should be unique
      expect(new Set(ids).size).toBe(3)
    })
  })

  describe('formatWord', () => {
    it('should convert to uppercase when isUpperCase is true', () => {
      expect(formatWord('hello', true)).toBe('HELLO')
    })

    it('should convert to lowercase when isUpperCase is false', () => {
      expect(formatWord('HELLO', false)).toBe('hello')
    })

    it('should always capitalize "I" regardless of case setting', () => {
      expect(formatWord('i', true)).toBe('I')
      expect(formatWord('i', false)).toBe('I')
      expect(formatWord('I', true)).toBe('I')
      expect(formatWord('I', false)).toBe('I')
    })

    it('should handle mixed case words', () => {
      expect(formatWord('Hello', true)).toBe('HELLO')
      expect(formatWord('Hello', false)).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(formatWord('', true)).toBe('')
      expect(formatWord('', false)).toBe('')
    })

    it('should handle words containing "I"', () => {
      expect(formatWord('hi', true)).toBe('HI')
      expect(formatWord('hi', false)).toBe('hi')
    })
  })

  describe('formatLetter', () => {
    it('should convert to uppercase when isUpperCase is true', () => {
      expect(formatLetter('a', true)).toBe('A')
    })

    it('should convert to lowercase when isUpperCase is false', () => {
      expect(formatLetter('A', false)).toBe('a')
    })

    it('should not have special "I" handling like formatWord', () => {
      expect(formatLetter('i', true)).toBe('I')
      expect(formatLetter('i', false)).toBe('i')
    })

    it('should handle single character strings', () => {
      expect(formatLetter('x', true)).toBe('X')
      expect(formatLetter('X', false)).toBe('x')
    })

    it('should handle empty string', () => {
      expect(formatLetter('', true)).toBe('')
      expect(formatLetter('', false)).toBe('')
    })
  })
})
