"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Database, Users } from "lucide-react"

interface SeedResult {
  success: boolean
  name: string
  id?: string
  error?: string
}

interface SeedResponse {
  message: string
  results: SeedResult[]
  successCount: number
  failureCount: number
  timestamp: string
}

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SeedResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/seed-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed database')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database Seeder
          </h1>
          <p className="text-muted-foreground">
            Add sample user data to your Firestore database
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seed Users Collection
          </CardTitle>
          <CardDescription>
            This will create a "users" collection in your Firestore database with sample data including:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium">SuperAdmins</div>
              <div className="text-muted-foreground">3 users</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Admins</div>
              <div className="text-muted-foreground">2 users</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Staff</div>
              <div className="text-muted-foreground">6 users</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Partners</div>
              <div className="text-muted-foreground">3 users</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Agents</div>
              <div className="text-muted-foreground">4 users</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Public Users</div>
              <div className="text-muted-foreground">4 users</div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleSeed} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Seed Database
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {result.message}
              </AlertDescription>
            </Alert>
          )}

          {result && result.results && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seeding Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.results.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        {item.success ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Success</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-600">{item.error}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            1. Click "Seed Database" to create the users collection with sample data
          </p>
          <p className="text-sm text-muted-foreground">
            2. Go to your <a href="/user-management" className="text-blue-600 hover:underline">User Management</a> page to see the data
          </p>
          <p className="text-sm text-muted-foreground">
            3. Check your <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a> to see the data in Firestore
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

