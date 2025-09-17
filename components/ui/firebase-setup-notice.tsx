"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ExternalLink, RefreshCw } from "lucide-react"

interface FirebaseSetupNoticeProps {
  error?: string
  onRetry?: () => void
}

export function FirebaseSetupNotice({ error, onRetry }: FirebaseSetupNoticeProps) {
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Firebase Configuration Required
        </CardTitle>
        <CardDescription>
          The application requires Firebase to be configured to access user data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Quick Fix</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <p>To see the app working with demo data, add this to your <code className="bg-muted px-1 rounded">.env.local</code> file:</p>
              <pre className="bg-muted p-2 rounded text-sm">USE_DEMO_DATA=true</pre>
              <p>Then restart the development server.</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-medium">Setup Steps:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Create a Firebase project at <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a></li>
            <li>Copy <code className="bg-muted px-1 rounded">.env.example</code> to <code className="bg-muted px-1 rounded">.env.local</code></li>
            <li>Fill in your Firebase configuration in <code className="bg-muted px-1 rounded">.env.local</code></li>
            <li>Restart the development server</li>
          </ol>
        </div>

        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <a href="/FIREBASE_SETUP.md" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Setup Guide
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
