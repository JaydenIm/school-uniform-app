export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50/90">
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
} 