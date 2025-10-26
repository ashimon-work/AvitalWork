import { GREEN_JEWELRY_STORE_ID } from './green-jewelry.data'; // Assuming this exports the ID

// Placeholder for other store IDs if you have them defined elsewhere
// Example: import { AWESOME_GADGETS_STORE_ID, FASHION_FUN_STORE_ID } from './other-stores.data';
export const AWESOME_GADGETS_STORE_ID = '11111111-1111-1111-1111-111111111111';
export const FASHION_FUN_STORE_ID = '22222222-2222-2222-2222-222222222222';

interface RawShippingMethodData {
  id?: string; // Optional for seeding, can be auto-generated
  name: string;
  description?: string;
  cost: number;
  estimatedDeliveryDays?: number;
  isActive?: boolean;
  storeId: string;
}

export const shippingMethodData: RawShippingMethodData[] = [
  // Green Jewelry Store
  {
    name: 'משלוח רגיל',
    description: 'משלוח עד 7 ימי עסקים לכל הארץ',
    cost: 25.0,
    estimatedDeliveryDays: 7,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
  },
  {
    name: 'משלוח אקספרס',
    description: 'משלוח עד 3 ימי עסקים (לערים מרכזיות)',
    cost: 50.0,
    estimatedDeliveryDays: 3,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
  },
  {
    name: 'איסוף עצמי',
    description: 'זמין לאיסוף מהחנות בתיאום מראש תוך יום עסקים אחד',
    cost: 0.0,
    estimatedDeliveryDays: 1,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
  },

  // Awesome Gadgets & Goods Store
  {
    name: 'Standard Shipping',
    description: '5-7 business days',
    cost: 5.99,
    estimatedDeliveryDays: 7,
    isActive: true,
    storeId: AWESOME_GADGETS_STORE_ID,
  },
  {
    name: 'Expedited Shipping',
    description: '2-3 business days',
    cost: 12.99,
    estimatedDeliveryDays: 3,
    isActive: true,
    storeId: AWESOME_GADGETS_STORE_ID,
  },
  {
    name: 'Free Shipping (Orders over $50)',
    description: '5-7 business days, applies to orders over $50',
    cost: 0.0,
    estimatedDeliveryDays: 7,
    isActive: true,
    storeId: AWESOME_GADGETS_STORE_ID, // Note: Logic for "orders over $50" would be in cart/checkout, not here directly
  },

  // Fashion & Fun Zone Store
  {
    name: 'Economy Shipping',
    description: '7-10 business days',
    cost: 4.5,
    estimatedDeliveryDays: 10,
    isActive: true,
    storeId: FASHION_FUN_STORE_ID,
  },
  {
    name: 'Priority Shipping',
    description: '3-5 business days',
    cost: 9.75,
    estimatedDeliveryDays: 5,
    isActive: true,
    storeId: FASHION_FUN_STORE_ID,
  },
];
