// client/src/lib/firebase.ts
// Firebase stub - Firebase is not used in this project

export const initializeFirebase = () => {
  console.log('Firebase not configured - using local notifications only')
  return false
}

export const requestNotificationPermission = async () => {
  console.log('Using browser notifications instead of Firebase')
  
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  return false
}

export const onMessageListener = () => {
  console.log('Firebase messaging not configured')
  return Promise.resolve()
}

export const saveFCMToken = async () => {
  console.log('FCM tokens not used - Firebase disabled')
  return false
}

export const storage = null
export const messaging = null

const firebaseServices = {
  initializeFirebase,
  requestNotificationPermission,
  onMessageListener,
  saveFCMToken,
  storage,
  messaging
}

export default firebaseServices
