"use client";

import { useState, useEffect } from "react";
import { api, DocumentStatus } from "@/lib/api";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Eye, Loader2 } from "lucide-react";

interface RiderDocument {
  id: string;
  docName: string;
  docUrl: string;
  documentStatus: DocumentStatus;
  expirationDate: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RiderInfo {
  id: string;
  userId: string;
  vehicleType: string;
  documentStatus: DocumentStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  documents: RiderDocument[];
  userName: string;
}

export function RiderDocuments() {
  const { token } = useAuth();
  const [riderDocuments, setRiderDocuments] = useState<RiderInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus>(
    DocumentStatus.PENDING
  );
  const [selectedDocument, setSelectedDocument] =
    useState<RiderDocument | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">(
    "approve"
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchRiderDocuments();
    }
  }, [selectedStatus, token]);

  const fetchRiderDocuments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.admin.getRiderDocuments(token, selectedStatus);
      if (response.success && response.data) {
        setRiderDocuments(response.data);
      } else {
        toast.error(response.message || "Failed to fetch rider documents");
      }
    } catch (error) {
      toast.error("An error occurred while fetching rider documents");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDocument = (
    document: RiderDocument,
    action: "approve" | "reject"
  ) => {
    setSelectedDocument(document);
    setReviewAction(action);
    setRejectionReason("");
    setShowReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!token || !selectedDocument) return;

    if (reviewAction === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.admin.updateDocumentStatus(
        token,
        selectedDocument.id,
        {
          documentStatus:
            reviewAction === "approve"
              ? DocumentStatus.APPROVED
              : DocumentStatus.REJECTED,
          rejectionReason: reviewAction === "reject" ? rejectionReason : null,
        }
      );

      if (response.success) {
        toast.success(
          `Document ${
            reviewAction === "approve" ? "approved" : "rejected"
          } successfully`
        );
        setShowReviewDialog(false);
        fetchRiderDocuments();
      } else {
        toast.error(response.message || "Failed to update document status");
      }
    } catch (error) {
      toast.error("An error occurred while updating document status");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const variants: Record<
      DocumentStatus,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      [DocumentStatus.INITIAL]: "secondary",
      [DocumentStatus.PENDING]: "outline",
      [DocumentStatus.APPROVED]: "default",
      [DocumentStatus.REJECTED]: "destructive",
    };

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rider Documents</h1>
          <p className="text-muted-foreground">
            Review and manage rider document submissions
          </p>
        </div>
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as DocumentStatus)}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DocumentStatus.INITIAL}>Initial</SelectItem>
            <SelectItem value={DocumentStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={DocumentStatus.APPROVED}>Approved</SelectItem>
            <SelectItem value={DocumentStatus.REJECTED}>Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : riderDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              No documents found for this status
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {riderDocuments.map((riderInfo) => (
            <Card key={riderInfo.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Rider: {riderInfo.userId} | {riderInfo.userName}</CardTitle>
                    <CardDescription>
                      Vehicle Type: {riderInfo.vehicleType} | Status:{" "}
                      {getStatusBadge(riderInfo.documentStatus)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiration Date</TableHead>
                      <TableHead>Rejection Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riderInfo.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          {doc.docName}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(doc.documentStatus)}
                        </TableCell>
                        <TableCell>
                          {doc.expirationDate
                            ? new Date(doc.expirationDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>{doc.rejectionReason || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setImagePreview(doc.docUrl)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {doc.documentStatus === DocumentStatus.PENDING && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() =>
                                    handleReviewDocument(doc, "approve")
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleReviewDocument(doc, "reject")
                                  }
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve" : "Reject"} Document
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "Are you sure you want to approve this document?"
                : "Please provide a reason for rejecting this document."}
            </DialogDescription>
          </DialogHeader>
          {reviewAction === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant={reviewAction === "approve" ? "default" : "destructive"}
              onClick={handleSubmitReview}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {reviewAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {imagePreview && (
            <div className="relative w-full h-150">
              <img
                src={imagePreview}
                alt="Document preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
