"use client";

import {
  LayoutDashboard,
  Users,
  Package,
  TrendingUp,
  LogOut,
  FileText,
  Settings,
  Moon,
  Sun,
  Truck,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/lib/hooks";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/hooks";

interface SidebarProps {}

export function Sidebar({}: SidebarProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    { id: "riders", label: "Rider Revenue", icon: TrendingUp, href: "/riders" },
    { id: "users", label: "User Management", icon: Users, href: "/users" },
    { id: "orders", label: "Orders", icon: Package, href: "/orders" },
    {
      id: "promotions",
      label: "Promotions",
      icon: Bell,
      href: "/promotions",
    },
    {
      id: "rider-documents",
      label: "Rider Documents",
      icon: FileText,
      href: "/rider-documents",
    },
    {
      id: "vehicle-settings",
      label: "Vehicle Settings",
      icon: Settings,
      href: "/vehicle-settings",
    },
    {
      id: "vehicle-types",
      label: "Vehicle Types",
      icon: Truck,
      href: "/vehicle-types",
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "A";
  };

  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || "Admin";
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          Admin Dashboard
        </h1>
      </div>
      <div className="px-4 pb-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profilePic} alt={getFullName()} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {getFullName()}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 mr-3" />
          ) : (
            <Moon className="w-5 h-5 mr-3" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
