export interface Address {
  street1: string;
  street2?: string;
  city: string;
  // state: string; // Removed state
  postalCode: string;
  country: string;
}

export interface User {
  id: string; // Or number
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  // Password hash should NOT be stored here, handled securely in backend
  roles: ('customer' | 'manager' | 'admin')[]; // Example roles
  addresses?: Address[];
  // Add timestamps later
}
