"use client";

import { useState } from "react";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { RiderRevenue } from "@/components/rider-revenue";
import { UserManagement } from "@/components/user-management";
import { OrderManagement } from "@/components/order-management";
import { RiderDocuments } from "@/components/rider-documents";
import { VehicleDocumentSettings } from "@/components/vehicle-document-settings";
import { VehicleTypeManagement } from "@/components/vehicle-type-management";
import { useAuth } from "@/lib/hooks";

interface DashboardProps {
  onLogout: () => void;
}

/**
 * @deprecated This component is no longer used. Use proper Next.js routing instead.
 * Individual pages are now in app/(dashboard)/* with a shared layout.
 */
export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="text-muted-foreground p-4">
        This component is deprecated. Use proper routing instead.
      </div>
      <main className="flex-1 overflow-y-auto">
        {activeTab === "dashboard" && <DashboardAnalytics />}
        {activeTab === "riders" && <RiderRevenue />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "orders" && <OrderManagement />}
        {activeTab === "rider-documents" && <RiderDocuments />}
        {activeTab === "vehicle-settings" && <VehicleDocumentSettings />}
        {activeTab === "vehicle-types" && <VehicleTypeManagement />}
      </main>
    </div>
  );
}
