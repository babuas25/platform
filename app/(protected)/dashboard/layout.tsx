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

