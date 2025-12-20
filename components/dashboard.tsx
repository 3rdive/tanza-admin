"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { RiderRevenue } from "@/components/rider-revenue";
import { UserManagement } from "@/components/user-management";
import { OrderManagement } from "@/components/order-management";
import { RiderDocuments } from "@/components/rider-documents";
import { VehicleDocumentSettings } from "@/components/vehicle-document-settings";
import { useAuth } from "@/lib/hooks";

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto">
        {activeTab === "dashboard" && <DashboardAnalytics />}
        {activeTab === "riders" && <RiderRevenue />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "orders" && <OrderManagement />}
        {activeTab === "rider-documents" && <RiderDocuments />}
        {activeTab === "vehicle-settings" && <VehicleDocumentSettings />}
      </main>
    </div>
  );
}
