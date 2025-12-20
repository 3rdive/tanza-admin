"use client";

import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/lib/hooks";

interface OrdersLayoutProps {
  children: React.ReactNode;
}

export default function OrdersLayout({ children }: OrdersLayoutProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case "dashboard":
        router.push("/");
        break;
      case "riders":
        router.push("/?tab=riders"); // Or create a riders page
        break;
      case "users":
        router.push("/?tab=users"); // Or create a users page
        break;
      case "orders":
        router.push("/orders"); // Assuming there's an orders index page
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab="orders"
        setActiveTab={handleTabChange}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
