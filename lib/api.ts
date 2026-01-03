const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface LoginRequest {
  emailOrMobile: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    access_token: string;
    user: {
      id: string;
      email: string;
      role: string;
      // Add other user fields as needed
    };
  };
  message?: string;
}

interface AnalyticsResponse {
  success: boolean;
  data?: {
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
  };
}

interface RiderRevenueResponse {
  success: boolean;
  data?: Array<{
    riderId: string;
    firstName: string;
    lastName: string;
    ordersFulfilled: string;
    totalEarnings: string;
  }>;
}

interface UsersResponse {
  success: boolean;
  data?: {
    users: Array<{
      id: string;
      email: string | null;
      mobile: string;
      firstName: string;
      lastName: string;
      role: string;
      profilePic: string;
      countryCode: string;
      registrationDate: string;
      updatedAt: string;
      registrationMode: string;
    }>;
    count: number;
  };
}

interface OrdersResponse {
  success: boolean;
  data?: {
    orders: Array<{
      id: string;
      status: string;
      isRiderAssigned: boolean;
      hasRewardedRider: boolean;
      deliveryFee: number;
      totalAmount: number;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface OrderDetailsResponse {
  success: boolean;
  data?: any; // Define proper type based on actual response
  message?: string;
}

export enum DocumentStatus {
  INITIAL = "INITIAL",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

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

interface RiderDocumentsResponse {
  success: boolean;
  data?: RiderInfo[];
  message?: string;
}

interface UpdateDocumentStatusRequest {
  documentStatus: DocumentStatus;
  rejectionReason?: string | null;
}

interface UpdateDocumentStatusResponse {
  success: boolean;
  data?: RiderDocument;
  message?: string;
}

interface VehicleDocumentSetting {
  id: string;
  vehicleTypeId: string;
  vehicleType: {
    id: string;
    name: string;
    description: string;
    baseFee: number;
    maxWeight: number | null;
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  docName: string;
  requiresExpiration: boolean;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VehicleDocumentSettingsResponse {
  success: boolean;
  data?: VehicleDocumentSetting[];
  message?: string;
}

interface VehicleDocumentSettingResponse {
  success: boolean;
  data?: VehicleDocumentSetting;
  message?: string;
}

interface CreateVehicleDocumentSettingRequest {
  vehicleTypeId: string;
  docName: string;
  requiresExpiration: boolean;
  isRequired: boolean;
}

interface UpdateVehicleDocumentSettingRequest {
  vehicleTypeId?: string;
  docName?: string;
  requiresExpiration?: boolean;
  isRequired?: boolean;
}

// Vehicle Types interfaces
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

interface VehicleTypesResponse {
  success: boolean;
  data?: VehicleType[];
  message?: string;
}

interface VehicleTypeResponse {
  success: boolean;
  data?: VehicleType;
  message?: string;
}

interface CreateVehicleTypeRequest {
  name: string;
  description: string;
  baseFee: number;
  maxWeight?: number | null;
  isActive: boolean;
}

interface UpdateVehicleTypeRequest {
  name?: string;
  description?: string;
  baseFee?: number;
  maxWeight?: number | null;
  isActive?: boolean;
}

// Notification interfaces
interface SendBulkNotificationRequest {
  title: string;
  body: string;
  userIds: string[];
  data?: {
    route?: string;
    [key: string]: any;
  };
}

interface SendBulkNotificationResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export const api = {
  auth: {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },

  admin: {
    getAnalytics: async (
      token: string,
      startDate: string,
      endDate: string
    ): Promise<AnalyticsResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/admin/analytics?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.json();
    },

    getRiderRevenue: async (
      token: string,
      startDate: string,
      endDate: string
    ): Promise<RiderRevenueResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/admin/riders/revenue?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.json();
    },

    getUsers: async (
      token: string,
      role: string,
      page?: number,
      limit?: number
    ): Promise<UsersResponse> => {
      const params = new URLSearchParams({ role });
      if (page !== undefined) params.append("page", page.toString());
      if (limit !== undefined) params.append("limit", limit.toString());
      const response = await fetch(
        `${API_BASE_URL}/admin/users?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.json();
    },

    getOrders: async (
      token: string,
      status: string
    ): Promise<OrdersResponse> => {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },

    getOrderDetails: async (
      token: string | null,
      orderId: string
    ): Promise<OrderDetailsResponse> => {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(
        `${API_BASE_URL}/admin/orders/details/${orderId}`,
        { headers }
      );
      return response.json();
    },

    // Rider Documents APIs
    getRiderDocuments: async (
      token: string,
      status: DocumentStatus
    ): Promise<RiderDocumentsResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/admin/riders/document-status?status=${status}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.json();
    },

    updateDocumentStatus: async (
      token: string,
      documentId: string,
      data: UpdateDocumentStatusRequest
    ): Promise<UpdateDocumentStatusResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/admin/riders/documents/${documentId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      return response.json();
    },

    // Vehicle Document Settings APIs
    getVehicleDocumentSettings: async (
      token: string,
      vehicleTypeName?: string
    ): Promise<VehicleDocumentSettingsResponse> => {
      const url = vehicleTypeName
        ? `${API_BASE_URL}/admin/vehicle-document-settings/vehicle-type/${vehicleTypeName}`
        : `${API_BASE_URL}/admin/vehicle-document-settings`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },

    getVehicleDocumentSettingById: async (
      token: string,
      id: string
    ): Promise<VehicleDocumentSettingResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/admin/vehicle-document-settings/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.json();
    },

    createVehicleDocumentSetting: async (
      token: string,
      data: CreateVehicleDocumentSettingRequest
    ): Promise<VehicleDocumentSettingResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/admin/vehicle-document-settings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      return response.json();
    },

    updateVehicleDocumentSetting: async (
      token: string,
      id: string,
      data: UpdateVehicleDocumentSettingRequest
    ): Promise<VehicleDocumentSettingResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/admin/vehicle-document-settings/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      return response.json();
    },

    deleteVehicleDocumentSetting: async (
      token: string,
      id: string
    ): Promise<{ success: boolean; message?: string }> => {
      const response = await fetch(
        `${API_BASE_URL}/admin/vehicle-document-settings/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.json();
    },

    // Vehicle Types APIs
    getVehicleTypes: async (
      token: string,
      includeInactive?: boolean
    ): Promise<VehicleTypesResponse> => {
      const params = new URLSearchParams();
      if (includeInactive !== undefined) {
        params.append("includeInactive", includeInactive.toString());
      }
      const url = `${API_BASE_URL}/vehicle-types${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },

    getVehicleTypeById: async (
      token: string,
      id: string
    ): Promise<VehicleTypeResponse> => {
      const response = await fetch(`${API_BASE_URL}/vehicle-types/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },

    createVehicleType: async (
      token: string,
      data: CreateVehicleTypeRequest
    ): Promise<VehicleTypeResponse> => {
      const response = await fetch(`${API_BASE_URL}/vehicle-types`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    updateVehicleType: async (
      token: string,
      id: string,
      data: UpdateVehicleTypeRequest
    ): Promise<VehicleTypeResponse> => {
      const response = await fetch(`${API_BASE_URL}/vehicle-types/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    deleteVehicleType: async (
      token: string,
      id: string
    ): Promise<{ success: boolean; message?: string }> => {
      const response = await fetch(`${API_BASE_URL}/vehicle-types/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },

    restoreVehicleType: async (
      token: string,
      id: string
    ): Promise<{ success: boolean; message?: string }> => {
      const response = await fetch(
        `${API_BASE_URL}/vehicle-types/${id}/restore`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.json();
    },
  },

  notifications: {
    sendBulkPushNotification: async (
      token: string,
      data: SendBulkNotificationRequest
    ): Promise<SendBulkNotificationResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/notification/push/send-bulk`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      return response.json();
    },
  },
};
