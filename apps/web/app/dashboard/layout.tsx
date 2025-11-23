import DashboardHeader from "@/components/layout/dashboard-header/header";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AuthGuard>
      <DashboardHeader>{children}</DashboardHeader>
    // </AuthGuard>
  );
}
