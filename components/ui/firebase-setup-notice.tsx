"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ExternalLink, Copy } from "lucide-react"
import { useState } from "react"

export function FirebaseSetupNotice() {
  const [copied, setCopied] = useState(false)

  const envExample = `NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envExample)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          Firebase is not configured. Please set up your Firebase project to use the user management system.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Firebase Setup Instructions
          </CardTitle>
          <CardDescription>
            Follow these steps to configure Firebase for the user management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Create a Firebase Project</h4>
            <p className="text-sm text-muted-foreground">
              Go to the <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a> and create a new project.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">2. Enable Firestore Database</h4>
            <p className="text-sm text-muted-foreground">
              In your Firebase project, go to Firestore Database and create a database in production mode.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. Get Your Configuration</h4>
            <p className="text-sm text-muted-foreground">
              Go to Project Settings → General → Your apps → Web app and copy the configuration.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">4. Create Environment File</h4>
            <p className="text-sm text-muted-foreground">
              Create a <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">.env.local</code> file in your project root with the following variables:
            </p>
            <div className="relative">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                <code>{envExample}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="absolute top-2 right-2"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">5. Set Up Firestore Security Rules</h4>
            <p className="text-sm text-muted-foreground">
              In Firestore → Rules, set up appropriate security rules for your users collection.
            </p>
            <div className="bg-gray-100 p-4 rounded-md text-sm">
              <code>
                {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}`}
              </code>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">6. Restart Your Development Server</h4>
            <p className="text-sm text-muted-foreground">
              After adding the environment variables, restart your Next.js development server.
            </p>
          </div>

          <div className="pt-4 border-t">
            <Button asChild>
              <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Firebase Console
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
