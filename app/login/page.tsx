"use client";

import { LoginPage } from "@/components/login-page";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push("/dashboard");
  };

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}
