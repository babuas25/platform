import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

const auth = getAuth(app)
// Ensure auth state persists after redirects/reloads
setPersistence(auth, browserLocalPersistence).catch(() => {
  // Non-blocking: if persistence cannot be set (e.g., private mode), fall back silently
})
const googleProvider = new GoogleAuthProvider()
// Force account picker/consent so users explicitly confirm sign-in
googleProvider.setCustomParameters({ prompt: 'consent select_account' })

const facebookProvider = new FacebookAuthProvider()
facebookProvider.setCustomParameters({ display: 'popup' })

export { app, auth, googleProvider, facebookProvider }

