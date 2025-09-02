import { MainLayout } from "@/components/layout/main-layout"

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your AppDashboard. Manage your services and content from here.
          </p>
        </div>

        {/* Dashboard content area */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">
              Access your most used features and tools.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">
              View your latest updates and changes.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your application performance.
            </p>
          </div>
        </div>

        {/* Welcome message */}
        <div className="rounded-lg border bg-muted/50 p-6">
          <p className="text-sm text-muted-foreground">
            Welcome! Please sign in to access more features.
          </p>
        </div>
      </div>
    </MainLayout>
  )
}