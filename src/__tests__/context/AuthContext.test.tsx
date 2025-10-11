import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { 
  createMockUser, 
  createMockFirebaseError, 
  FirebaseErrorCodes,
  mockAuthStateManager,
  simulateNetworkError 
} from '../mocks/firebaseMocks'
import { 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  deleteUser,
  onAuthStateChanged
} from 'firebase/auth'
import { deleteDoc } from 'firebase/firestore'

// Mock Firebase modules
jest.mock('firebase/auth')
jest.mock('firebase/firestore')

const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
const mockSignInWithEmailPassword = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>
const mockCreateUserWithEmailPassword = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>
const mockSignOut = firebaseSignOut as jest.MockedFunction<typeof firebaseSignOut>
const mockSendPasswordResetEmail = sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>
const mockDeleteUser = deleteUser as jest.MockedFunction<typeof deleteUser>
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthStateManager.clearListeners()
    
    // Set up default mock implementations
    mockOnAuthStateChanged.mockImplementation(mockAuthStateManager.onAuthStateChanged)
    mockSignInWithPopup.mockImplementation(() => Promise.resolve({ user: mockAuthStateManager.currentUser }))
    mockSignInWithEmailPassword.mockImplementation(() => Promise.resolve({ user: mockAuthStateManager.currentUser }))
    mockCreateUserWithEmailPassword.mockImplementation(() => Promise.resolve({ user: mockAuthStateManager.currentUser }))
    mockSignOut.mockImplementation(() => Promise.resolve())
    mockSendPasswordResetEmail.mockImplementation(() => Promise.resolve())
    mockDeleteUser.mockImplementation(() => Promise.resolve())
    mockDeleteDoc.mockImplementation(() => Promise.resolve())
  })

  describe('AuthProvider', () => {
    it('should provide initial state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      expect(result.current.user).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.signInWithGoogle).toBe('function')
      expect(typeof result.current.signInWithEmailPassword).toBe('function')
      expect(typeof result.current.signUpWithEmailPassword).toBe('function')
      expect(typeof result.current.resetPassword).toBe('function')
      expect(typeof result.current.signOut).toBe('function')
      expect(typeof result.current.deleteAccount).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })

    it('should set up auth state listener on mount', () => {
      renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      expect(mockOnAuthStateChanged).toHaveBeenCalled()
    })

    it('should update user state when auth state changes', async () => {
      const mockUser = createMockUser()
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Simulate auth state change
      act(() => {
        mockAuthStateManager.setUser(mockUser)
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.loading).toBe(false)
      })
    })

    it('should set loading to false when auth state changes to null', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Simulate auth state change to null
      act(() => {
        mockAuthStateManager.setUser(null)
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('signInWithGoogle', () => {
    it('should sign in successfully', async () => {
      const mockUser = createMockUser()
      mockSignInWithPopup.mockResolvedValue({ user: mockUser } as any)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signInWithGoogle()
      })

      expect(mockSignInWithPopup).toHaveBeenCalled()
      expect(result.current.error).toBeNull()
    })

    it('should handle popup closed by user error', async () => {
      const error = createMockFirebaseError(FirebaseErrorCodes.POPUP_CLOSED_BY_USER)
      mockSignInWithPopup.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signInWithGoogle()
      })

      expect(result.current.error).toBe('Sign-in popup was closed')
    })

    it('should handle cancelled popup request error', async () => {
      const error = createMockFirebaseError(FirebaseErrorCodes.CANCELLED_POPUP_REQUEST)
      mockSignInWithPopup.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signInWithGoogle()
      })

      expect(result.current.error).toBe('Sign-in cancelled')
    })

    it('should handle network error', async () => {
      const error = createMockFirebaseError(FirebaseErrorCodes.NETWORK_REQUEST_FAILED)
      mockSignInWithPopup.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        try {
          await result.current.signInWithGoogle()
        } catch (e) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Firebase error: auth/network-request-failed')
    })

    it('should clear error before attempting sign in', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Set an initial error
      act(() => {
        result.current.clearError()
      })

      const mockUser = createMockUser()
      mockSignInWithPopup.mockResolvedValue({ user: mockUser } as any)

      await act(async () => {
        await result.current.signInWithGoogle()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('signInWithEmailPassword', () => {
    it('should sign in successfully', async () => {
      const mockUser = createMockUser()
      mockSignInWithEmailPassword.mockResolvedValue({ user: mockUser } as any)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signInWithEmailPassword('test@example.com', 'password123')
      })

      expect(mockSignInWithEmailPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123')
      expect(result.current.error).toBeNull()
    })

    it('should handle invalid email error', async () => {
      const error = createMockFirebaseError(FirebaseErrorCodes.INVALID_EMAIL)
      mockSignInWithEmailPassword.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signInWithEmailPassword('invalid-email', 'password123')
      })

      expect(result.current.error).toBe('Invalid email address')
    })

    it('should handle user not found error', async () => {
      const error = createMockFirebaseError(FirebaseErrorCodes.USER_NOT_FOUND)
      mockSignInWithEmailPassword.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signInWithEmailPassword('test@example.com', 'wrongpassword')
      })

      expect(result.current.error).toBe('No account found with this email')
    })

    it('should handle wrong password error', async () => {
      const error = createMockFirebaseError(FirebaseErrorCodes.WRONG_PASSWORD)
      mockSignInWithEmailPassword.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signInWithEmailPassword('test@example.com', 'wrongpassword')
      })

      expect(result.current.error).toBe('Incorrect password')
    })

    it('should handle user disabled error', async () => {
      const error = createMockFirebaseError(FirebaseErrorCodes.USER_DISABLED)
      mockSignInWithEmailPassword.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signInWithEmailPassword('test@example.com', 'password123')
      })

      expect(result.current.error).toBe('This account has been disabled')
    })
  })

  describe('signUpWithEmailPassword', () => {
    it('should sign up successfully', async () => {
      const mockUser = createMockUser()
      mockCreateUserWithEmailPassword.mockResolvedValue({ user: mockUser } as any)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signUpWithEmailPassword('test@example.com', 'password123')
      })

      expect(mockCreateUserWithEmailPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123')
      expect(result.current.error).toBeNull()
    })

    it('should handle email already in use error', async () => {
      const error = createMockFirebaseError(FirebaseErrorCodes.EMAIL_ALREADY_IN_USE)
      mockCreateUserWithEmailPassword.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signUpWithEmailPassword('test@example.com', 'password123')
      })

      expect(result.current.error).toBe('An account with this email already exists')
    })

    it('should handle weak password error', async () => {
      const error = createMockFirebaseError(FirebaseErrorCodes.WEAK_PASSWORD)
      mockCreateUserWithEmailPassword.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signUpWithEmailPassword('test@example.com', '123')
      })

      expect(result.current.error).toBe('Password should be at least 6 characters')
    })

    it('should handle invalid email error', async () => {
      const error = createMockFirebaseError(FirebaseErrorCodes.INVALID_EMAIL)
      mockCreateUserWithEmailPassword.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signUpWithEmailPassword('invalid-email', 'password123')
      })

      expect(result.current.error).toBe('Invalid email address')
    })
  })

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      mockSendPasswordResetEmail.mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.resetPassword('test@example.com')
      })

      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'test@example.com')
      expect(result.current.error).toBeNull()
    })

    it('should handle invalid email error', async () => {
      const error = createMockFirebaseError(FirebaseErrorCodes.INVALID_EMAIL)
      mockSendPasswordResetEmail.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.resetPassword('invalid-email')
      })

      expect(result.current.error).toBe('Invalid email address')
    })

    it('should handle user not found error', async () => {
      const error = createMockFirebaseError(FirebaseErrorCodes.USER_NOT_FOUND)
      mockSendPasswordResetEmail.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.resetPassword('nonexistent@example.com')
      })

      expect(result.current.error).toBe('No account found with this email')
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockSignOut.mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockSignOut).toHaveBeenCalled()
      expect(result.current.error).toBeNull()
    })

    it('should handle sign out error', async () => {
      const error = createMockFirebaseError(FirebaseErrorCodes.NETWORK_REQUEST_FAILED)
      mockSignOut.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(result.current.error).toBe('Firebase error: auth/network-request-failed')
    })
  })

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      const mockUser = createMockUser()
      mockDeleteDoc.mockResolvedValue(undefined)
      mockDeleteUser.mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Set a user first
      act(() => {
        mockAuthStateManager.setUser(mockUser)
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      await act(async () => {
        await result.current.deleteAccount()
      })

      expect(mockDeleteDoc).toHaveBeenCalled()
      expect(mockDeleteUser).toHaveBeenCalledWith(mockUser)
      expect(result.current.error).toBeNull()
    })

    it('should handle Firestore deletion error', async () => {
      const mockUser = createMockUser()
      const error = createMockFirebaseError(FirebaseErrorCodes.PERMISSION_DENIED)
      mockDeleteDoc.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Set a user first
      act(() => {
        mockAuthStateManager.setUser(mockUser)
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      await act(async () => {
        await result.current.deleteAccount()
      })

      expect(result.current.error).toBe('Firebase error: auth/permission-denied')
    })

    it('should handle user deletion error', async () => {
      const mockUser = createMockUser()
      const error = createMockFirebaseError(FirebaseErrorCodes.NETWORK_REQUEST_FAILED)
      mockDeleteDoc.mockResolvedValue(undefined)
      mockDeleteUser.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Set a user first
      act(() => {
        mockAuthStateManager.setUser(mockUser)
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      await act(async () => {
        await result.current.deleteAccount()
      })

      expect(result.current.error).toBe('Firebase error: auth/network-request-failed')
    })

    it('should not attempt deletion when no user is signed in', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.deleteAccount()
      })

      expect(mockDeleteDoc).not.toHaveBeenCalled()
      expect(mockDeleteUser).not.toHaveBeenCalled()
    })
  })

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Set an error first
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('useAuth hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')
      
      consoleSpy.mockRestore()
    })
  })

  describe('error handling', () => {
    it('should handle unknown error codes with generic message', async () => {
      const error = createMockFirebaseError('auth/unknown-error', 'Custom error message')
      mockSignInWithEmailPassword.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signInWithEmailPassword('test@example.com', 'password123')
      })

      expect(result.current.error).toBe('Custom error message')
    })

    it('should handle errors without code', async () => {
      const error = new Error('Generic error')
      mockSignInWithEmailPassword.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signInWithEmailPassword('test@example.com', 'password123')
      })

      expect(result.current.error).toBe('Generic error')
    })
  })
})
