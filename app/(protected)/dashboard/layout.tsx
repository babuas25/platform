"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { PageLoading } from "@/components/ui/loading"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const oauthFlow = typeof window !== 'undefined' ? sessionStorage.getItem('oauthFlow') : null
      // During OAuth flow return, user can be temporarily null. Avoid redirecting in that case.
      if (!user && oauthFlow) {
        // Stay in checking state to prevent a flicker/redirect loop
        setIsChecking(true)
        setIsAuthed(false)
        return
      }
      if (user) {
        setIsAuthed(true)
        setIsChecking(false)
      } else {
        setIsAuthed(false)
        setIsChecking(false)
        router.replace("/auth")
      }
    })
    return () => unsub()
  }, [router])

  if (isChecking) {
    return <PageLoading />
  }

  if (!isAuthed) {
    return null
  }

  return <>{children}</>
}

