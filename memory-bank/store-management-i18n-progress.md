# Store Management Internationalization (i18n) Progress

## Internationalization Steps

To internationalize a component:

1.  **Add Translation Keys:** Identify all user-facing strings in the component's `.html` template and `.ts` file. Create unique `SM_` prefixed keys for these strings in the translation files (e.g., `projects/shared-i18n/src/lib/translations/en.ts` and `he.ts`). Ensure the keys follow a consistent naming convention (e.g., `SM_COMPONENT_NAME_DESCRIPTION`).
2.  **Import and Use Translation Pipe:**
    *   In the component's `.ts` file, import `T` from `@shared/i18n` and `TranslatePipe` from `@shared/i18n`.
    *   Add `TranslatePipe` to the `imports` array in the component's `@Component` decorator.
    *   In the component class, declare `public tKeys = T;`.
3.  **Apply Translation Pipe in Template:** In the component's `.html` template, replace static strings with the `| translate` pipe using the `tKeys` object.
    *   For simple text: `{{ tKeys.SM_YOUR_KEY | translate }}`
    *   For attributes (like placeholder): `[placeholder]="tKeys.SM_YOUR_KEY | translate"`
    *   For keys with parameters: `{{ tKeys.SM_KEY_WITH_PARAMS | translate:params }}`
4.  **Update Checklist:** Mark the component's `.html` and `.ts` files as completed (`[x]`) in this progress document.

## Components to Internationalize

-   [x] `projects/store-management/src/app/app.component.html`
-   [x] `projects/store-management/src/app/app.component.ts`
-   [x] `projects/store-management/src/app/auth/login-page/login-page.component.html`
-   [x] `projects/store-management/src/app/auth/login-page/login-page.component.ts`
-   [x] `projects/store-management/src/app/core/components/management-not-found-page/management-not-found-page.component.html`
-   [x] `projects/store-management/src/app/core/components/management-not-found-page/management-not-found-page.component.ts`
-   [x] `projects/store-management/src/app/customer-management/components/customer-details-modal/customer-details-modal.component.html`
-   [x] `projects/store-management/src/app/customer-management/components/customer-details-modal/customer-details-modal.component.ts`
-   [x] `projects/store-management/src/app/customer-management/customer-management-page/customer-management-page.component.html`
-   [x] `projects/store-management/src/app/customer-management/customer-management-page/customer-management-page.component.ts`
-   [x] `projects/store-management/src/app/dashboard/dashboard-page/dashboard-page.component.html`
-   [x] `projects/store-management/src/app/dashboard/dashboard-page/dashboard-page.component.ts`
- [x] `projects/store-management/src/app/management-not-found/management-not-found-page/management-not-found-page.component.html`
- [x] `projects/store-management/src/app/management-not-found/management-not-found-page/management-not-found-page.component.ts`
-   [x] `projects/store-management/src/app/order-management/components/order-details-modal/order-details-modal.component.html`
-   [x] `projects/store-management/src/app/order-management/components/order-details-modal/order-details-modal.component.ts`
-   [x] `projects/store-management/src/app/order-management/order-management-page/order-management-page.component.html`
-   [x] `projects/store-management/src/app/order-management/order-management-page/order-management-page.component.ts`
- [x] `projects/store-management/src/app/product-management/product-management-page/product-management-page.component.html`
- [x] `projects/store-management/src/app/product-management/product-management-page/product-management-page.component.ts`
- [x] `projects/store-management/src/app/profile/profile-page/profile-page.component.html`
- [x] `projects/store-management/src/app/profile/profile-page/profile-page.component.ts`
- [x] `projects/store-management/src/app/settings/settings-page/settings-page.component.ts`
- [x] `projects/store-management/src/app/settings/settings-page/settings-page.component.html`

## Checklist Legend
-   [ ] Not Started
-   [/] In Progress
-   [x] Completed

---
*This file is managed by Roo.*