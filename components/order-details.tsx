"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/hooks";
import { api } from "@/lib/api";

enum TransactionType {
  DEPOSIT = "DEPOSIT",
  ORDER = "ORDER",
  ORDER_REWARD = "ORDER_REWARD",
  FAILED_PAYOUT = "FAILED_PAYOUT",
}

interface Transaction {
  id: string;
  amount: number;
  reference: string;
  type: string;
  description?: string;
  createdAt: string;
  status?: string;
}

interface Participant {
  name?: string;
  email?: string;
  phone?: string;
}

interface DeliveryDestination {
  id: string;
  dropOffLocation: { address: string };
  recipient: Participant;
  distanceFromPickupKm?: number;
  durationFromPickup?: string;
  deliveryFee?: number;
  delivered?: boolean;
  deliveredAt?: string | null;
}

interface OrderDetailsResponse {
  id: string;
  transactions: Transaction[];
  sender?: Participant;
  recipient?: Participant;
  pickUpLocation?: { address: string };
  dropOffLocation?: { address: string };
  deliveryDestinations?: DeliveryDestination[];
  serviceChargeAmount?: number;
  deliveryFee?: number;
  totalAmount?: number;
  orderTracking?: {
    id: string;
    status: string;
    note?: string | null;
    createdAt: string;
  }[];
  rider?: {
    firstName?: string;
    lastName?: string;
    mobile?: string;
    profilePic?: string;
  } | null;
  hasRewardedRider?: boolean;
}

interface OrderDetailsProps {
  orderId: string;
  token?: string | null;
}

function formatCurrency(amount?: number) {
  if (amount == null) return "-";
  return `₦${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function getAmountColor(type: string) {
  switch (type) {
    case TransactionType.DEPOSIT:
    case TransactionType.ORDER_REWARD:
      return "text-green-600";
    case TransactionType.ORDER:
      return "text-red-600";
    case TransactionType.FAILED_PAYOUT:
      return "text-gray-500";
    default:
      return "";
  }
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function OrderDetails({ orderId, token: tokenProp }: OrderDetailsProps) {
  const [data, setData] = useState<OrderDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // ensure we have a token; try to read from localStorage if not provided

        debugger;

        const json = await api.admin.getOrderDetails(token, orderId);
        if (!mounted) return;
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.message || "Failed to load order details");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDetails();
    return () => {
      mounted = false;
    };
  }, [orderId, token]);

  if (loading) return <div className="p-6">Loading order details...</div>;
  if (error) return <div className="p-6 text-destructive">{error}</div>;
  if (!data) return <div className="p-6">No data</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Order details</h1>
            <p className="text-muted-foreground">
              Order ID: <span className="font-mono">{data.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {data.rider ? (
            <div className="flex items-center gap-3">
              <Avatar>
                {data.rider.profilePic ? (
                  <img src={data.rider.profilePic} alt="rider" />
                ) : (
                  <span className="font-semibold">
                    {(data.rider.firstName || "").slice(0, 1)}
                  </span>
                )}
              </Avatar>
              <div className="text-right">
                <div className="font-semibold">
                  {data.rider.firstName} {data.rider.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {data.rider.mobile}
                </div>
              </div>
            </div>
          ) : (
            <Badge variant="secondary">No rider</Badge>
          )}

          {data.hasRewardedRider ? (
            <Badge className="bg-[color:var(--color-accent)] text-white">
              Rider Rewarded
            </Badge>
          ) : (
            <Badge variant="secondary">Not Rewarded</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground">
                      Reference
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Type
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions?.map((t) => (
                    <TableRow key={t.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {t.reference || t.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>{t.type}</TableCell>
                      <TableCell
                        className={`font-semibold ${getAmountColor(t.type)}`}
                      >
                        {formatCurrency(t.amount)}
                      </TableCell>
                      <TableCell>
                        {t.status === "complete" ? (
                          <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/20">
                            Complete
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            {t.status || "-"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(t.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {data.orderTracking?.map((step) => (
                  <li key={step.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-border mt-2" />
                    <div>
                      <div className="font-medium">{step.status}</div>
                      <div className="text-sm text-muted-foreground">
                        {step.note ?? ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(step.createdAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Sender</div>
                  <div className="font-medium">{data.sender?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {data.sender?.email || ""} • {data.sender?.phone || ""}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Recipient</div>
                  <div className="font-medium">{data.recipient?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {data.recipient?.email || ""} •{" "}
                    {data.recipient?.phone || ""}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <div className="font-medium">Pickup</div>
                  <div>{data.pickUpLocation?.address}</div>
                </div>
                <div>
                  <div className="font-medium">Dropoff</div>
                  <div>{data.dropOffLocation?.address}</div>
                </div>
                {data.deliveryDestinations?.map((d) => (
                  <div key={d.id} className="pt-2 border-t border-border/40">
                    <div className="font-medium">Destination</div>
                    <div className="text-sm">{d.dropOffLocation?.address}</div>
                    <div className="text-xs text-muted-foreground">
                      Distance: {d.distanceFromPickupKm} km • Duration:{" "}
                      {d.durationFromPickup}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Service charge</span>
                  <span>{formatCurrency(data.serviceChargeAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery fee</span>
                  <span>{formatCurrency(data.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(data.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
