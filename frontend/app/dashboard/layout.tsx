import { ReactNode } from "react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { UserNav } from "@/components/layout/user-nav"
import { cn } from "@/lib/utils"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="h-6 w-6 bg-primary rounded-md flex items-center justify-center text-primary-foreground text-xs">
              N
            </div>
            Notes
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm font-medium">{session.user?.name}</span>
             <UserNav email={session.user?.email} />
          </div>
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] ">
        <aside className="hidden w-[200px] flex-col md:flex border-r border-black-2 p-4">
          <nav className="grid items-start gap-2">
            <Link 
              href="/dashboard"
              className={cn(
                "group flex items-center rounded-md bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/80",
                "text-foreground"
              )}
            >
              <span>Notes</span>
            </Link>
            <Link 
              href="/dashboard/billing"
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-accent-foreground transition-colors",
                "text-muted-foreground"
              )}
            >
              <span>Billing</span>
            </Link>
             <Link 
              href="/dashboard/settings"
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-accent-foreground transition-colors",
                "text-muted-foreground"
              )}
            >
              <span>Settings</span>
            </Link>
          </nav>
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}