import { LangProvider } from "@/components/providers/LangProvider";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <DashboardShell>
        {children}
      </DashboardShell>
    </LangProvider>
  );
}