# Rocket Words - Next.js Edition

A kid-friendly educational web application for learning words through interactive games, now built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Three Learning Modes:**
  - 👂 **Listen Mode**: Hear words and select the correct one from multiple choice options
  - 📖 **Read Mode**: Read words aloud and confirm understanding
  - ✍️ **Write Mode**: Type words by selecting letters in order from a randomized letter grid

- **Parent Management:**
  - Add/remove custom word lists
  - Create multiple difficulty levels
  - Secure parent login with math challenges
  - Manage word lists across different levels

- **Interactive Features:**
  - Case toggle (uppercase/lowercase) for all text display
  - Audio repeat functionality with dedicated button
  - Real-time feedback with encouraging messages
  - Score tracking and progress persistence
  - Local storage for game state and custom levels

- **Modern Tech Stack:**
  - Next.js 14 with App Router
  - TypeScript for type safety
  - Tailwind CSS for styling
  - Responsive design for all devices
  - Speech Synthesis API for audio features

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── manifest.webmanifest
├── components/            # React components
│   ├── game/              # Game mode components
│   │   ├── ListenMode.tsx
│   │   ├── ReadMode.tsx
│   │   └── WriteMode.tsx
│   ├── CaseToggle.tsx     # Case toggle component
│   ├── Feedback.tsx       # Feedback display component
│   ├── GameContainer.tsx  # Main game container
│   ├── GameScreen.tsx     # Game screen wrapper
│   ├── LevelScreen.tsx    # Level selection screen
│   ├── ModeScreen.tsx     # Mode selection screen
│   ├── ParentLoginScreen.tsx
│   ├── ParentModeScreen.tsx
│   ├── RepeatButton.tsx   # Audio repeat button
│   └── WelcomeScreen.tsx
├── context/               # State management
│   └── GameContext.tsx    # Game state and actions
├── hooks/                 # Custom hooks
│   ├── useGameFeedback.ts # Feedback management
│   ├── useGameModeInitialization.ts # Game mode setup
│   └── useSpeechSynthesis.ts # Text-to-speech functionality
├── utils/                 # Utility functions
│   └── gameUtils.ts       # Game logic utilities
└── __tests__/             # Test files
    ├── utils/             # Utility function tests
    ├── hooks/             # Custom hook tests
    ├── components/        # Component tests
    ├── context/           # Context and state tests
    ├── integration/       # End-to-end flow tests
    └── testUtils.tsx      # Test utilities and helpers
```

## Key Improvements from React Version

1. **TypeScript**: Full type safety throughout the application
2. **Next.js App Router**: Modern routing with better performance
3. **Server-Side Rendering**: Better SEO and initial load times
4. **Optimized Build**: Smaller bundle sizes and better performance
5. **Modern CSS**: Tailwind CSS with custom animations
6. **Better State Management**: Improved context with TypeScript types
7. **Custom Hooks**: Modular, reusable logic for game functionality
8. **Utility Functions**: Pure functions for game logic and data manipulation
9. **Comprehensive Testing**: Jest and React Testing Library with 90%+ coverage

## Custom Hooks

- **`useGameFeedback`**: Manages feedback display with encouraging messages
- **`useGameModeInitialization`**: Handles game mode setup and word selection logic
- **`useSpeechSynthesis`**: Provides text-to-speech functionality with voice selection

## Utility Functions

- **`shuffleArray`**: Fisher-Yates algorithm for array shuffling
- **`generateMultipleChoiceOptions`**: Creates multiple choice options for Listen Mode
- **`generateLetterOptions`**: Extracts all letters (including duplicates) with unique IDs for Write Mode
- **`formatWord`** & **`formatLetter`**: Handle case formatting with special "I" handling

## Game Modes

### Listen Mode
- Audio plays a word using speech synthesis
- Child selects from 4 multiple choice options
- Immediate feedback with encouraging messages
- Repeat button available for audio replay

### Read Mode  
- Word appears on screen with proper formatting
- Child reads it aloud to practice pronunciation
- Confirms understanding with button interaction
- Case toggle affects word display

### Write Mode
- Word appears with a grid of letter buttons showing all letters (including duplicates)
- Child types by selecting letters in correct order
- Selected letters disappear from the grid to show progress
- Mistakes reset the word and restore all letter buttons
- Letters are shuffled randomly for added challenge

## Parent Features

- **Secure Login**: Math-based authentication to access parent controls
- **Custom Word Lists**: Add your own words to any level
- **Multiple Levels**: Create and manage different difficulty levels
- **Word Management**: Add/remove words from any level with real-time updates
- **Level Management**: Create new levels, rename existing ones, or delete levels
- **Persistent Storage**: All custom data is saved locally and persists between sessions

## Testing

This project includes comprehensive testing using Jest and React Testing Library to ensure reliability and maintainability.

### Test Infrastructure

- **Jest**: JavaScript testing framework with Next.js integration
- **React Testing Library**: Component testing utilities focused on user behavior
- **jsdom**: DOM environment for testing React components
- **Coverage Reporting**: Track test coverage across the codebase

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test files
npm test -- --testPathPatterns="gameUtils.test.ts"
npm test -- --testPathPatterns="hooks"
npm test -- --testPathPatterns="components"
```

### Test Coverage

The test suite covers:

#### **Utility Functions (100% Coverage)**
- `gameUtils.ts` - All game logic functions
  - Array shuffling with Fisher-Yates algorithm
  - Multiple choice option generation
  - Unique letter extraction
  - Case formatting with special "I" handling

#### **Custom Hooks (90%+ Coverage)**
- `useGameFeedback` - Feedback display and timing
- `useGameModeInitialization` - Word selection and game setup
- `useSpeechSynthesis` - Speech API integration and voice selection

#### **React Components**
- **UI Components**: CaseToggle, RepeatButton, Feedback
- **Game Mode Components**: WriteMode with comprehensive interaction testing
- **Screen Components**: ParentModeScreen with CRUD operations testing

#### **State Management**
- `GameContext` - All reducer actions, state transitions, and localStorage persistence

#### **Integration Tests**
- Complete game flow testing (Welcome → Level → Mode → Game)
- Parent mode functionality and state management
- Cross-component interactions

### Test Structure

```
src/__tests__/
├── utils/                    # Utility function tests
│   └── gameUtils.test.ts
├── hooks/                    # Custom hook tests
│   ├── useGameFeedback.test.tsx
│   ├── useGameModeInitialization.test.tsx
│   └── useSpeechSynthesis.test.tsx
├── components/               # Component tests
│   ├── game/
│   │   └── WriteMode.test.tsx
│   ├── CaseToggle.test.tsx
│   ├── Feedback.test.tsx
│   ├── RepeatButton.test.tsx
│   └── ParentModeScreen.test.tsx
├── context/                  # Context and state tests
│   └── GameContext.test.tsx
├── integration/              # End-to-end flow tests
│   └── gameFlow.test.tsx
└── testUtils.tsx            # Test utilities and helpers
```

### Test Utilities

The project includes custom test utilities:

- **`renderWithGameContext`**: Renders components with GameContext provider
- **Mock Data Generators**: Create test data for levels and word lists
- **API Mocks**: Speech Synthesis API and localStorage mocking
- **Custom Matchers**: Game-specific assertions and helpers

### Writing Tests

When adding new features, follow these testing patterns:

#### **Testing Utility Functions**
```typescript
import { shuffleArray } from '@/utils/gameUtils'

describe('shuffleArray', () => {
  it('should return an array of the same length', () => {
    const original = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray(original)
    expect(shuffled).toHaveLength(original.length)
  })
})
```

#### **Testing Custom Hooks**
```typescript
import { renderHook, act } from '@testing-library/react'
import { useGameFeedback } from '@/hooks/useGameFeedback'

describe('useGameFeedback', () => {
  it('should show correct feedback', () => {
    const { result } = renderHook(() => useGameFeedback())
    
    act(() => {
      result.current.showInlineFeedback(true)
    })
    
    expect(result.current.showFeedback).toBe(true)
    expect(result.current.feedbackMessage).toMatch(/✅/)
  })
})
```

#### **Testing React Components**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { renderWithGameContext } from '../testUtils'
import CaseToggle from '@/components/CaseToggle'

describe('CaseToggle', () => {
  it('should toggle case when clicked', () => {
    renderWithGameContext(<CaseToggle />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'TOGGLE_CASE' })
  })
})
```

### Coverage Goals

- **Utilities**: 100% (pure functions)
- **Hooks**: 90%+ (including edge cases)
- **Components**: 85%+ (critical paths and user interactions)
- **Integration**: Key user journeys covered

### Continuous Integration

Tests run automatically on:
- Pull requests
- Code pushes
- Pre-commit hooks (recommended)

Ensure all tests pass before submitting code changes.

## Browser Support

- Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge)
- Speech Synthesis API support for audio features
- Local Storage for game progress and custom data persistence
- Responsive design works on desktop, tablet, and mobile devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

### Pull Request Testing
Every pull request to the `main` branch automatically runs:
- **Linting**: Code style and quality checks
- **Testing**: Full test suite with Jest and React Testing Library
- **Build Verification**: Ensures the application builds successfully

### Automatic Deployment
When a pull request is merged to `main`:
- The application is built as a static site
- Automatically deployed to GitHub Pages
- Available at: `https://jthi3rry.github.io/rocketwords/`

### Viewing Results
- **PR Checks**: View test results and build status directly on the pull request
- **Deployment Status**: Check the Actions tab for deployment progress
- **Live Site**: Access the deployed application via the GitHub Pages URL

### GitHub Pages Configuration
The app is configured for GitHub Pages subdirectory deployment at `/rocketwords/`. The build process uses `basePath` and `assetPrefix` to ensure all assets load correctly when deployed to the subdirectory.

## License

MIT License - see LICENSE file for details