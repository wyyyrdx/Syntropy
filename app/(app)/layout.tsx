import { Sidebar } from '@/components/nexus/sidebar';
import { TopBar } from '@/components/nexus/topbar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Atmospheric background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-cyan/5 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-emerald/5 blur-[120px]" />
      </div>

      <Sidebar />

      <div className="relative ml-64">
        <TopBar />
        <main className="relative p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
