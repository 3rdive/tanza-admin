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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks";
import { api } from "@/lib/api";

interface Order {
  id: string;
  status: string;
  isRiderAssigned: boolean;
  hasRewardedRider: boolean;
  deliveryFee: number;
  totalAmount: number;
}

interface OrderManagementProps {
  // No props needed anymore
}

export function OrderManagement({}: OrderManagementProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("completed");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  });
  const { token } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const result = await api.admin.getOrders(token!, status);
        if (result.success) {
          setOrders(result.data.orders);
          setPagination(result.data.pagination);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, status]);

  const getStatusColor = (orderStatus: string) => {
    switch (orderStatus) {
      case "delivered":
        return "bg-chart-2/20 text-chart-2 border-chart-2/20";
      case "in-progress":
        return "bg-chart-1/20 text-chart-1 border-chart-1/20";
      case "pending":
        return "bg-chart-3/20 text-chart-3 border-chart-3/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order Management</h1>
          <p className="text-muted-foreground">View and manage all orders</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Filter by status:
          </span>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40 bg-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Orders ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading orders...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">
                    Order ID
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Rider Assigned
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Rider Rewarded
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Delivery Fee
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Total Amount
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    {" "}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-border hover:bg-muted/50"
                    >
                      <TableCell className="font-mono text-sm text-card-foreground">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(order.status)}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-card-foreground">
                        {order.isRiderAssigned ? (
                          <span className="text-chart-2">✓ Assigned</span>
                        ) : (
                          <span className="text-muted-foreground">
                            Not assigned
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-card-foreground">
                        {order.hasRewardedRider ? (
                          <Badge
                            variant="secondary"
                            className="bg-chart-4/20 text-chart-4 border-chart-4/20"
                          >
                            Rewarded
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            Not rewarded
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-card-foreground">
                        ${order.deliveryFee.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-semibold text-card-foreground">
                        ${order.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-popover/50">
                              <MoreVertical className="size-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onSelect={() =>
                                router.push(`/orders/details/${order.id}`)
                              }
                            >
                              View details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
