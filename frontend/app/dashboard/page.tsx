import { FadeIn } from "@/components/motion/fade-in"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <FadeIn>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>New Note</Button>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Welcome</h3>
            <p className="text-sm text-muted-foreground">
              Your workspace is ready.
            </p>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}
