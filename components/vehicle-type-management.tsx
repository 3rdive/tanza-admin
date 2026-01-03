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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MoreVertical, Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/hooks";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface VehicleType {
  id: string;
  name: string;
  displayName?: string;
  description: string;
  baseFee: number;
  maxWeight: number | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  description: string;
  baseFee: number;
  maxWeight: number | null;
  isActive: boolean;
}

export function VehicleTypeManagement() {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [editingType, setEditingType] = useState<VehicleType | null>(null);
  const [deletingType, setDeletingType] = useState<VehicleType | null>(null);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    baseFee: 0,
    maxWeight: null,
    isActive: true,
  });
  const { token } = useAuth();
  const { toast } = useToast();

  const fetchVehicleTypes = async () => {
    setLoading(true);
    try {
      const result = await api.admin.getVehicleTypes(token!, includeInactive);
      if (result.success && result.data) {
        setVehicleTypes(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch vehicle types:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch vehicle types",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
  }, [token, includeInactive]);

  const handleOpenDialog = (type?: VehicleType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        description: type.description,
        baseFee: type.baseFee,
        maxWeight: type.maxWeight,
        isActive: type.isActive,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        description: "",
        baseFee: 0,
        maxWeight: null,
        isActive: true,
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingType(null);
    setFormData({
      name: "",
      description: "",
      baseFee: 0,
      maxWeight: null,
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingType) {
        // Update existing vehicle type
        const result = await api.admin.updateVehicleType(
          token!,
          editingType.id,
          formData
        );
        if (result.success) {
          toast({
            title: "Success",
            description: "Vehicle type updated successfully",
          });
          fetchVehicleTypes();
          handleCloseDialog();
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.message || "Failed to update vehicle type",
          });
        }
      } else {
        // Create new vehicle type
        const result = await api.admin.createVehicleType(token!, formData);
        if (result.success) {
          toast({
            title: "Success",
            description: "Vehicle type created successfully",
          });
          fetchVehicleTypes();
          handleCloseDialog();
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.message || "Failed to create vehicle type",
          });
        }
      }
    } catch (err) {
      console.error("Failed to save vehicle type:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while saving the vehicle type",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingType) return;

    const deletedTypeName = deletingType.name;
    const deletedTypeId = deletingType.id;

    try {
      const result = await api.admin.deleteVehicleType(token!, deletingType.id);
      if (result.success) {
        fetchVehicleTypes();

        // Show toast with undo action for 3 seconds
        const { dismiss } = toast({
          title: "Vehicle type deleted",
          description: `"${deletedTypeName}" has been deleted`,
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                dismiss();
                await handleRestore({ id: deletedTypeId } as VehicleType);
              }}
            >
              Undo
            </Button>
          ),
          duration: 3000,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to delete vehicle type",
        });
      }
    } catch (err) {
      console.error("Failed to delete vehicle type:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the vehicle type",
      });
    } finally {
      setShowDeleteAlert(false);
      setDeletingType(null);
    }
  };

  const handleRestore = async (type: VehicleType) => {
    try {
      const result = await api.admin.restoreVehicleType(token!, type.id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Vehicle type restored successfully",
        });
        fetchVehicleTypes();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to restore vehicle type",
        });
      }
    } catch (err) {
      console.error("Failed to restore vehicle type:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while restoring the vehicle type",
      });
    }
  };

  const openDeleteAlert = (type: VehicleType) => {
    setDeletingType(type);
    setShowDeleteAlert(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vehicle Type Management</h1>
          <p className="text-muted-foreground">
            Manage vehicle types for delivery services
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={includeInactive}
              onCheckedChange={setIncludeInactive}
              id="include-inactive"
            />
            <Label
              htmlFor="include-inactive"
              className="text-sm cursor-pointer"
            >
              Show inactive
            </Label>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Vehicle Type
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Vehicle Types ({vehicleTypes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">
              Loading vehicle types...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">
                    Description
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Base Fee
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Max Weight
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No vehicle types found
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicleTypes.map((type) => (
                    <TableRow
                      key={type.id}
                      className={`border-border hover:bg-muted/50 ${
                        type.deletedAt ? "opacity-60" : ""
                      }`}
                    >
                      <TableCell className="font-medium text-card-foreground">
                        {type.displayName || type.name}
                      </TableCell>
                      <TableCell className="text-card-foreground max-w-md truncate">
                        {type.description}
                      </TableCell>
                      <TableCell className="text-card-foreground">
                        ₦{type.baseFee.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-card-foreground">
                        {type.maxWeight ? `${type.maxWeight} kg` : "N/A"}
                      </TableCell>
                      <TableCell>
                        {type.deletedAt ? (
                          <Badge
                            variant="secondary"
                            className="bg-destructive/20 text-destructive"
                          >
                            Deleted
                          </Badge>
                        ) : type.isActive ? (
                          <Badge
                            variant="secondary"
                            className="bg-chart-2/20 text-chart-2"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-muted text-muted-foreground"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-popover/50">
                              <MoreVertical className="size-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {type.deletedAt ? (
                              <DropdownMenuItem
                                onSelect={() => handleRestore(type)}
                                className="gap-2"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Restore
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem
                                  onSelect={() => handleOpenDialog(type)}
                                  className="gap-2"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => openDeleteAlert(type)}
                                  className="gap-2 text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
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

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingType ? "Edit Vehicle Type" : "Add Vehicle Type"}
              </DialogTitle>
              <DialogDescription>
                {editingType
                  ? "Update the vehicle type details below."
                  : "Create a new vehicle type for delivery services."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Bike, Van, Truck"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the vehicle type"
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baseFee">Base Fee (₦)</Label>
                <Input
                  id="baseFee"
                  type="number"
                  value={formData.baseFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      baseFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxWeight">Max Weight (kg) - Optional</Label>
                <Input
                  id="maxWeight"
                  type="number"
                  value={formData.maxWeight || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxWeight: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Leave empty if not applicable"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button type="submit">{editingType ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the vehicle type &quot;{deletingType?.name}
              &quot;. You can restore it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingType(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
