import DashboardHeader from "@/components/layout/dashboard-header/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardHeader>{children}</DashboardHeader>;
}
