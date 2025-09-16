"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import type { Session } from "next-auth";

interface AuthProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={false} // Don't refetch on window focus to prevent unnecessary hydration updates
      refetchOnMount={false} // Don't refetch on mount to prevent hydration mismatch
    >
      {children}
    </SessionProvider>
  );
}
