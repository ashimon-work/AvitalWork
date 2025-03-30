export interface Category {
  id: string; // Or number, depending on DB choice - using string for UUID flexibility
  name: string;
  imageUrl: string;
  description?: string; // Added based on Category Page plan
}
