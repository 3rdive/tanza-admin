"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Package, DollarSign } from "lucide-react";
import { useAuth } from "@/lib/hooks";
import { api } from "@/lib/api";

interface AnalyticsData {
  usersCount: number;
  riders: {
    approved: number;
    unapproved: number;
  };
  ordersCount: number;
  ordersStatus: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  totalDeliveryFee: number;
}

interface DashboardAnalyticsProps {
  // No props needed anymore
}

export function DashboardAnalytics({}: DashboardAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate] = useState("2023-05-21");
  const [endDate] = useState("2025-12-21");
  const { token } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await api.admin.getAnalytics(token!, startDate, endDate);
        console.log("Analytics data:", result?.data);
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, startDate, endDate]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="text-destructive">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Analytics</h1>
        <p className="text-muted-foreground">
          Overview of your delivery platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total Users
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {data.usersCount}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Approved Riders
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {data.riders.approved}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.riders.unapproved} pending approval
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Unapproved Riders
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {data.riders.unapproved}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total Orders
            </CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {data.ordersCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.ordersStatus.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              ₦{data.totalDeliveryFee.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Rider Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Approved</span>
              <span className="text-lg font-semibold text-card-foreground">
                {data.riders.approved}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Unapproved</span>
              <span className="text-lg font-semibold text-card-foreground">
                {data.riders.unapproved}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Order Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="text-lg font-semibold text-card-foreground">
                {data.ordersStatus.pending}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">In Progress</span>
              <span className="text-lg font-semibold text-card-foreground">
                {data.ordersStatus.inProgress}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="text-lg font-semibold text-card-foreground">
                {data.ordersStatus.completed}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
