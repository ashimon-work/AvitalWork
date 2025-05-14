export interface Order {
  id: string;
  orderNumber: string;
  orderReference: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  createdAt: string;
  fulfilledAt?: Date;
  // Add other relevant order properties based on backend API
  // Example: customer details, shipping address, order items
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  shippingAddress?: {
    id: string;
    fullName: string;
    street1: string;
    street2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items?: OrderItem[];
  notes?: OrderNote[];
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
  note: string;
  createdAt: string;
  createdBy: string; // e.g., 'manager' or user ID
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
  status?: string; // e.g., 'pending', 'processing', 'shipped', 'cancelled'
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  search?: string; // Search term for order number, customer name, etc.
}
