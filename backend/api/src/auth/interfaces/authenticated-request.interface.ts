import { Request } from 'express';

// Define an interface to augment the Express Request type
// to include the user property added by JwtAuthGuard
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    // Add other user properties if needed in the request object
    // email: string;
    // roles: string[];
  };
  // StoreContextGuard adds storeId and storeSlug to the request
  storeId?: string;
  storeSlug?: string;
}