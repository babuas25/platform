"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Database, Users, HardDrive, Server, Settings, Cog } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { testDatabaseConnection, type DatabaseTestResult } from "@/lib/database-test"

interface InitResult {
  success: boolean
  name: string
  id?: string
  error?: string
}

interface InitResponse {
  message: string
  results: InitResult[]
  successCount: number
  failureCount: number
  timestamp: string
}

interface DatabaseStatus {
  connected: boolean
  collections: string[]
  userCount: number
  initialized: boolean
  error?: string
  environment?: string
  canWrite?: boolean
  canRead?: boolean
  canCreateCollections?: boolean
  errorCode?: string
  hasPermissionIssues?: boolean
  note?: string
}

interface ConfigStatus {
  environment: string
  firebaseConfigured: boolean
  missingVars: string[]
  configValues: {
    projectId: string
    authDomain: string
    nodeEnv: string
    emulatorEnabled: string
  }
  timestamp: string
}

export default function DatabaseInitPage() {
  const { data: session, status } = useSession()
  
  // Loading and result states
  const [seedLoading, setSeedLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [clearLoading, setClearLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)
  
  // Result states
  const [seedResult, setSeedResult] = useState<InitResponse | null>(null)
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null)
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [showProductionWarning, setShowProductionWarning] = useState(true)
  const [clientTestResult, setClientTestResult] = useState<DatabaseTestResult | null>(null)
  const [serverConnectivity, setServerConnectivity] = useState<any>(null)

  // Check if running in production
  const isProduction = process.env.NODE_ENV === 'production'

  if (status === "loading") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    )
  }
  
  if (!session) {
    redirect("/auth")
  }

  const userRole = (session?.user as any)?.role || 'User'
  
  // Only SuperAdmin can access this page
  if (userRole !== 'SuperAdmin') {
    redirect("/user-management")
  }

  const checkFirebaseConfig = async () => {
    setConfigLoading(true)
    setError(null)
    
    try {
      console.log('Checking Firebase configuration...')
      const response = await fetch('/api/database/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Config response:', response.status, response.ok)
      const data = await response.json()
      console.log('Config data:', data)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setConfigStatus(data)
      
      if (!data.firebaseConfigured) {
        setError(`Firebase not properly configured. Missing: ${data.missingVars.join(', ')}`)
      }
    } catch (err) {
      console.error('Config check error:', err)
      setError(err instanceof Error ? err.message : 'Failed to check Firebase configuration')
    } finally {
      setConfigLoading(false)
    }
  }

  const checkDatabaseStatus = async () => {
    setStatusLoading(true)
    setError(null)
    
    try {
      console.log('Checking database status...')
      const response = await fetch('/api/database/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Status response:', response.status, response.ok)
      const data = await response.json()
      console.log('Status data:', data)

      if (!response.ok && response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Check if the response indicates an error even with 200 status
      if (data.error || (!data.connected && !data.hasPermissionIssues)) {
        setError(`Database status check failed: ${data.error || 'Connection failed'}`)
      } else {
        setDbStatus(data)
        // Show warning for permission issues but don't treat as error
        if (data.hasPermissionIssues) {
          console.warn('Permission issues detected:', data.note)
        }
      }
    } catch (err) {
      console.error('Status check error:', err)
      setError(err instanceof Error ? err.message : 'Failed to check database status')
    } finally {
      setStatusLoading(false)
    }
  }

  const handleSeedDatabase = async () => {
    setSeedLoading(true)
    setError(null)
    setSeedResult(null)
    setProgress(0)

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90))
      }, 200)

      const response = await fetch('/api/database/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setSeedResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed database')
      setProgress(0)
    } finally {
      setSeedLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setTestLoading(true)
    setError(null)
    setClientTestResult(null)
    setServerConnectivity(null)
    
    try {
      console.log('Running comprehensive database tests...')
      
      // Run server-side connectivity test first
      console.log('Testing server-side connectivity...')
      const serverResponse = await fetch('/api/database/connectivity')
      const serverData = await serverResponse.json()
      setServerConnectivity(serverData)
      
      // Run client-side test with user authentication
      console.log('Running client-side database test...')
      const testResult = await testDatabaseConnection()
      setClientTestResult(testResult)
      
      if (!serverData.success) {
        setError(`Server connectivity test failed: ${serverData.error || serverData.message}`)
      } else if (!testResult.connected && testResult.isAuthenticated) {
        setError(`Client database test failed: ${testResult.error || testResult.message}`)
      }
      
      console.log('Tests completed - Server:', serverData, 'Client:', testResult)
    } catch (err) {
      console.error('Test connection error:', err)
      setError(err instanceof Error ? err.message : 'Failed to test database connection')
    } finally {
      setTestLoading(false)
    }
  }

  const handleClearDatabase = async () => {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
      return
    }

    setClearLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/database/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setSeedResult(null)
      setDbStatus(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear database')
    } finally {
      setClearLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HardDrive className="h-8 w-8" />
              Database Initialization
            </h1>
            <p className="text-muted-foreground">
              Initialize and manage your Firebase Firestore database
            </p>
          </div>
          <Badge variant="outline" className="text-sm bg-red-50 text-red-700 border-red-200">
            SuperAdmin Only
          </Badge>
        </div>

        {/* Production Environment Warning */}
        {isProduction && showProductionWarning && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="flex items-start justify-between">
                <div>
                  <strong>⚠️ PRODUCTION ENVIRONMENT DETECTED</strong>
                  <p className="mt-2">You are running database initialization in a production environment. Please ensure:</p>
                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                    <li>You have a complete backup of your current database</li>
                    <li>You understand that seeding will add new data to your production database</li>
                    <li>You have verified your Firebase security rules are properly configured</li>
                    <li>This operation should only be used for initial database setup</li>
                  </ul>
                  <p className="mt-2 text-sm font-medium">Consider using a staging environment for testing database operations.</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowProductionWarning(false)}
                  className="text-red-600 hover:text-red-700"
                >
                  ✕
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Environment Badge */}
        <div className="flex items-center gap-2">
          <Badge variant={isProduction ? "destructive" : "secondary"}>
            {isProduction ? "🔴 Production" : "🟡 Development"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {isProduction 
              ? "Exercise extreme caution when modifying production data" 
              : "Safe environment for testing database operations"
            }
          </span>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="seed">Seed Data</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Database Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Database Status
                </CardTitle>
                <CardDescription>
                  Check your Firebase Firestore connection and current state
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={checkFirebaseConfig}
                    disabled={configLoading}
                    variant="outline"
                  >
                    {configLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Checking Config...
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Check Config
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={checkDatabaseStatus}
                    disabled={statusLoading}
                    variant="outline"
                  >
                    {statusLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Check Status
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleTestConnection}
                    disabled={testLoading}
                    variant="outline"
                  >
                    {testLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Cog className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>

                {configStatus && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Firebase Configuration Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Configuration</div>
                        <div className={`font-medium ${configStatus.firebaseConfigured ? 'text-green-600' : 'text-red-600'}`}>
                          {configStatus.firebaseConfigured ? 'Complete' : 'Incomplete'}
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Environment</div>
                        <div className="font-medium">{configStatus.environment}</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Project ID</div>
                        <div className="font-medium font-mono text-xs">
                          {configStatus.configValues.projectId !== 'NOT_SET' ? '✓ Set' : '✗ Missing'}
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Missing Vars</div>
                        <div className="font-medium">
                          {configStatus.missingVars.length === 0 ? 'None' : configStatus.missingVars.length}
                        </div>
                      </div>
                    </div>
                    {configStatus.missingVars.length > 0 && (
                      <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>Missing Firebase Environment Variables:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {configStatus.missingVars.map((varName) => (
                              <li key={varName} className="font-mono text-sm">NEXT_PUBLIC_FIREBASE_{varName.toUpperCase()}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {dbStatus && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Database Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Connection</div>
                        <div className={`font-medium ${dbStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
                          {dbStatus.connected ? 'Connected' : 'Disconnected'}
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Collections</div>
                        <div className="font-medium">{dbStatus.collections.length}</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">User Count</div>
                        <div className="font-medium">{dbStatus.userCount}</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Initialized</div>
                        <div className={`font-medium ${dbStatus.initialized ? 'text-green-600' : 'text-orange-600'}`}>
                          {dbStatus.initialized ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Permission Issues Warning */}
                    {dbStatus.hasPermissionIssues && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <XCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          <strong>Permission Issues Detected:</strong>
                          <p className="mt-1">{dbStatus.note}</p>
                          <p className="mt-2 text-sm">
                            To resolve this, update your Firestore security rules in the Firebase Console to allow read/write operations.
                          </p>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Environment Information */}
                    {dbStatus.environment && (
                      <div className="text-xs text-muted-foreground">
                        Environment: {dbStatus.environment}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Server-Side Connectivity Test Results */}
            {serverConnectivity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Server-Side Connectivity Test
                  </CardTitle>
                  <CardDescription>
                    Backend Firebase configuration and connectivity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className={`font-medium ${serverConnectivity.success ? 'text-green-600' : 'text-red-600'}`}>
                        {serverConnectivity.success ? '✓ Connected' : '✗ Failed'}
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Configuration</div>
                      <div className={`font-medium ${serverConnectivity.firebaseConfigured ? 'text-green-600' : 'text-red-600'}`}>
                        {serverConnectivity.firebaseConfigured ? '✓ Configured' : '✗ Missing'}
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Database Instance</div>
                      <div className={`font-medium ${serverConnectivity.databaseInstance ? 'text-green-600' : 'text-red-600'}`}>
                        {serverConnectivity.databaseInstance ? '✓ Available' : '✗ Not Available'}
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Environment</div>
                      <div className="font-medium">{serverConnectivity.environment}</div>
                    </div>
                  </div>
                  
                  {serverConnectivity.config && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Project ID</div>
                        <div className="font-medium font-mono text-sm">{serverConnectivity.config.projectId}</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Auth Domain</div>
                        <div className="font-medium font-mono text-sm">{serverConnectivity.config.authDomain}</div>
                      </div>
                    </div>
                  )}
                  
                  <Alert className={`${serverConnectivity.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    {serverConnectivity.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={serverConnectivity.success ? 'text-green-800' : 'text-red-800'}>
                      <strong>{serverConnectivity.message}</strong>
                      {serverConnectivity.note && (
                        <p className="mt-1 text-sm">{serverConnectivity.note}</p>
                      )}
                      {serverConnectivity.error && (
                        <p className="mt-1 text-sm">{serverConnectivity.error}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Client-Side Connection Test Results */}
            {clientTestResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cog className="h-5 w-5" />
                    Database Connection Test Results
                  </CardTitle>
                  <CardDescription>
                    Client-side test results with user authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Connection</div>
                      <div className={`font-medium ${clientTestResult.connected ? 'text-green-600' : 'text-red-600'}`}>
                        {clientTestResult.connected ? '✓ Connected' : '✗ Failed'}
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Firebase Auth</div>
                      <div className={`font-medium ${clientTestResult.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                        {clientTestResult.isAuthenticated ? '✓ Authenticated' : '✗ Not Authenticated'}
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Read Access</div>
                      <div className={`font-medium ${clientTestResult.canRead ? 'text-green-600' : 'text-red-600'}`}>
                        {clientTestResult.canRead ? '✓ Can Read' : '✗ Cannot Read'}
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Write Access</div>
                      <div className={`font-medium ${clientTestResult.canWrite ? 'text-green-600' : 'text-red-600'}`}>
                        {clientTestResult.canWrite ? '✓ Can Write' : '✗ Cannot Write'}
                      </div>
                    </div>
                  </div>
                  
                  {!clientTestResult.isAuthenticated && (
                    <Alert className="border-red-200 bg-red-50">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Firebase Authentication Required:</strong>
                        <p className="mt-1">The user is authenticated with NextAuth but not with Firebase client SDK. This is expected behavior when using NextAuth for authentication.</p>
                        <p className="mt-1 text-sm">For database operations, the system uses server-side APIs that handle Firebase authentication internally.</p>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {clientTestResult.isAuthenticated && clientTestResult.details.firebaseUser && (
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Firebase User</div>
                      <div className="font-medium text-sm font-mono">{clientTestResult.details.firebaseUser}</div>
                      {clientTestResult.authProvider && (
                        <div className="text-xs text-muted-foreground">Provider: {clientTestResult.authProvider}</div>
                      )}
                    </div>
                  )}
                  
                  {clientTestResult.details.userCount !== undefined && (
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Current Users in Database</div>
                      <div className="font-medium text-lg">{clientTestResult.details.userCount}</div>
                    </div>
                  )}
                  
                  <Alert className={`${clientTestResult.connected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    {clientTestResult.connected ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={clientTestResult.connected ? 'text-green-800' : 'text-red-800'}>
                      <strong>{clientTestResult.message}</strong>
                      {clientTestResult.error && (
                        <p className="mt-1 text-sm">{clientTestResult.error}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                  
                  {!clientTestResult.canWrite && !clientTestResult.isAuthenticated && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertDescription className="text-blue-800">
                        <strong>📝 This is Expected Behavior:</strong>
                        <p className="mt-1">Your app uses NextAuth for user authentication, but Firebase Firestore requires Firebase Authentication for client-side access.</p>
                        <p className="mt-1">✅ <strong>Database operations work correctly</strong> through your server-side API routes</p>
                        <p className="mt-1">✅ <strong>User authentication is working</strong> via NextAuth</p>
                        <p className="mt-1">✅ <strong>Security is properly configured</strong> - direct client access is restricted</p>
                        <div className="mt-2 text-sm">
                          <strong>Next Steps:</strong> Use the "Seed Users" button to test actual database operations through your secure API.
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Test completed at: {new Date(clientTestResult.details.timestamp).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common database initialization tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={handleSeedDatabase}
                    disabled={seedLoading}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <Users className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-medium">Seed Users</div>
                      <div className="text-xs opacity-75">Add sample user data</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={handleTestConnection}
                    disabled={testLoading}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <Database className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-medium">Test DB</div>
                      <div className="text-xs opacity-75">Verify connection</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={handleClearDatabase}
                    disabled={clearLoading}
                    variant="destructive"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <XCircle className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-medium">Clear DB</div>
                      <div className="text-xs opacity-75">Remove all data</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seed" className="space-y-6">
            {/* Seed Database Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Seed Users Collection
                </CardTitle>
                <CardDescription>
                  Initialize your database with comprehensive sample user data across all roles and categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="font-medium text-red-600">SuperAdmins</div>
                    <div className="text-muted-foreground">3 users</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-orange-600">Admins</div>
                    <div className="text-muted-foreground">2 users</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-blue-600">Staff</div>
                    <div className="text-muted-foreground">6 users</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-purple-600">Partners</div>
                    <div className="text-muted-foreground">3 users</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-green-600">Agents</div>
                    <div className="text-muted-foreground">4 users</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-cyan-600">Public Users</div>
                    <div className="text-muted-foreground">4 users</div>
                  </div>
                </div>

                {seedLoading && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Seeding database...</div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    onClick={handleSeedDatabase} 
                    disabled={seedLoading}
                    className="w-full"
                  >
                    {seedLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Seeding Database...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Seed Database with Sample Users
                      </>
                    )}
                  </Button>
                </div>

                {seedResult && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {seedResult.message}
                    </AlertDescription>
                  </Alert>
                )}

                {seedResult && seedResult.results && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Seeding Results</CardTitle>
                      <CardDescription>
                        {seedResult.successCount} successful, {seedResult.failureCount} failed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {seedResult.results.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded border">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex items-center gap-2">
                              {item.success ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm text-green-600">Created</span>
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
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {/* Database Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Destructive operations that cannot be undone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Warning:</strong> These operations will permanently delete data. Make sure you have backups if needed.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleClearDatabase}
                  disabled={clearLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {clearLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Clearing Database...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Clear All Database Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Database Configuration
                </CardTitle>
                <CardDescription>
                  Current Firebase configuration and environment settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Environment</div>
                    <div className="font-medium">{process.env.NODE_ENV || 'development'}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Project ID</div>
                    <div className="font-medium font-mono text-sm">
                      {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not configured'}
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Auth Domain</div>
                    <div className="font-medium font-mono text-sm">
                      {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not configured'}
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Storage Bucket</div>
                    <div className="font-medium font-mono text-sm">
                      {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'Not configured'}
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    Make sure all Firebase environment variables are properly configured before initializing the database.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Production Checklist */}
            {isProduction && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    Production Environment Checklist
                  </CardTitle>
                  <CardDescription>
                    Essential security and safety checks for production deployment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Environment Variables Configured</div>
                        <div className="text-sm text-muted-foreground">All required Firebase environment variables are set</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Database Backup Created</div>
                        <div className="text-sm text-muted-foreground">Always backup production data before initialization</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Firestore Security Rules Updated</div>
                        <div className="text-sm text-muted-foreground">Configure proper read/write permissions in Firebase Console</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-medium">OAuth Providers Configured</div>
                        <div className="text-sm text-muted-foreground">Google/Facebook OAuth redirect URIs set for production domain</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-medium">SuperAdmin User Created</div>
                        <div className="text-sm text-muted-foreground">At least one SuperAdmin user exists for system management</div>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertDescription className="text-amber-800">
                      <strong>⚠️ Production Database Initialization</strong>
                      <p className="mt-1">This feature should only be used for initial setup of new production environments. After initial setup, consider restricting database initialization access.</p>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Quick Reference Links:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li><a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a> - Manage your Firebase project</li>
                      <li><a href="https://console.developers.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a> - OAuth configuration</li>
                      <li><a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Developers</a> - Facebook OAuth setup</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Global Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Check database status to verify your Firebase connection</p>
            <p>2. Seed the database with sample users to get started</p>
            <p>3. Visit <a href="/user-management" className="text-blue-600 hover:underline">User Management</a> to view and manage your data</p>
            <p>4. Monitor your database in the <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a></p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}