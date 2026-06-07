import type { Metadata } from "next";
import { DashboardTop } from "@/components/dashboard-top";

export const metadata: Metadata = {
  title: "管理画面",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return <DashboardTop initialScreen="admin" />;
}
