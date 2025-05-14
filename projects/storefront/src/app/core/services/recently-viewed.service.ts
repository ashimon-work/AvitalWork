import { Injectable } from '@angular/core';

const MAX_RECENTLY_VIEWED = 5;
const RECENTLY_VIEWED_KEY = 'recently_viewed_products';

@Injectable({
  providedIn: 'root'
})
export class RecentlyViewedService {

  constructor() { }

  addProduct(productId: string): void {
    if (!productId) {
      return;
    }

    let productIds = this.getRecentlyViewedProductIdsFromStorage();

    // Remove the product if it already exists to move it to the front
    productIds = productIds.filter(id => id !== productId);

    // Add the new product to the beginning of the array
    productIds.unshift(productId);

    // Limit the number of recently viewed products
    if (productIds.length > MAX_RECENTLY_VIEWED) {
      productIds = productIds.slice(0, MAX_RECENTLY_VIEWED);
    }

    this.saveRecentlyViewedProductIdsToStorage(productIds);
  }

  getRecentlyViewedProductIds(): string[] {
    return this.getRecentlyViewedProductIdsFromStorage();
  }

  private getRecentlyViewedProductIdsFromStorage(): string[] {
    const storedIds = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return storedIds ? JSON.parse(storedIds) : [];
  }

  private saveRecentlyViewedProductIdsToStorage(productIds: string[]): void {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(productIds));
  }
}