import { MainLayout } from "@/components/layout/main-layout"

export default function TravelAdvisoryPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Travel Advisory</h1>
          <p className="text-muted-foreground">
            Latest travel advisories and safety information.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Current Advisories</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-medium">Weather Alert</h4>
              <p className="text-sm text-muted-foreground">
                Severe weather conditions expected in selected regions.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">Travel Update</h4>
              <p className="text-sm text-muted-foreground">
                New travel requirements for international destinations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}