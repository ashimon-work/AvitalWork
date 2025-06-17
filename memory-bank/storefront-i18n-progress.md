# Storefront Internationalization (i18n) Documentation

## Current Implementation Summary

### File Structure and Organization
- Translation files are located in `projects/shared-i18n/src/lib/translations/`
- Primary files:
  - `en.ts` - English translations
  - `he.ts` - Hebrew translations
  - `index.ts` - Exports translations
- Translations are imported via `@shared/i18n` module

### Key Naming Conventions
- Storefront-specific keys use `SF_` prefix (e.g., `SF_HEADER_LOGO_ALT`)
- Keys follow component/module hierarchy (e.g., `SF_ACCOUNT_ADDRESSES_TITLE`)
- Consistent casing (UPPER_SNAKE_CASE)
- Keys are grouped by feature area (header, footer, account, etc.)

### Dynamic Content Handling
- Simple strings: `SF_HEADER_LOGIN_TITLE: "Login"`
- Parameterized strings: 
```typescript
SF_FOOTER_COPYRIGHT: (params: { year: number, storeName: string }) => 
  `&copy; ${params.year} ${params.storeName}. All Rights Reserved.`
```
- Function parameters are typed for safety
- Used via template strings for flexibility

## Instructions for Adding Translations

### Key Prefix Guidelines
- Always use `SF_` prefix for storefront-specific translations
- Follow existing naming patterns:
  - `SF_[COMPONENT]_[ELEMENT]_[DESCRIPTION]`
  - Example: `SF_ACCOUNT_ADDRESSES_EDIT_BUTTON`

### Function Pattern for Dynamic Content
1. Define typed parameters:
```typescript
SF_ACCOUNT_WISHLIST_ADD_TO_CART_SUCCESS: (params: { productName: string }) => 
  `${params.productName} added to cart.`
```
2. Use in components:
```typescript
this.notificationService.showSuccess(
  T.SF_ACCOUNT_WISHLIST_ADD_TO_CART_SUCCESS({ productName })
);
```

### Error Message Conventions
- Standard format: `SF_[COMPONENT]_[ACTION]_ERROR`
- Include context where helpful:
```typescript
SF_ACCOUNT_ADDRESSES_SAVE_FAILED_ADD: "Failed to add address. Please try again."
```

### Process for Adding Translations
1. Add key to both `en.ts` and `he.ts`
2. For new components:
   - Group related keys together
   - Add comments if needed for context
3. Test both static and dynamic translations
4. Update this documentation if patterns change

## Recommended TODOs

### Organize Keys by Feature Modules
- Consider splitting into multiple files by feature area
- Example structure:
  - `header.ts`
  - `account.ts` 
  - `product.ts`
- Import and combine in `index.ts`

### Add Translation Context Comments
```typescript
// Used in account address edit modal submit button
SF_ACCOUNT_ADDRESSES_SAVE_BUTTON_UPDATE: "Update Address"
```

### Consider Automated Validation
- Add CI check for:
  - Missing Hebrew translations
  - Parameter consistency between languages
  - Key naming conventions

---

# Storefront Application Internationalization Progress

**Build Process:** A build watch is active, so changes to `shared-i18n` translation files should automatically update the `T` keys. Manual rebuild of `shared-i18n` is not required.

## Core Layout Components

-   [x] `projects/storefront/src/app/core/components/header/header.component.html`
-   [x] `projects/storefront/src/app/core/components/header/header.component.ts`
-   [x] `projects/storefront/src/app/core/components/footer/footer.component.html`
-   [x] `projects/storefront/src/app/core/components/footer/footer.component.ts`
-   [x] `projects/storefront/src/app/core/components/navigation/navigation.component.html`
-   [x] `projects/storefront/src/app/core/components/navigation/navigation.component.ts`

## Translation Files (`projects/shared-i18n/src/lib/translations/`)

-   [x] `en.ts` (ensure all `SF_` keys are added)
-   [x] `he.ts` (ensure all `SF_` keys are added)

## Other Components to Internationalize

### Remaining Core Components
-   [x] `projects/storefront/src/app/core/components/search-bar/search-bar.component.html`
-   [x] `projects/storefront/src/app/core/components/search-bar/search-bar.component.ts`
-   [x] `projects/storefront/src/app/core/components/not-found-page/not-found-page.component.html`
-   [x] `projects/storefront/src/app/core/components/not-found-page/not-found-page.component.ts`

### Shared Components
-   [x] `projects/storefront/src/app/shared/components/category-card/category-card.component.html`
-   [x] `projects/storefront/src/app/shared/components/category-card/category-card.component.ts`
-   [x] `projects/storefront/src/app/shared/components/image-carousel/image-carousel.component.html`
-   [x] `projects/storefront/src/app/shared/components/image-carousel/image-carousel.component.ts`
-   [x] `projects/storefront/src/app/shared/components/newsletter-form/newsletter-form.component.html`
-   [x] `projects/storefront/src/app/shared/components/newsletter-form/newsletter-form.component.ts`
-   [x] `projects/storefront/src/app/shared/components/notification-toast/notification-toast.component.html`
-   [x] `projects/storefront/src/app/shared/components/notification-toast/notification-toast.component.ts`
-   [x] `projects/storefront/src/app/shared/components/product-card/product-card.component.html`
-   [x] `projects/storefront/src/app/shared/components/product-card/product-card.component.ts`

### Page-Level Components & Feature Modules

**About Page:**
-   [x] `projects/storefront/src/app/about/about-page/about-page.component.html`
-   [x] `projects/storefront/src/app/about/about-page/about-page.component.ts`

**Account Module:**
-   [x] `projects/storefront/src/app/account/account-page/account-page.component.html`
-   [x] `projects/storefront/src/app/account/account-page/account-page.component.ts`
-   [x] `projects/storefront/src/app/account/account-addresses/account-addresses.component.html`
-   [x] `projects/storefront/src/app/account/account-addresses/account-addresses.component.ts`
-   [x] `projects/storefront/src/app/account/account-change-password/account-change-password.component.html`
-   [x] `projects/storefront/src/app/account/account-change-password/account-change-password.component.ts`
-   [x] `projects/storefront/src/app/account/account-order-detail/account-order-detail.component.html`
-   [x] `projects/storefront/src/app/account/account-order-detail/account-order-detail.component.ts`
-   [x] `projects/storefront/src/app/account/account-orders/account-orders.component.html`
-   [x] `projects/storefront/src/app/account/account-orders/account-orders.component.ts`
-   [x] `projects/storefront/src/app/account/account-overview/account-overview.component.html`
-   [x] `projects/storefront/src/app/account/account-overview/account-overview.component.ts`
-   [x] `projects/storefront/src/app/account/account-payment-methods/account-payment-methods.component.html`
-   [x] `projects/storefront/src/app/account/account-payment-methods/account-payment-methods.component.ts`
-   [x] `projects/storefront/src/app/account/account-personal-info/account-personal-info.component.html`
-   [x] `projects/storefront/src/app/account/account-personal-info/account-personal-info.component.ts`
-   [x] `projects/storefront/src/app/account/account-wishlist/account-wishlist.component.html`
-   [x] `projects/storefront/src/app/account/account-wishlist/account-wishlist.component.ts`

**Cart Page:**
-   [x] `projects/storefront/src/app/cart/cart-page/cart-page.component.html`
-   [x] `projects/storefront/src/app/cart/cart-page/cart-page.component.ts`

**Category Page:**
-   [x] `projects/storefront/src/app/category/category-page/category-page.component.html`
-   [x] `projects/storefront/src/app/category/category-page/category-page.component.ts`

**Checkout Page:**
-   [x] `projects/storefront/src/app/checkout/checkout-page/checkout-page.component.html`
-   [x] `projects/storefront/src/app/checkout/checkout-page/checkout-page.component.ts`

**Contact Page:**
-   [x] `projects/storefront/src/app/contact/contact-page/contact-page.component.html`
-   [x] `projects/storefront/src/app/contact/contact-page/contact-page.component.ts`

**FAQ Page:**
-   [x] `projects/storefront/src/app/faq/faq-page/faq-page.component.html`
-   [x] `projects/storefront/src/app/faq/faq-page/faq-page.component.ts`

**Home Module:**
-   [x] `projects/storefront/src/app/home/homepage/homepage.component.html`
-   [x] `projects/storefront/src/app/home/homepage/homepage.component.ts`
-   [x] `projects/storefront/src/app/home/components/carousel/carousel.component.html`
-   [x] `projects/storefront/src/app/home/components/carousel/carousel.component.ts`
178 |
**Login Page:**
-   [x] `projects/storefront/src/app/login-page/login-page.component.html`
-   [x] `projects/storefront/src/app/login-page/login-page.component.ts`

**Order Confirmation Page:**
-   [x] `projects/storefront/src/app/order-confirmation/order-confirmation-page/order-confirmation-page.component.html`
-   [x] `projects/storefront/src/app/order-confirmation/order-confirmation-page/order-confirmation-page.component.ts`

**Product Page:**
-   [x] `projects/storefront/src/app/product/product-page/product-page.component.html`
-   [x] `projects/storefront/src/app/product/product-page/product-page.component.ts`

**Registration Page:**
-   [x] `projects/storefront/src/app/registration-page/registration-page.component.html`
-   [x] `projects/storefront/src/app/registration-page/registration-page.component.ts`

**Return Policy Page:**
-   [x] `projects/storefront/src/app/return-policy/return-policy-page/return-policy-page.component.html`
-   [x] `projects/storefront/src/app/return-policy/return-policy-page/return-policy-page.component.ts`

**Shipping Policy Page:**
-   [x] `projects/storefront/src/app/shipping-policy/shipping-policy-page/shipping-policy-page.component.html`
-   [x] `projects/storefront/src/app/shipping-policy/shipping-policy-page/shipping-policy-page.component.ts`

**Shop Page:**
-   [x] `projects/storefront/src/app/shop/shop-page/shop-page.component.html`
-   [x] `projects/storefront/src/app/shop/shop-page/shop-page.component.ts`

### Root Component
-   [x] `projects/storefront/src/app/app.component.html`
-   [x] `projects/storefront/src/app/app.component.ts`

## Checklist Legend
-   [ ] Not Started
-   [/] In Progress / Partially Done
-   [x] Completed

## Internationalization Steps

To internationalize a component:

1.  **Add Translation Keys:** Identify all user-facing strings in the component's `.html` template and `.ts` file. Create unique `SF_` prefixed keys for these strings in the translation files (`projects/shared-i18n/src/lib/translations/en.ts` and `he.ts`). Ensure the keys follow a consistent naming convention (e.g., `SF_COMPONENT_NAME_DESCRIPTION`).
2.  **Import and Use Translation Pipe:**
    *   In the component's `.ts` file, import `T` from `@shared/i18n` and `TranslatePipe` from `@shared/i18n`.
    *   Add `TranslatePipe` to the `imports` array in the component's `@Component` decorator.
    *   In the component class, declare `public tKeys = T;`.
3.  **Apply Translation Pipe in Template:** In the component's `.html` template, replace static strings with the `| translate` pipe using the `tKeys` object.
    *   For simple text: `{{ tKeys.SF_YOUR_KEY | translate }}`
    *   For attributes (like placeholder): `[placeholder]="tKeys.SF_YOUR_KEY | translate"`
    *   For keys with parameters: `{{ tKeys.SF_KEY_WITH_PARAMS | translate:params }}`
4.  **Update Checklist:** Mark the component's `.html` and `.ts` files as completed (`[x]`) in this progress document.

---
*This file is managed by Roo.*