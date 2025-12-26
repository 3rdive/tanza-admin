"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/hooks";
import { api } from "@/lib/api";

interface LoginPageProps {
  onLoginSuccess: (token: string) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.auth.login({ emailOrMobile, password });

      if (data.success && data.data.user.role === "admin") {
        setToken(data.data.access_token, data.data.user);
        onLoginSuccess(data.data.access_token);
      } else if (data.success && data.data.user.role !== "admin") {
        setError("Access denied. Admin role required.");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative">
      {/* Decorative corner nodes */}
      <div className="pointer-events-none absolute left-6 top-6 w-20 h-12 rounded-lg border border-border/60 bg-[rgba(255,255,255,0.02)]" />
      <div className="pointer-events-none absolute right-6 top-6 w-20 h-12 rounded-lg border border-border/60 bg-[rgba(255,255,255,0.02)]" />
      <div className="pointer-events-none absolute left-6 bottom-6 w-20 h-12 rounded-lg border border-border/60 bg-[rgba(255,255,255,0.02)]" />
      <div className="pointer-events-none absolute right-6 bottom-6 w-20 h-12 rounded-lg border border-border/60 bg-[rgba(255,255,255,0.02)]" />

      <div className="w-full max-w-md">
        <div className="mx-auto bg-card border border-border rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center text-center space-y-3 mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[color:var(--color-accent)] to-[color:var(--color-primary)] text-white shadow-md">
              <span className="text-2xl font-semibold">◎</span>
            </div>
            <h2 className="text-2xl font-semibold">Welcome Back</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label
                htmlFor="emailOrMobile"
                className="text-sm text-muted-foreground"
              >
                email address
              </Label>
              <Input
                id="emailOrMobile"
                type="text"
                placeholder="email address"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                required
                className="mt-1 bg-[rgba(255,255,255,0.02)] border-border placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-sm text-muted-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 bg-[rgba(255,255,255,0.02)] border-border placeholder:text-muted-foreground"
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] shadow-md hover:brightness-90 transition"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
