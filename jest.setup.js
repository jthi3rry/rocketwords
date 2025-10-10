import '@testing-library/jest-dom'

// Mock Speech Synthesis API
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(() => [
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
    { name: 'Alex', lang: 'en-US' },
  ]),
  onvoiceschanged: null,
}

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  voice: null,
  rate: 1,
  pitch: 1,
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
