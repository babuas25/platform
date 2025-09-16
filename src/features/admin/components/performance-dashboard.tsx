"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Activity,
  Database,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface QueryStats {
  totalExecutions: number
  averageDuration: number
  minDuration: number
  maxDuration: number
  cacheHitRate: number
}

interface PerformanceData {
  queryStatistics: Record<string, QueryStats>
  indexUsage: Record<string, number>
  totalQueries: number
  totalIndexPatterns: number
  timestamp: string
  performance: {
    environment: string
    monitoring: string
  }
}

export const PerformanceDashboard = () => {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/performance/query-stats')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching performance data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data')
    } finally {
      setLoading(false)
    }
  }

  const clearStats = async () => {
    try {
      setClearing(true)
      
      const response = await fetch('/api/performance/query-stats', {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Refresh data after clearing
      await fetchData()
    } catch (err) {
      console.error('Error clearing performance data:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear performance data')
    } finally {
      setClearing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getPerformanceBadge = (avgDuration: number) => {
    if (avgDuration < 100) {
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    } else if (avgDuration < 200) {
      return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    } else if (avgDuration < 500) {
      return <Badge className="bg-orange-100 text-orange-800">Moderate</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Poor</Badge>
    }
  }

  const getCacheRateBadge = (cacheRate: number) => {
    if (cacheRate > 70) {
      return <Badge className="bg-green-100 text-green-800">High</Badge>
    } else if (cacheRate > 40) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Low</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Performance Data</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Performance Data</h3>
            <p className="text-gray-600">Query statistics will appear here once queries are executed.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const queryEntries = Object.entries(data.queryStatistics)
  const indexEntries = Object.entries(data.indexUsage).sort(([,a], [,b]) => b - a)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalQueries}</div>
            <p className="text-xs text-muted-foreground">
              Unique query patterns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Index Patterns</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalIndexPatterns}</div>
            <p className="text-xs text-muted-foreground">
              Active index combinations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queryEntries.length > 0 
                ? Math.round(queryEntries.reduce((sum, [,stats]) => sum + stats.averageDuration, 0) / queryEntries.length)
                : 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average query time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Environment</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{data.performance.environment}</div>
            <p className="text-xs text-muted-foreground">
              Monitoring: {data.performance.monitoring}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
        <Button 
          onClick={clearStats} 
          variant="destructive" 
          disabled={clearing}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {clearing ? 'Clearing...' : 'Clear Statistics'}
        </Button>
      </div>

      {/* Query Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Query Performance Statistics
          </CardTitle>
          <CardDescription>
            Detailed performance metrics for each query pattern
          </CardDescription>
        </CardHeader>
        <CardContent>
          {queryEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No query statistics available yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query Name</TableHead>
                  <TableHead>Executions</TableHead>
                  <TableHead>Avg Duration</TableHead>
                  <TableHead>Min/Max</TableHead>
                  <TableHead>Cache Rate</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryEntries.map(([queryName, stats]) => (
                  <TableRow key={queryName}>
                    <TableCell className="font-medium">{queryName}</TableCell>
                    <TableCell>{stats.totalExecutions}</TableCell>
                    <TableCell>{Math.round(stats.averageDuration)}ms</TableCell>
                    <TableCell>
                      {Math.round(stats.minDuration)}ms / {Math.round(stats.maxDuration)}ms
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {Math.round(stats.cacheHitRate)}%
                        {getCacheRateBadge(stats.cacheHitRate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPerformanceBadge(stats.averageDuration)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Index Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Index Usage Statistics
          </CardTitle>
          <CardDescription>
            Most frequently used index combinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {indexEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No index usage data available yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Index Pattern</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead>Relative Usage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indexEntries.slice(0, 10).map(([indexKey, count]) => {
                  const maxCount = indexEntries[0][1]
                  const percentage = Math.round((count / maxCount) * 100)
                  
                  return (
                    <TableRow key={indexKey}>
                      <TableCell className="font-mono text-sm">{indexKey}</TableCell>
                      <TableCell>{count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{percentage}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PerformanceDashboard