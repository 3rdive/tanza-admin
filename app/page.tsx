"use client";

import { LoginPage } from "@/components/login-page";
import { Dashboard } from "@/components/dashboard";
import { useAppSelector } from "@/lib/hooks";

export default function Page() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLoginSuccess = () => {
    // This can be removed or kept for navigation if needed
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard onLogout={() => {}} />;
}
