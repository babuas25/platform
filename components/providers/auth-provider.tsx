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
      refetchOnWindowFocus={false} // Don't refetch on window focus
      refetchInterval={0} // Disable periodic refetch to prevent state transitions
    >
      {children}
    </SessionProvider>
  );
}
