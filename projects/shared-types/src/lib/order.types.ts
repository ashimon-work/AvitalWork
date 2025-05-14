export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  // Add other relevant order properties based on backend API
  // Example: customer details, shipping address, order items
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string; // Added phone
  };
  shippingAddress?: {
    id: string;
    street: string; // Changed from address1
    address2?: string;
    city: string;
    state?: string;
    zipCode: string; // Changed from postalCode
    country: string;
  };
  items?: OrderItem[];
  notes?: OrderNote[];

  // Added fields based on modal template
  paymentMethod?: string;
  transactionId?: string;
  paymentStatus?: string;
  shippingMethod?: string;
  trackingNumber?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  // Add other relevant order item properties
}

export interface OrderNote {
  id: string;
  content: string; // Changed from note
  createdAt: string;
  createdBy: string;
}


export interface OrderListResponse {
  orders: Order[];
  totalCount: number;
}

export interface OrderQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}