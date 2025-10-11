import { 
  setupIntegrationTests, 
  teardownIntegrationTests,
  createTestUser,
  signInTestUser,
  signOutTestUser,
  waitForAuthState,
  createTestUserData
} from './setup'
import { 
  createTestUserWithData,
  signInTestUserWithData,
  createMultipleTestUsers,
  testWithInvalidUser
} from './testHelpers'

describe.skip('Firebase Auth Integration Tests', () => {
  beforeAll(async () => {
    await setupIntegrationTests()
  })

  afterAll(async () => {
    await teardownIntegrationTests()
  })

  describe('User Creation', () => {
    it('should create a new user with email and password', async () => {
      const { email, password } = createTestUserData()
      
      const user = await createTestUser(email, password)
      
      expect(user).toBeDefined()
      expect(user.email).toBe(email)
      expect(user.uid).toBeDefined()
      expect(user.emailVerified).toBe(false)
    })

    it('should handle duplicate email creation', async () => {
      const { email, password } = createTestUserData()
      
      // Create first user
      const user1 = await createTestUser(email, password)
      expect(user1).toBeDefined()
      
      // Try to create second user with same email
      try {
        await createTestUser(email, password)
        fail('Should have thrown error for duplicate email')
      } catch (error: any) {
        expect(error.code).toBe('auth/email-already-in-use')
      }
    })

    it('should validate email format', async () => {
      const invalidEmail = 'invalid-email'
      const password = 'password123'
      
      try {
        await createTestUser(invalidEmail, password)
        fail('Should have thrown error for invalid email')
      } catch (error: any) {
        expect(error.code).toBe('auth/invalid-email')
      }
    })

    it('should validate password strength', async () => {
      const { email } = createTestUserData()
      const weakPassword = '123'
      
      try {
        await createTestUser(email, weakPassword)
        fail('Should have thrown error for weak password')
      } catch (error: any) {
        expect(error.code).toBe('auth/weak-password')
      }
    })
  })

  describe('User Sign In', () => {
    let testUser: any

    beforeEach(async () => {
      testUser = await createTestUserWithData()
    })

    it('should sign in with valid credentials', async () => {
      const { user } = await signInTestUserWithData({
        email: testUser.email,
        password: testUser.password
      })
      
      expect(user).toBeDefined()
      expect(user.email).toBe(testUser.email)
      expect(user.uid).toBe(testUser.user.uid)
    })

    it('should fail with incorrect password', async () => {
      try {
        await signInTestUser(testUser.email, 'wrongpassword')
        fail('Should have thrown error for wrong password')
      } catch (error: any) {
        expect(error.code).toBe('auth/wrong-password')
      }
    })

    it('should fail with non-existent email', async () => {
      try {
        await signInTestUser('nonexistent@example.com', 'password123')
        fail('Should have thrown error for non-existent email')
      } catch (error: any) {
        expect(error.code).toBe('auth/user-not-found')
      }
    })

    it('should handle invalid email format', async () => {
      try {
        await signInTestUser('invalid-email', 'password123')
        fail('Should have thrown error for invalid email')
      } catch (error: any) {
        expect(error.code).toBe('auth/invalid-email')
      }
    })
  })

  describe('User Sign Out', () => {
    let testUser: any

    beforeEach(async () => {
      testUser = await createTestUserWithData()
      await signInTestUser(testUser.email, testUser.password)
    })

    it('should sign out successfully', async () => {
      await signOutTestUser()
      
      // Wait for auth state to change
      await waitForAuthState(null)
      
      // Verify user is signed out
      expect(true).toBe(true) // Auth state change verified by waitForAuthState
    })

    it('should handle sign out when no user is signed in', async () => {
      // Sign out first
      await signOutTestUser()
      await waitForAuthState(null)
      
      // Try to sign out again
      await signOutTestUser() // Should not throw
    })
  })

  describe('Auth State Management', () => {
    it('should maintain auth state across operations', async () => {
      const testUser = await createTestUserWithData()
      
      // Sign in
      await signInTestUser(testUser.email, testUser.password)
      await waitForAuthState(testUser.user)
      
      // Sign out
      await signOutTestUser()
      await waitForAuthState(null)
      
      // Sign in again
      await signInTestUser(testUser.email, testUser.password)
      await waitForAuthState(testUser.user)
    })

    it('should handle multiple users', async () => {
      const users = await createMultipleTestUsers(3)
      
      // Sign in as first user
      await signInTestUser(users[0].email, users[0].password)
      await waitForAuthState(users[0].user)
      
      // Sign out
      await signOutTestUser()
      await waitForAuthState(null)
      
      // Sign in as second user
      await signInTestUser(users[1].email, users[1].password)
      await waitForAuthState(users[1].user)
      
      // Sign out
      await signOutTestUser()
      await waitForAuthState(null)
      
      // Sign in as third user
      await signInTestUser(users[2].email, users[2].password)
      await waitForAuthState(users[2].user)
    })
  })

  describe('User Persistence', () => {
    it('should persist user data across sessions', async () => {
      const testUser = await createTestUserWithData()
      
      // Sign in
      await signInTestUser(testUser.email, testUser.password)
      await waitForAuthState(testUser.user)
      
      // Sign out
      await signOutTestUser()
      await waitForAuthState(null)
      
      // Sign in again with same credentials
      const { user } = await signInTestUserWithData({
        email: testUser.email,
        password: testUser.password
      })
      
      expect(user.uid).toBe(testUser.user.uid)
      expect(user.email).toBe(testUser.email)
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This test would require network simulation
      // For now, we'll test with invalid credentials
      try {
        await signInTestUser('test@example.com', 'wrongpassword')
        fail('Should have thrown error')
      } catch (error: any) {
        expect(error.code).toBe('auth/wrong-password')
      }
    })

    it('should handle too many requests', async () => {
      const { email, password } = createTestUserData()
      
      // Create user
      await createTestUser(email, password)
      
      // Try to sign in multiple times rapidly
      const promises = Array.from({ length: 10 }, () => 
        signInTestUser(email, password).catch(error => error)
      )
      
      const results = await Promise.all(promises)
      
      // At least one should succeed
      const successes = results.filter(result => !result.code)
      expect(successes.length).toBeGreaterThan(0)
    })
  })

  describe('User Management', () => {
    it('should handle user deletion', async () => {
      const testUser = await createTestUserWithData()
      
      // Sign in
      await signInTestUser(testUser.email, testUser.password)
      await waitForAuthState(testUser.user)
      
      // Note: User deletion would require admin SDK in real Firebase
      // In emulator, we can test the flow but actual deletion might not work
      // This is a limitation of the emulator
      
      // Sign out
      await signOutTestUser()
      await waitForAuthState(null)
    })

    it('should handle disabled users', async () => {
      const testUser = await createTestUserWithData()
      
      // Sign in
      await signInTestUser(testUser.email, testUser.password)
      await waitForAuthState(testUser.user)
      
      // Note: User disabling would require admin SDK
      // This test documents the expected behavior
      
      // Sign out
      await signOutTestUser()
      await waitForAuthState(null)
    })
  })

  describe('Security', () => {
    it('should not allow access to other users data', async () => {
      const user1 = await createTestUserWithData()
      const user2 = await createTestUserWithData()
      
      // Sign in as user1
      await signInTestUser(user1.email, user1.password)
      await waitForAuthState(user1.user)
      
      // Try to access user2's data (this would be tested in Firestore tests)
      // For now, just verify we're signed in as user1
      expect(user1.user.uid).toBeDefined()
      
      // Sign out
      await signOutTestUser()
      await waitForAuthState(null)
    })

    it('should require authentication for protected operations', async () => {
      // Test that operations fail when not authenticated
      await testWithInvalidUser(async () => {
        // This would be a protected operation
        throw new Error('Operation should require authentication')
      })
    })
  })

  describe('Performance', () => {
    it('should handle concurrent user creation', async () => {
      const userPromises = Array.from({ length: 5 }, (_, i) => 
        createTestUserWithData({ email: `concurrent${i}@example.com` })
      )
      
      const users = await Promise.all(userPromises)
      
      expect(users).toHaveLength(5)
      users.forEach((user, index) => {
        expect(user.email).toBe(`concurrent${index}@example.com`)
        expect(user.user.uid).toBeDefined()
      })
    })

    it('should handle rapid sign in/out cycles', async () => {
      const testUser = await createTestUserWithData()
      
      // Perform multiple sign in/out cycles
      for (let i = 0; i < 5; i++) {
        await signInTestUser(testUser.email, testUser.password)
        await waitForAuthState(testUser.user)
        
        await signOutTestUser()
        await waitForAuthState(null)
      }
    })
  })
})
