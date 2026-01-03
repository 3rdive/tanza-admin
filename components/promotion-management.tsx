"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/hooks";
import { api } from "@/lib/api";
import { Bell, Send, Users, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string | null;
  mobile: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePic: string;
  countryCode: string;
}

export function PromotionManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [role, setRole] = useState<string>("user");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const { token } = useAuth();
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [route, setRoute] = useState("(tabs)");

  useEffect(() => {
    fetchUsers();
  }, [token, role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await api.admin.getUsers(token!, role, 1, 100);
      if (result.success) {
        setUsers(result.data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedUsers(new Set(users.map((user) => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === users.length);
  };

  const handleSendNotification = async () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a notification title.",
        variant: "destructive",
      });
      return;
    }

    if (!body.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a notification message.",
        variant: "destructive",
      });
      return;
    }

    if (selectedUsers.size === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one user to send notification.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const result = await api.notifications.sendBulkPushNotification(token!, {
        title,
        body,
        userIds: Array.from(selectedUsers),
        data: {
          route,
        },
      });

      if (result.success) {
        toast({
          title: "Success",
          description: `Notification sent to ${selectedUsers.size} user(s) successfully!`,
        });
        // Reset form
        setTitle("");
        setBody("");
        setRoute("(tabs)");
        setSelectedUsers(new Set());
        setSelectAll(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send notification.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to send notification:", err);
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Promotions & Notifications</h1>
          <p className="text-muted-foreground">
            Send push notifications to users and riders
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notification Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Create Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                placeholder="e.g., Special Offer!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Enter your notification message..."
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="route">Deep Link Route (Optional)</Label>
              <Input
                id="route"
                placeholder="e.g., (tabs)"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Default: (tabs) - App home screen
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Selected: {selectedUsers.size} user(s)
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSendNotification}
                disabled={sending || selectedUsers.size === 0}
                className="w-full"
              >
                {sending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Selection */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Recipients
              </CardTitle>
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value);
                  setSelectedUsers(new Set());
                  setSelectAll(false);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="rider">Riders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading users...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Checkbox
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label
                    htmlFor="select-all"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Select All ({users.length})
                  </Label>
                </div>

                <div className="max-h-[500px] overflow-y-auto space-y-2">
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={user.id}
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={(checked) =>
                            handleSelectUser(user.id, checked as boolean)
                          }
                        />
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.profilePic || "/placeholder.svg"}
                            alt={user.firstName}
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-card-foreground">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email || `${user.countryCode}${user.mobile}`}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
