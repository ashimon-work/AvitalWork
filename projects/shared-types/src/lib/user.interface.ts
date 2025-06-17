import { Note } from './note.interface';

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: ('customer' | 'manager' | 'admin')[];
  addresses?: Address[];
  accountStatus?: string;
  registrationDate?: string;
  notes?: Note[];
  profilePictureUrl?: string;
  // Add timestamps later
}
