import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence, browserPopupRedirectResolver } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
}

// Initialize (or reuse) the Firebase app instance
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Initialize Auth with persistence as early as possible on the client.
// Fallback to getAuth() if already initialized or on server.
let auth = (() => {
  if (typeof window !== 'undefined') {
    try {
      return initializeAuth(app, {
        persistence: [
          indexedDBLocalPersistence,
          browserLocalPersistence,
          browserSessionPersistence,
        ],
        popupRedirectResolver: browserPopupRedirectResolver,
      })
    } catch {
      // If Auth was already initialized, fall back to getAuth
      return getAuth(app)
    }
  }
  // SSR path - no persistence
  return getAuth(app)
})()
const googleProvider = new GoogleAuthProvider()
// Force account picker/consent so users explicitly confirm sign-in
googleProvider.setCustomParameters({ prompt: 'consent select_account' })

const facebookProvider = new FacebookAuthProvider()
facebookProvider.setCustomParameters({ display: 'popup' })

export { app, auth, googleProvider, facebookProvider }

