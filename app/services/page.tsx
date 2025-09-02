import { MainLayout } from "@/components/layout/main-layout"

export default function ServicesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">
            Manage and configure your application services.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">Web Services</h3>
            <p className="text-sm text-muted-foreground">
              Configure your web application services and settings.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">API Services</h3>
            <p className="text-sm text-muted-foreground">
              Manage API endpoints and integrations.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">Cloud Services</h3>
            <p className="text-sm text-muted-foreground">
              Monitor cloud infrastructure and deployments.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}