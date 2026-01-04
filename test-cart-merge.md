# Cart Merge Fix Verification

## Problem
The cart was appearing empty after a successful merge operation when a user logged in, even though the merge was successful on the backend.

## Root Cause
1. In the frontend `CartService.mergeAndLoadUserCart()` method, after a successful merge, the code was calling `loadInitialCart()` which would fetch the cart from the server again.
2. However, the merge operation already returns the updated cart with all items, so we should use that response directly.
3. In the backend, there was a redundant fallback lookup for the guest cart that could cause confusion.

## Fix Applied

### Frontend Fix (projects/storefront/src/app/core/services/cart.service.ts)
- Modified `mergeAndLoadUserCart()` to directly update the cart state with the merged cart response instead of calling `loadInitialCart()`
- Changed from:
  ```typescript
  tap(() => {
    console.log('Guest cart merged successfully.');
    this.clearLocalGuestCartId();
    this.loadInitialCart(); // Load the now-merged user cart
  })
  ```
- To:
  ```typescript
  tap((mergedCart) => {
    console.log('Guest cart merged successfully.', mergedCart);
    this.clearLocalGuestCartId();
    // Update the cart state directly with the merged cart from the response
    this._updateStateFromBackendCart(mergedCart);
  })
  ```

### Backend Fix (backend/api/src/cart/cart.service.ts)
- Removed redundant fallback lookup for guest cart in `mergeCarts()` method
- The code was trying to look up the guest cart with two different field names, which could cause issues

## Testing Steps
1. Add items to cart as a guest user
2. Log in with an existing account
3. Navigate to the cart page
4. Verify that the items from the guest cart are now visible in the logged-in user's cart

## Expected Result
The cart should display all items that were in the guest cart before login, with correct quantities and product details.