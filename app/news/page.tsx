import { MainLayout } from "@/components/layout/main-layout"

export default function NewsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News</h1>
          <p className="text-muted-foreground">
            Latest news and updates from our platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">Platform Updates</h3>
            <p className="text-sm text-muted-foreground mb-4">
              New features and improvements to enhance your experience.
            </p>
            <span className="text-xs text-muted-foreground">2 hours ago</span>
          </article>
          
          <article className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">Security Enhancement</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enhanced security measures implemented across all services.
            </p>
            <span className="text-xs text-muted-foreground">1 day ago</span>
          </article>
        </div>
      </div>
    </MainLayout>
  )
}