import type { Metadata } from "next";
import { DashboardTop } from "@/components/dashboard-top";

export const metadata: Metadata = {
  title: "ダッシュボード",
  robots: {
    index: false,
    follow: false
  }
};

export default function DashboardPage() {
  return <DashboardTop initialScreen="dashboard" />;
}
