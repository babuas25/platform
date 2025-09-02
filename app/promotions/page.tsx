import { MainLayout } from "@/components/layout/main-layout"

export default function PromotionsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground">
            Current offers and promotional campaigns.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6">
            <h3 className="font-semibold mb-2">Premium Upgrade</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get 50% off your first year of premium features.
            </p>
            <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded">
              Limited Time
            </span>
          </div>
          
          <div className="rounded-lg border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6">
            <h3 className="font-semibold mb-2">Referral Bonus</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Earn credits for every friend you refer to our platform.
            </p>
            <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded">
              Ongoing
            </span>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}