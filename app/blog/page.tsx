import { MainLayout } from "@/components/layout/main-layout"

export default function BlogPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">
            Insights, tutorials, and company updates.
          </p>
        </div>

        <div className="space-y-6">
          <article className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">Building Modern Dashboards</h2>
            <p className="text-muted-foreground mb-4">
              Learn how to create beautiful and functional dashboard applications 
              using the latest web technologies.
            </p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>By AppDashboard Team</span>
              <span>3 days ago</span>
            </div>
          </article>
          
          <article className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">Best Practices for UI Design</h2>
            <p className="text-muted-foreground mb-4">
              Discover essential principles for creating user-friendly interfaces 
              that provide excellent user experience.
            </p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>By Design Team</span>
              <span>1 week ago</span>
            </div>
          </article>
        </div>
      </div>
    </MainLayout>
  )
}