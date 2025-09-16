"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={false} // Don't refetch on window focus to prevent unnecessary hydration updates
    >
      {children}
    </SessionProvider>
  );
}
