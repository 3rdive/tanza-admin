"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/hooks";
import { api } from "@/lib/api";

interface RiderRevenueData {
  riderId: string;
  firstName: string;
  lastName: string;
  ordersFulfilled: string;
  totalEarnings: string;
}

interface RiderRevenueProps {
  // No props needed anymore
}

export function RiderRevenue({}: RiderRevenueProps) {
  const [data, setData] = useState<RiderRevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate] = useState("2023-05-21");
  const [endDate] = useState("2025-12-21");
  const { token } = useAuth();

  useEffect(() => {
    const fetchRiderRevenue = async () => {
      try {
        const result = await api.admin.getRiderRevenue(
          token!,
          startDate,
          endDate
        );
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch rider revenue:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRiderRevenue();
  }, [token, startDate, endDate]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-muted-foreground">Loading rider revenue...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Rider Revenue</h1>
        <p className="text-muted-foreground">
          Track earnings and performance of your riders
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Revenue Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="text-muted-foreground">
                  Rider Name
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Orders Fulfilled
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Total Earnings
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    No rider revenue data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((rider) => (
                  <TableRow
                    key={rider.riderId}
                    className="border-border hover:bg-muted/50"
                  >
                    <TableCell className="text-card-foreground">
                      {rider.firstName} {rider.lastName}
                    </TableCell>
                    <TableCell className="text-card-foreground">
                      {rider.ordersFulfilled}
                    </TableCell>
                    <TableCell className="text-card-foreground font-semibold">
                      ${Number.parseFloat(rider.totalEarnings).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
