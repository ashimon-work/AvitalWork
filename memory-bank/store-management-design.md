# Store Management Website Design Plan

## 1. Design Principles (Modern & Minimalist)

*   **Clean Layout:** Ample whitespace, clear separation of sections, and a focus on essential information.
*   **Intuitive Navigation:** Consistent and easily accessible navigation elements.
*   **Professional Typography:** Use of modern, readable fonts for headings and body text.
*   **Subtle Color Palette:** A primary accent color for key actions and branding, with a neutral palette for backgrounds and text. Use shades of grey, white, and a single accent color (e.g., a professional blue or green).
*   **Consistent UI Components:** Standardized buttons, forms, tables, cards, and modals across all pages.
*   **Responsiveness:** Design must adapt seamlessly to various screen sizes (desktop, tablet, mobile).
*   **Data Visualization:** Clear and concise presentation of data, especially on the Dashboard.
*   **Action-Oriented:** Prominent placement of key actions (e.g., "Add Product", "Save Changes").

## 2. Color Palette

*   **Primary Accent:** #28A745 (Green, as used for Login button in plan) - For primary actions, buttons, highlights.
*   **Secondary Accent:** #007BFF (Blue, as used for Storefront price) - Could be used for links or secondary actions, or a different shade of green for consistency. Let's stick to shades of green/grey for a unified management feel.
*   **Neutral Palette:**
    *   Background: #F8F9FA (Light Grey) or #FFFFFF (White)
    *   Text: #343A40 (Dark Grey)
    *   Borders/Dividers: #DEE2E6 (Light Grey)
    *   Hover/Active States: Subtle variations of background or accent color.
*   **Status Colors:**
    *   Success: #28A745 (Green)
    *   Warning: #FFC107 (Yellow)
    *   Danger: #DC3545 (Red)
    *   Info: #17A2B8 (Cyan)

## 3. Typography

*   **Font Family:** A clean, modern sans-serif font (e.g., 'Roboto', 'Open Sans', 'Lato').
*   **Headings:** Clear hierarchy using different font sizes and weights (H1 for page titles, H2 for section titles, etc.).
*   **Body Text:** Readable size and line spacing.

## 4. Layout Structure (General)

*   **Header:** Consistent header across all pages (except Login/404) with logo, navigation, manager info, notifications, and logout.
*   **Sidebar (Optional):** Used on pages with extensive filtering (Product Management, Customer Management) or multi-section content (Settings, Profile).
*   **Main Content Area:** Primary area for page-specific content, forms, tables, charts.
*   **Action Bars:** Consistent placement for page-level actions (Add, Search, Filter, Bulk Actions).

## 5. Page-Specific Design Outlines

### 5.1. Login Page

*   **Layout:** Centered form on a clean background.
*   **Elements:**
    *   Store management portal logo (prominent).
    *   Welcome message (simple, professional).
    *   Login form: Email input, Password input (with toggle), "Remember this device" checkbox, "Login" button (Primary Accent Green, full width).
    *   "Forgot Password" link.
    *   System requirements/Support info (subtle text below form).
*   **Styling:** Clean card-like container for the form, ample padding, subtle shadows.

### 5.2. Dashboard

*   **Layout:** Grid-based layout for performance snapshot cards, sales chart, recent orders, and alerts.
*   **Elements:**
    *   Header (as per general layout).
    *   Performance Snapshot Cards: Clean cards with key metrics (Total Sales, Orders Today, Low Stock Items). Use bold text for values, smaller text for trend indicators and labels. Use status colors for Low Stock alerts.
    *   Sales Chart: Prominent area for the line graph. Clear labels, interactive toggles for time periods.
    *   Recent Orders Table: Clean table with sortable columns, color-coded status indicators (using status colors). Action buttons (View/Update) as icons or small buttons. Pagination below the table.
    *   Inventory Alerts: Simple list or card-like display for alerts. Use warning/danger colors.
    *   Quick Action Buttons: Prominent buttons (Primary Accent Green) for key tasks.
    *   Store Health Score: A visual indicator (e.g., progress bar or score card) with recommendations.
*   **Styling:** Use cards for sections, consistent spacing, clear headings.

### 5.3. Product Management Page

*   **Layout:** Action bar at the top, main product table below. Optional filter sidebar.
*   **Elements:**
    *   Header.
    *   Action Bar: "Add Product" button (Primary Accent Green), Bulk actions dropdown, Search bar, Filter dropdowns/buttons.
    *   Product Table: Clean table with columns as specified. Product image thumbnails (small, consistent size). Stock level color-coded. Action icons (Edit, Duplicate, Delete). Selection checkboxes. Pagination and count summary below.
    *   Advanced Filter Sidebar (if toggled): Collapsible sidebar with detailed filter options (checkboxes, sliders).
    *   Add/Edit Product Modal: Multi-tabbed modal with forms for product details. Image uploader with drag-and-drop area and previews. Variant generator interface. Save/Cancel buttons (Primary Accent Green for Save).
*   **Styling:** Clean table design with hover effects. Modal with clear sections and form validation feedback.

### 5.4. Order Management Page

*   **Layout:** Action bar with status tabs, main orders table below.
*   **Elements:**
    *   Header.
    *   Action Bar: Order status filter tabs (visually distinct for active tab), Date range picker, Search bar, Export button.
    *   Orders Table: Clean table with columns as specified. Payment and Fulfillment status with color indicators. Action icons (View, Update, Cancel). Pagination and count summary below.
    *   Order Details Modal: Modal with sections for order summary, customer info, items list, payment, shipping, notes. Status update controls (dropdown/buttons). Fulfillment actions (buttons/icons). Customer communication tools.
*   **Styling:** Tabs with clear visual states. Table with status color coding. Modal with well-organized sections.

### 5.5. Customer Management Page

*   **Layout:** Action bar, main customers table below.
*   **Elements:**
    *   Header.
    *   Action Bar: Search bar, Filter options (dropdowns/buttons), Export button, Customer segmentation options.
    *   Customers Table: Clean table with columns as specified. Account status indicator. Action icons (View, Edit, Contact). Pagination and count summary below.
    *   Customer Details Modal: Modal with sections for personal info, address book, order history (expandable), communication history, notes. Account status controls. Direct contact options (email icon).
*   **Styling:** Similar table and modal styling to other management pages for consistency.

### 5.6. Settings Page

*   **Layout:** Left sidebar for setting categories, main content area for setting forms.
*   **Elements:**
    *   Header.
    *   Left Sidebar: Navigation list for setting categories. Highlight active category.
    *   Main Content Area: Forms for the selected setting category. Use clear labels, input fields, dropdowns, checkboxes, toggles. "Save Changes" button (Primary Accent Green) and "Reset to Defaults" button below each form section.
*   **Styling:** Sidebar with clear navigation. Forms with consistent input styling and validation feedback.

### 5.7. Profile Page

*   **Layout:** Sections for profile information, password change, 2FA, notifications, login history.
*   **Elements:**
    *   Header.
    *   Profile Information: Display fields with edit options. Profile picture upload area.
    *   Password Change: Form with current, new, confirm password fields. Password strength meter (visual indicator).
    *   Two-Factor Authentication: Toggle switch, setup instructions, backup codes button.
    *   Notification Preferences: Checkboxes for email/SMS/in-app notifications.
    *   Login History Table: Simple table displaying login details.
    *   "Save Changes" button (Primary Accent Green) at the bottom.
*   **Styling:** Use cards or distinct sections for each area. Clear form fields and validation.

### 5.8. 404 Page

*   **Layout:** Centered content.
*   **Elements:**
    *   "404 - Page Not Found" header (large, distinct).
    *   Friendly error message.
    *   "Back to Dashboard" button (Primary Accent Green).
    *   Quick links to common management pages.
    *   Support contact information.
*   **Styling:** Simple, clear, and on-brand.

## 6. UI Component Styling (General)

*   **Buttons:** Consistent padding, border-radius, hover/active states. Primary (Green), Secondary (Outlined/Grey), Danger (Red).
*   **Forms:** Standardized input field height, borders, focus states. Clear labels. Validation feedback (e.g., red borders, error messages below fields).
*   **Tables:** Clean borders, alternating row colors for readability, hover effects.
*   **Cards:** Subtle borders or shadows, consistent padding.
*   **Modals:** Overlay background, centered modal window, close button, clear header and footer (with action buttons).
*   **Icons:** Use a consistent icon library (e.g., Font Awesome, Material Icons) for actions and indicators.

## 7. Responsiveness Considerations

*   **Mobile Navigation:** Implement a collapsible sidebar or a bottom navigation bar for smaller screens.
*   **Tables:** Use responsive table patterns (e.g., stacking rows, horizontal scrolling, displaying key info and hiding less critical columns).
*   **Forms:** Stack form fields vertically on small screens.
*   **Dashboard:** Adjust grid layout for cards and charts to stack vertically on smaller screens.

## 8. Implementation Notes

*   Use SCSS variables for colors, typography, and spacing to ensure consistency.
*   Create reusable Angular components for common UI elements (buttons, inputs, tables, modals, cards).
*   Implement form validation using Angular Reactive Forms.
*   Utilize Angular Material or a similar component library as a base, customizing it to match the "Modern & Minimalist" theme and color palette. (Decision: Use Angular Material or similar, but heavily customize to fit the specific theme, rather than using default Material design).