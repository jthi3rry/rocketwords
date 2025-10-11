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
  - **Optional Cloud Sync**: Sign in with Google or Email/Password to sync levels across devices

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
  - Firebase Authentication & Firestore (optional)

## Architecture

### Offline-First Design

RocketWords is designed as an **offline-first application**. All functionality works without an internet connection or Firebase setup:

- **localStorage** is the primary data store
- Custom levels and progress are saved locally
- The app functions completely independently
- No backend required for core functionality

### Optional Cloud Sync

Firebase integration is **completely optional** and provides cloud synchronization:

- **Authentication**: Google Sign-In or Email/Password
- **Data Sync**: Custom levels automatically sync across devices
- **Conflict Resolution**: Last-write-wins strategy with timestamps
- **Real-time Updates**: Changes sync instantly when online
- **Seamless Integration**: Works transparently with localStorage

#### How It Works

1. **Without Authentication**: All data stays in localStorage, app works 100% offline
2. **After Sign-In**: 
   - Local data merges with cloud data (last-write-wins)
   - Changes sync to Firestore automatically (debounced)
   - Data accessible from any device with same account
3. **On Sign-Out**: Local data remains intact, sync stops

This architecture ensures the app is always functional while offering optional cloud features for multi-device use.

### Environment Detection

The app **automatically switches** between environments:

| Environment | Firebase Connection | Use Case |
|------------|---------------------|----------|
| **localhost** | Firebase Emulators (if running) OR Production Firebase | Development & Testing |
| **Deployed** | Production Firebase | Live users |

**No code changes needed** - the app detects `window.location.hostname` and connects accordingly!

#### Quick Reference

**Development workflow:**
```bash
# Terminal 1: Start Firebase Emulators (optional)
npm run emulators

# Terminal 2: Start Next.js dev server
npm run dev

# Browser: localhost:3000 → Auto-connects to emulators
# Emulator UI: localhost:4000 → View/manage test data
```

**Production deployment:**
```bash
# Build the app (embeds Firebase config from .env.local or GitHub Secrets)
npm run build

# Deploy to GitHub Pages (GitHub Actions does this automatically)
# The app automatically uses production Firebase
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. **Optional: Firebase Setup for Cloud Sync**

If you want to enable cloud synchronization of custom levels across devices, you'll need to set up Firebase:

   a. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   
   b. Enable authentication methods:
      - Go to Authentication → Sign-in method
      - Enable "Google" provider
      - Enable "Email/Password" provider
   
   c. Create a Firestore database:
      - Go to Firestore Database → Create Database
      - Start in production mode
      - Choose your region
   
   d. Deploy security rules:
      ```bash
      # Login to Firebase (one-time)
      npx firebase login
      
      # Initialize Firebase (select Firestore only)
      npx firebase init firestore
      
      # Deploy the security rules
      npx firebase deploy --only firestore:rules
      ```
      
      **Note:** `firebase-tools` is included as a dev dependency, so you can use `npx firebase` instead of installing globally.
   
   e. Get your Firebase configuration:
      - Go to Project Settings → General
      - Scroll down to "Your apps" section
      - Click on the web app icon (</>) or "Add app" if needed
      - Copy the config object
   
   f. Create `.env.local` file in the project root:
      ```bash
      cp env.example .env.local
      ```
   
   g. Edit `.env.local` and add your Firebase configuration:
      ```
      NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
      NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
      ```

   **Note:** The app works fully without Firebase. Cloud sync is optional and only needed if you want to access custom levels from multiple devices.

### Firebase Development vs Production

The app automatically detects the environment and connects to the appropriate Firebase instance:

#### Development (localhost)

**Option 1: Use Firebase Emulators (Recommended)**

Firebase Emulators let you develop locally without touching production data or incurring costs:

**Note:** `firebase-tools` is already included as a dev dependency - no global installation needed!

1. **Login to Firebase** (one-time):
   ```bash
   npx firebase login
   ```

2. **Initialize emulators** (one-time setup):
   ```bash
   npx firebase init emulators
   ```
   - Select: ✅ Authentication Emulator, ✅ Firestore Emulator
   - Use default ports (Auth: 9099, Firestore: 8080)

3. **Start emulators** (Terminal 1):
   ```bash
   npm run emulators
   ```
   - Emulator UI available at: `http://localhost:4000`
   - Browse/edit test data in a visual interface
   - Or run: `npx firebase emulators:start`

4. **Start your app** (Terminal 2):
   ```bash
   npm run dev
   ```

The app will **automatically detect** you're on localhost and connect to emulators. You'll see in the browser console:
```
🔧 Using Firebase Emulators (Auth: 9099, Firestore: 8080)
```

**Benefits of Emulators:**
- ✅ **Free** - No Firebase costs during development
- ✅ **Fast** - No network latency
- ✅ **Isolated** - Test data doesn't touch production
- ✅ **Resettable** - Clear data anytime
- ✅ **Offline** - Works without internet

**Option 2: Use Production Firebase**

If you prefer to test with production Firebase during development, simply:
1. Don't start the emulators
2. Run `npm run dev`
3. The app will connect to your production Firebase instance

#### Production (Deployed)

When deployed to GitHub Pages or any non-localhost domain:
- ✅ **Automatically uses production Firebase**
- ✅ Environment variables from build-time (GitHub Secrets)
- ✅ No code changes needed
- ✅ Real authentication and data sync

**The switch is automatic** - just deploy and it works!

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

For GitHub Pages deployment, the build output will be in the `out/` directory and can be deployed as static files.

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
│   ├── AccountManagementScreen.tsx # Firebase auth UI
│   ├── CaseToggle.tsx     # Case toggle component
│   ├── Feedback.tsx       # Feedback display component
│   ├── GameContainer.tsx  # Main game container
│   ├── GameScreen.tsx     # Game screen wrapper
│   ├── LevelScreen.tsx    # Level selection screen
│   ├── ModeScreen.tsx     # Mode selection screen
│   ├── ParentLoginScreen.tsx
│   ├── ParentModeScreen.tsx
│   ├── RepeatButton.tsx   # Audio repeat button
│   ├── SyncStatusIndicator.tsx # Cloud sync status badge
│   └── WelcomeScreen.tsx
├── config/                # Configuration
│   └── firebase.ts        # Firebase initialization
├── context/               # State management
│   ├── AuthContext.tsx    # Firebase authentication state
│   └── GameContext.tsx    # Game state and actions
├── hooks/                 # Custom hooks
│   ├── useGameFeedback.ts # Feedback management
│   ├── useGameModeInitialization.ts # Game mode setup
│   └── useSpeechSynthesis.ts # Text-to-speech functionality
├── utils/                 # Utility functions
│   ├── firebaseSync.ts    # Cloud sync utilities
│   └── gameUtils.ts       # Game logic utilities
└── __tests__/             # Test files
    ├── utils/             # Utility function tests
    ├── hooks/             # Custom hook tests
    ├── components/        # Component tests
    ├── context/           # Context and state tests
    ├── integration/       # End-to-end flow tests
    └── testUtils.tsx      # Test utilities and helpers

Root files:
├── firestore.rules        # Firestore security rules
├── env.example            # Environment variables template
└── .env.local            # Your Firebase config (create from env.example)
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

#### Setting Environment Variables for GitHub Pages

Since GitHub Pages serves static files, Firebase environment variables are embedded into the JavaScript bundle **at build time**. You have two options:

**Option 1: Using GitHub Secrets (Recommended for CI/CD)**

1. **Add Firebase config as GitHub Secrets:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret" and add each value:
     - `FIREBASE_API_KEY` → your Firebase API key
     - `FIREBASE_AUTH_DOMAIN` → your-project.firebaseapp.com
     - `FIREBASE_PROJECT_ID` → your-project-id
     - `FIREBASE_STORAGE_BUCKET` → your-project.appspot.com
     - `FIREBASE_MESSAGING_SENDER_ID` → 123456789
     - `FIREBASE_APP_ID` → 1:123456789:web:abcdef

2. **Update your GitHub Actions workflow** (`.github/workflows/deploy.yml`):
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Run tests
           run: npm test
         
         - name: Build
           env:
             NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
             NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
             NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
             NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
             NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
             NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
           run: npm run build
         
         - name: Deploy to GitHub Pages
           if: github.ref == 'refs/heads/main'
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./out
   ```

**Option 2: Build Locally and Push**

If you're building locally before deploying:

1. Create `.env.local` with your Firebase config (already gitignored)
2. Run `npm run build` - this embeds the environment variables
3. Deploy the `out/` directory to GitHub Pages

**Important Security Note:**

Firebase config values (API keys, project IDs) are **designed to be public** and safe to include in client-side code. They will be visible in your deployed JavaScript bundle. Security is enforced through:
- **Firestore Security Rules** - Only authenticated users can access their own data
- **Firebase Authentication** - Users must sign in to sync data
- **Domain restrictions** - Configure allowed domains in Firebase Console

The `firestore.rules` file ensures users can only read/write their own data:
```
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

**Without Firebase Setup:**

The app works perfectly fine without any Firebase configuration. Users will simply use localStorage only (no cloud sync).

## License

MIT License - see LICENSE file for details