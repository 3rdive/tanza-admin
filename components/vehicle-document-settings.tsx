"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VehicleType {
  id: string;
  name: string;
  description: string;
  baseFee: number;
  maxWeight: number | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface VehicleDocumentSetting {
  id: string;
  vehicleTypeId: string;
  vehicleType: VehicleType;
  docName: string;
  requiresExpiration: boolean;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  vehicleTypeId: string;
  docName: string;
  requiresExpiration: boolean;
  isRequired: boolean;
}

export function VehicleDocumentSettings() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<VehicleDocumentSetting[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    vehicleTypeId: "",
    docName: "",
    requiresExpiration: false,
    isRequired: true,
  });

  useEffect(() => {
    if (token) {
      fetchVehicleTypes();
      fetchSettings();
    }
  }, [token]);

  const fetchVehicleTypes = async () => {
    if (!token) return;
    try {
      const response = await api.admin.getVehicleTypes(token, false);
      if (response.success && response.data) {
        // Only get active vehicle types
        setVehicleTypes(
          response.data.filter((vt) => vt.isActive && !vt.deletedAt)
        );
        if (response.data.length > 0) {
          setSelectedVehicleType(response.data[0].name);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSettings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.admin.getVehicleDocumentSettings(
        token,
        selectedVehicleType || undefined
      );
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        toast.error(response.message || "Failed to fetch document settings");
      }
    } catch (error) {
      toast.error("An error occurred while fetching document settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch settings when selected vehicle type changes
  useEffect(() => {
    if (token && selectedVehicleType) {
      fetchSettings();
    }
  }, [selectedVehicleType]);

  const handleOpenForm = (setting?: VehicleDocumentSetting) => {
    if (setting) {
      setEditingId(setting.id);
      setFormData({
        vehicleTypeId: setting.vehicleTypeId,
        docName: setting.docName,
        requiresExpiration: setting.requiresExpiration,
        isRequired: setting.isRequired,
      });
    } else {
      setEditingId(null);
      setFormData({
        vehicleTypeId: "",
        docName: "",
        requiresExpiration: false,
        isRequired: true,
      });
    }
    setShowFormDialog(true);
  };

  const handleSubmit = async () => {
    if (!token) return;

    if (!formData.vehicleTypeId || !formData.docName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (editingId) {
        response = await api.admin.updateVehicleDocumentSetting(
          token,
          editingId,
          formData
        );
      } else {
        response = await api.admin.createVehicleDocumentSetting(
          token,
          formData
        );
      }

      if (response.success) {
        toast.success(
          `Document setting ${editingId ? "updated" : "created"} successfully`
        );
        setShowFormDialog(false);
        fetchSettings();
      } else {
        toast.error(
          response.message ||
            `Failed to ${editingId ? "update" : "create"} document setting`
        );
      }
    } catch (error) {
      toast.error(
        `An error occurred while ${
          editingId ? "updating" : "creating"
        } document setting`
      );
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await api.admin.deleteVehicleDocumentSetting(token, id);
      if (response.success) {
        toast.success("Document setting deleted successfully");
        setDeleteConfirmId(null);
        fetchSettings();
      } else {
        toast.error(response.message || "Failed to delete document setting");
      }
    } catch (error) {
      toast.error("An error occurred while deleting document setting");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const currentVehicleType = vehicleTypes.find(
    (vt) => vt.name === selectedVehicleType
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vehicle Document Settings
          </h1>
          <p className="text-muted-foreground">
            Configure required documents for different vehicle types
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Document Setting
        </Button>
      </div>

      {/* Vehicle Type Selector */}
      <div className="flex items-center gap-4">
        <Label htmlFor="vehicleTypeFilter">Vehicle Type:</Label>
        <Select
          value={selectedVehicleType}
          onValueChange={setSelectedVehicleType}
        >
          <SelectTrigger id="vehicleTypeFilter" className="w-[200px]">
            <SelectValue placeholder="Select vehicle type" />
          </SelectTrigger>
          <SelectContent>
            {vehicleTypes.map((type) => (
              <SelectItem key={type.id} value={type.name}>
                {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : settings.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              No document settings configured
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="capitalize">
              {currentVehicleType?.name || selectedVehicleType}
            </CardTitle>
            <CardDescription>
              Required documents for{" "}
              {currentVehicleType?.name || selectedVehicleType} riders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No document settings configured for this vehicle type
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Requires Expiration</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-medium">
                        {setting.docName}
                      </TableCell>
                      <TableCell>
                        {setting.requiresExpiration ? "Yes" : "No"}
                      </TableCell>
                      <TableCell>{setting.isRequired ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenForm(setting)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteConfirmId(setting.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit" : "Add"} Document Setting
            </DialogTitle>
            <DialogDescription>
              Configure the document requirements for a vehicle type
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type *</Label>
              <Select
                value={formData.vehicleTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, vehicleTypeId: value })
                }
              >
                <SelectTrigger id="vehicleType">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="docName">Document Name *</Label>
              <Input
                id="docName"
                placeholder="e.g., Driver License"
                value={formData.docName}
                onChange={(e) =>
                  setFormData({ ...formData, docName: e.target.value })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="requiresExpiration"
                checked={formData.requiresExpiration}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requiresExpiration: checked })
                }
              />
              <Label htmlFor="requiresExpiration">
                Requires Expiration Date
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isRequired"
                checked={formData.isRequired}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isRequired: checked })
                }
              />
              <Label htmlFor="isRequired">Required Document</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFormDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              document setting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
