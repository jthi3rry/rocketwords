import {
  syncToFirestore,
  syncFromFirestore,
  mergeData,
  enableAutoSync,
  disableAutoSync
} from './firebaseSyncTest'
import { 
  setupIntegrationTests, 
  teardownIntegrationTests,
  createTestUser,
  signInTestUser,
  signOutTestUser,
  waitForAuthState
} from './setup'
import { 
  createUserWithFirestoreData,
  createConflictingData,
  waitForRealtimeUpdate,
  measureSyncTime,
  createTimestampedData
} from './testHelpers'

describe.skip('Firebase Sync Integration Tests', () => {
  beforeAll(async () => {
    await setupIntegrationTests()
  })

  afterAll(async () => {
    await teardownIntegrationTests()
  })

  describe('syncToFirestore', () => {
    it('should upload local data to Firestore', async () => {
      const { user } = await createUserWithFirestoreData()
      const localLevels = {
        level1: { name: 'Local Level 1', words: ['local', 'data'] },
        level2: { name: 'Local Level 2', words: ['more', 'local', 'data'] }
      }

      await syncToFirestore(user.uid, localLevels)

      // Verify data was uploaded
      const { getTestFirestoreData } = await import('./setup')
      const uploadedData = await getTestFirestoreData(user.uid)
      
      expect(uploadedData.levels).toEqual(localLevels)
      expect(uploadedData.lastModified).toBeDefined()
      expect(typeof uploadedData.lastModified).toBe('number')
    })

    it('should update existing data in Firestore', async () => {
      const { user, levelsData } = await createUserWithFirestoreData()
      const updatedLevels = {
        ...levelsData.levels,
        level1: { name: 'Updated Level 1', words: ['updated', 'words'] },
        level3: { name: 'New Level 3', words: ['new', 'level'] }
      }

      await syncToFirestore(user.uid, updatedLevels)

      // Verify data was updated
      const { getTestFirestoreData } = await import('./setup')
      const uploadedData = await getTestFirestoreData(user.uid)
      
      expect(uploadedData.levels).toEqual(updatedLevels)
      expect(uploadedData.lastModified).toBeGreaterThan(levelsData.lastModified)
    })

    it('should handle empty levels object', async () => {
      const { user } = await createUserWithFirestoreData()
      const emptyLevels = {}

      await syncToFirestore(user.uid, emptyLevels)

      // Verify empty data was uploaded
      const { getTestFirestoreData } = await import('./setup')
      const uploadedData = await getTestFirestoreData(user.uid)
      
      expect(uploadedData.levels).toEqual(emptyLevels)
    })

    it('should handle large datasets', async () => {
      const { user } = await createUserWithFirestoreData()
      const largeLevels = Object.fromEntries(
        Array.from({ length: 10 }, (_, i) => [
          `level${i + 1}`,
          {
            name: `Level ${i + 1}`,
            words: Array.from({ length: 50 }, (_, j) => `word${i}-${j}`)
          }
        ])
      )

      const syncTime = await measureSyncTime(() => syncToFirestore(user.uid, largeLevels))
      
      // Should complete within reasonable time
      expect(syncTime).toBeLessThan(5000)

      // Verify data was uploaded
      const { getTestFirestoreData } = await import('./setup')
      const uploadedData = await getTestFirestoreData(user.uid)
      
      expect(Object.keys(uploadedData.levels)).toHaveLength(10)
      expect(uploadedData.levels.level1.words).toHaveLength(50)
    })
  })

  describe('syncFromFirestore', () => {
    it('should download existing data from Firestore', async () => {
      const { user, levelsData } = await createUserWithFirestoreData()

      const downloadedLevels = await syncFromFirestore(user.uid)

      expect(downloadedLevels).toEqual(levelsData.levels)
    })

    it('should return null for non-existent user data', async () => {
      const { user } = await createUserWithFirestoreData()
      const nonExistentUserId = 'non-existent-user'

      const downloadedLevels = await syncFromFirestore(nonExistentUserId)

      expect(downloadedLevels).toBeNull()
    })

    it('should handle empty Firestore data', async () => {
      const { user } = await createUserWithFirestoreData({}, { levels: {} })

      const downloadedLevels = await syncFromFirestore(user.uid)

      expect(downloadedLevels).toEqual({})
    })
  })

  describe('mergeData', () => {
    it('should upload local data when no remote data exists', async () => {
      const { user } = await createUserWithFirestoreData()
      const localLevels = {
        level1: { name: 'Local Only Level', words: ['local', 'only'] }
      }
      const localLastModified = Date.now()

      const result = await mergeData(user.uid, localLevels, localLastModified)

      expect(result.levels).toEqual(localLevels)
      expect(result.lastModified).toBe(localLastModified)

      // Verify data was uploaded to Firestore
      const { getTestFirestoreData } = await import('./setup')
      const uploadedData = await getTestFirestoreData(user.uid)
      expect(uploadedData.levels).toEqual(localLevels)
    })

    it('should use local data when local is newer', async () => {
      const { user } = await createUserWithFirestoreData()
      const localLevels = {
        level1: { name: 'Newer Local Level', words: ['newer', 'local'] }
      }
      const localLastModified = Date.now()
      const remoteLastModified = localLastModified - 1000 // 1 second older

      // Set up remote data with older timestamp
      const { setTestFirestoreData } = await import('./setup')
      await setTestFirestoreData(user.uid, {
        levels: { level1: { name: 'Older Remote Level', words: ['older', 'remote'] } },
        lastModified: remoteLastModified
      })

      const result = await mergeData(user.uid, localLevels, localLastModified)

      expect(result.levels).toEqual(localLevels)
      expect(result.lastModified).toBe(localLastModified)

      // Verify local data was uploaded
      const { getTestFirestoreData } = await import('./setup')
      const uploadedData = await getTestFirestoreData(user.uid)
      expect(uploadedData.levels).toEqual(localLevels)
    })

    it('should use remote data when remote is newer', async () => {
      const { user } = await createUserWithFirestoreData()
      const localLevels = {
        level1: { name: 'Older Local Level', words: ['older', 'local'] }
      }
      const localLastModified = Date.now() - 1000 // 1 second older
      const remoteLastModified = Date.now()
      const remoteLevels = {
        level1: { name: 'Newer Remote Level', words: ['newer', 'remote'] }
      }

      // Set up remote data with newer timestamp
      const { setTestFirestoreData } = await import('./setup')
      await setTestFirestoreData(user.uid, {
        levels: remoteLevels,
        lastModified: remoteLastModified
      })

      const result = await mergeData(user.uid, localLevels, localLastModified)

      expect(result.levels).toEqual(remoteLevels)
      expect(result.lastModified).toBe(remoteLastModified)
    })

    it('should use remote data when timestamps are equal', async () => {
      const { user } = await createUserWithFirestoreData()
      const timestamp = Date.now()
      const localLevels = {
        level1: { name: 'Local Level', words: ['local'] }
      }
      const remoteLevels = {
        level1: { name: 'Remote Level', words: ['remote'] }
      }

      // Set up remote data with same timestamp
      const { setTestFirestoreData } = await import('./setup')
      await setTestFirestoreData(user.uid, {
        levels: remoteLevels,
        lastModified: timestamp
      })

      const result = await mergeData(user.uid, localLevels, timestamp)

      expect(result.levels).toEqual(remoteLevels)
      expect(result.lastModified).toBe(timestamp)
    })

    it('should handle conflict resolution with multiple levels', async () => {
      const { user } = await createUserWithFirestoreData()
      const localLevels = {
        level1: { name: 'Local Level 1', words: ['local1'] },
        level2: { name: 'Local Level 2', words: ['local2'] }
      }
      const localLastModified = Date.now()
      const remoteLastModified = localLastModified - 1000
      const remoteLevels = {
        level1: { name: 'Remote Level 1', words: ['remote1'] },
        level3: { name: 'Remote Level 3', words: ['remote3'] }
      }

      // Set up remote data
      const { setTestFirestoreData } = await import('./setup')
      await setTestFirestoreData(user.uid, {
        levels: remoteLevels,
        lastModified: remoteLastModified
      })

      const result = await mergeData(user.uid, localLevels, localLastModified)

      // Local should win (newer timestamp)
      expect(result.levels).toEqual(localLevels)
      expect(result.lastModified).toBe(localLastModified)
    })
  })

  describe('Real-time Sync', () => {
    it('should set up real-time listener', async () => {
      const { user } = await createUserWithFirestoreData()
      let receivedUpdates = 0
      let lastUpdate: any = null

      const onUpdate = (levels: any, lastModified: number) => {
        receivedUpdates++
        lastUpdate = { levels, lastModified }
      }

      const onError = (error: any) => {
        throw error
      }

      // Enable auto-sync
      const unsubscribe = enableAutoSync(user.uid, onUpdate, onError)

      // Wait for initial update
      await new Promise(resolve => setTimeout(resolve, 100))

      // Update data in Firestore
      const { setTestFirestoreData } = await import('./setup')
      const newData = {
        levels: { level1: { name: 'Updated Level', words: ['updated'] } },
        lastModified: Date.now()
      }
      await setTestFirestoreData(user.uid, newData)

      // Wait for real-time update
      await new Promise(resolve => setTimeout(resolve, 500))

      // Verify update was received
      expect(receivedUpdates).toBeGreaterThan(0)
      expect(lastUpdate).toBeDefined()
      expect(lastUpdate.levels).toEqual(newData.levels)

      // Clean up
      unsubscribe()
    })

    it('should handle multiple listeners', async () => {
      const { user } = await createUserWithFirestoreData()
      let updates1 = 0
      let updates2 = 0

      const onUpdate1 = () => { updates1++ }
      const onUpdate2 = () => { updates2++ }
      const onError = () => {}

      // Set up first listener
      const unsubscribe1 = enableAutoSync(user.uid, onUpdate1, onError)

      // Set up second listener (should unsubscribe first)
      const unsubscribe2 = enableAutoSync(user.uid, onUpdate2, onError)

      // Update data
      const { setTestFirestoreData } = await import('./setup')
      await setTestFirestoreData(user.uid, {
        levels: { level1: { name: 'Test', words: ['test'] } },
        lastModified: Date.now()
      })

      // Wait for updates
      await new Promise(resolve => setTimeout(resolve, 500))

      // Only second listener should receive updates
      expect(updates1).toBe(0) // First listener should be unsubscribed
      expect(updates2).toBeGreaterThan(0) // Second listener should receive updates

      // Clean up
      unsubscribe2()
    })

    it('should handle listener errors', async () => {
      const { user } = await createUserWithFirestoreData()
      let errorReceived = false

      const onUpdate = () => {}
      const onError = (error: any) => {
        errorReceived = true
      }

      // Enable auto-sync
      const unsubscribe = enableAutoSync(user.uid, onUpdate, onError)

      // Simulate error by signing out (this should trigger permission error)
      await signOutTestUser()

      // Wait for error
      await new Promise(resolve => setTimeout(resolve, 500))

      // Verify error was handled
      expect(errorReceived).toBe(true)

      // Clean up
      unsubscribe()
    })

    it('should disable auto-sync correctly', async () => {
      const { user } = await createUserWithFirestoreData()
      let updates = 0

      const onUpdate = () => { updates++ }
      const onError = () => {}

      // Enable auto-sync
      enableAutoSync(user.uid, onUpdate, onError)

      // Wait for initial update
      await new Promise(resolve => setTimeout(resolve, 100))

      // Disable auto-sync
      disableAutoSync()

      // Update data
      const { setTestFirestoreData } = await import('./setup')
      await setTestFirestoreData(user.uid, {
        levels: { level1: { name: 'After Disable', words: ['after'] } },
        lastModified: Date.now()
      })

      // Wait for potential updates
      await new Promise(resolve => setTimeout(resolve, 500))

      // Should not receive updates after disabling
      const updatesAfterDisable = updates
      
      // Update data again
      await setTestFirestoreData(user.uid, {
        levels: { level1: { name: 'Another Update', words: ['another'] } },
        lastModified: Date.now()
      })

      // Wait again
      await new Promise(resolve => setTimeout(resolve, 500))

      // Updates should not have increased
      expect(updates).toBe(updatesAfterDisable)
    })
  })

  describe('Multi-Device Simulation', () => {
    it('should sync data between simulated devices', async () => {
      // Simulate two devices for the same user
      const { user } = await createUserWithFirestoreData()

      // Device 1: Upload initial data
      const device1Levels = {
        level1: { name: 'Device 1 Level', words: ['device1'] }
      }
      await syncToFirestore(user.uid, device1Levels)

      // Device 2: Download data
      const downloadedLevels = await syncFromFirestore(user.uid)
      expect(downloadedLevels).toEqual(device1Levels)

      // Device 2: Modify and upload
      const device2Levels = {
        ...downloadedLevels,
        level2: { name: 'Device 2 Level', words: ['device2'] }
      }
      await syncToFirestore(user.uid, device2Levels)

      // Device 1: Download updated data
      const updatedLevels = await syncFromFirestore(user.uid)
      expect(updatedLevels).toEqual(device2Levels)
    })

    it('should handle concurrent modifications', async () => {
      const { user } = await createUserWithFirestoreData()

      // Simulate concurrent modifications
      const device1Levels = {
        level1: { name: 'Device 1 Modification', words: ['device1'] }
      }
      const device2Levels = {
        level1: { name: 'Device 2 Modification', words: ['device2'] }
      }

      // Both devices modify at the same time
      const [result1, result2] = await Promise.all([
        mergeData(user.uid, device1Levels, Date.now()),
        mergeData(user.uid, device2Levels, Date.now() + 1) // Slightly newer
      ])

      // The newer modification should win
      expect(result2.levels).toEqual(device2Levels)
    })
  })

  describe('Performance', () => {
    it('should handle rapid sync operations', async () => {
      const { user } = await createUserWithFirestoreData()
      const baseLevels = {
        level1: { name: 'Base Level', words: ['base'] }
      }

      const startTime = Date.now()

      // Perform 20 rapid sync operations
      for (let i = 0; i < 20; i++) {
        const levels = {
          ...baseLevels,
          level1: { name: `Level ${i}`, words: [`word${i}`] }
        }
        await syncToFirestore(user.uid, levels)
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(10000)

      // Verify final state
      const finalLevels = await syncFromFirestore(user.uid)
      expect(finalLevels.level1.name).toBe('Level 19')
    })

    it('should handle large data sync efficiently', async () => {
      const { user } = await createUserWithFirestoreData()
      const largeLevels = Object.fromEntries(
        Array.from({ length: 5 }, (_, i) => [
          `level${i + 1}`,
          {
            name: `Level ${i + 1}`,
            words: Array.from({ length: 100 }, (_, j) => `word${i}-${j}`)
          }
        ])
      )

      const syncTime = await measureSyncTime(() => syncToFirestore(user.uid, largeLevels))
      
      // Should complete within reasonable time
      expect(syncTime).toBeLessThan(3000)

      // Verify data integrity
      const downloadedLevels = await syncFromFirestore(user.uid)
      expect(downloadedLevels).toEqual(largeLevels)
    })
  })
})
