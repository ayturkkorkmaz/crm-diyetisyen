import { Sidebar } from "@/components/layout/sidebar"
import { AlarmBell } from "@/components/alarm-bell"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-end px-6 py-3 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
          <AlarmBell />
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
