# Screen-by-Screen Design Specification: Global Marketplace App

> **Note:** This design is an implementation of the principles defined in the `global-marketplace-style-guide.md`. All colors, fonts, and component styles are derived from that source of truth.

## 1. Home Screen: A Gateway to Discovery

### A. High-Level Layout & Feel

*   **Philosophy:** The layout embodies "Confident & Effortless Exploration." It is clean, spacious, and uses a grid-based structure with generous white space to let the product photography shine.
*   **Background:** The `Scaffold` background color is the neutral off-white (`#FFFFFF`) to feel calm and clean.
*   **Structure:** The body is wrapped in a `SingleChildScrollView` to ensure a smooth, continuous scrolling experience.

---

### B. AppBar: The Anchor of Trust

*   **Color:** The `AppBar` uses the primary Deep Teal/Blue (`#0A4F70`) to establish a sense of trust and stability.
*   **Title:** Displays "Global Marketplace" using the **Lato** font, reinforcing the brand's warm yet stable personality.
*   **Actions:**
    *   An `IconButton` using the **outined** `shopping_cart` Material Symbol.
    *   When items are in the cart, the cart icon will feature a small circular badge using the accent Warm Gold (`#FFC107`) to draw attention without being alarming.

---

### C. Body: The Journey of Discovery

#### 1. Search Bar: Your Friendly Guide

*   **Philosophy:** This is less a "search" and more an invitation to "discover."
*   **Styling:** The component has a subtle border radius (`12px`) and a soft shadow to feel tangible and well-crafted. The background is the light gray neutral (`#F5F5F5`).
*   **Content:** The hint text reads, "Discover unique, handcrafted goods..." using the Lato font. It includes an **outlined** `search` Material Symbol.

#### 2. Featured Categories: Curated Pathways

*   **Description:** A horizontally scrolling `ListView` that presents curated pathways into the marketplace.
*   **Item Widget:** Each category is a `Chip` with a border radius of `8px`. The selected chip uses the accent Warm Gold (`#FFC107`), while unselected chips have a light grey background (`#F5F5F5`) with a border.
*   **Typography:** Category names use the **Lato** font.

#### 3. Featured Products Section: The Gallery

*   **Section Title:** A `Text` widget with the value "Featured Products," styled as a warm and encouraging subheading in **Lato**.
*   **Layout:** A `GridView` with a `crossAxisCount` of 2. It has generous `crossAxisSpacing` and `mainAxisSpacing` (e.g., `16.0`) to give each product room to breathe.
*   **Item Widget:** Each grid item is a `ProductCard` that strictly adheres to the style guide:
    *   **Shape:** `8px` border radius.
    *   **Elevation:** A subtle, soft shadow.
    *   **Content:** All text uses the **Lato** font family. High-quality, authentic lifestyle photography is paramount.

#### 4. Top Stores Section: Meet the Artisans

*   **Section Title:** A `Text` widget with the value "Top Stores," styled as a warm subheading in **Lato**.
*   **Description:** A horizontally scrolling `ListView` that connects customers with the talented artisans on the platform, building authenticity and trust.
*   **Item Widget:** Each item is a `CircleAvatar` for the store's logo, which should be high-quality. Below the avatar, the store's name is displayed in the **Lato** font.
---

## 2. Product Detail Screen: Confident Purchase

### A. High-Level Layout &amp; Feel

*   **Philosophy:** This screen is designed to build maximum trust and provide all necessary information for a confident purchase decision. It continues the "Confident &amp; Effortless Exploration" theme by presenting information clearly and logically.
*   **Background:** The `Scaffold` background is the neutral off-white (`#FFFFFF`), maintaining a clean and spacious feel that allows the product photography to be the hero.
*   **Structure:** The entire body is a `SingleChildScrollView` to ensure all content is accessible without overflow errors, even on smaller devices with extensive descriptions or multiple variants.

```mermaid
graph TD
    subgraph "Product Detail Screen"
        A[Scaffold] --&gt; B(AppBar w/ Back Button);
        A --&gt; C(SingleChildScrollView Body);

        subgraph "Body Components"
            C --&gt; D(Image Carousel - PageView);
            C --&gt; E(Product Info - Padding/Column);
            C --&gt; F(Variant Selection - DropdownButton);
            C --&gt; G(Add to Cart - ElevatedButton);
            C --&gt; H(Description - Text);
        end

        subgraph "Product Info Breakdown"
            E --&gt; E1(Store Attribution - Row);
            E --&gt; E2(Product Name - Text);
            E --&gt; E3(Product Price - Text);
        end
    end

    style B fill:#0A4F70,stroke:#333,stroke-width:2px,color:#fff
    style G fill:#0A4F70,stroke:#333,stroke-width:2px,color:#fff
    style E3 fill:#FFC107,stroke:#333,stroke-width:2px,color:#000
```

---

### B. Component Breakdown

#### 1. AppBar: Clear &amp; Controlled Navigation

*   **Color:** The `AppBar` uses the primary Deep Teal/Blue (`#0A4F70`) for consistency and trust.
*   **Leading Action:** A clear back `IconButton` is present to ensure the user feels in control and can easily navigate back to their discovery journey.

#### 2. Image Carousel: The Product Showcase

*   **Component:** A large, horizontally scrolling `PageView` at the top of the screen.
*   **Visuals:** It is crucial that this space is filled with **high-quality, professional, and authentic lifestyle photography** as mandated by the style guide.

#### 3. Product Info Section: The Core Details

*   **Layout:** Wrapped in a `Padding` widget to create breathing room around the content. The content itself is in a `Column` for a clear vertical flow of information.
*   **Store Attribution:**
    *   **Component:** A `Row` containing the store's logo (`Store.logoUrl`) and name (`Store.name`).
    *   **Purpose:** Builds trust and authenticity by clearly attributing the product to its maker.
    *   **Typography:** Uses the **Lato** font.
*   **Product Name:**
    *   **Component:** A large, bold `Text` widget.
    *   **Typography:** Uses the **Lato** font to be warm and stable.
*   **Product Price:**
    *   **Component:** A prominent `Text` widget.
    *   **Styling:** Uses the accent Warm Gold (`#FFC107`) to signify value and draw the eye.

#### 4. Variant Selection: Simple Choices

*   **Condition:** This section only appears if the product has variants (e.g., Size, Color).
*   **Component:** One or more `DropdownButton` widgets.
*   **Styling:** Each dropdown has a subtle border radius (`8px`) and a soft elevation, making it feel tangible and well-crafted, consistent with the style guide's component feel.

#### 5. "Add to Cart" Button: The Call to Action

*   **Component:** A full-width `ElevatedButton`.
*   **Styling:**
    *   **Color:** Uses the primary Deep Teal/Blue (`#0A4F70`) for a clear, confident call-to-action.
    *   **Shape:** Has the standard `8-12px` border radius.
    *   **Typography:** The button's text uses the **Lato** font.

#### 6. Description: The Story

*   **Component:** A `Text` widget below the "Add to Cart" button.
*   **Typography:** Uses the **Lato** font, optimized for readability, to tell the product's story, share details about its creation, and list materials.
---

## 3. Shopping Cart Screen: A Clear and Confident Checkout Path

### A. High-Level Philosophy &amp; Layout

*   **Philosophy:** This screen embodies the **"Clarity Above All"** principle. The primary goal is to present the cart's contents in a clear, organized manner that builds **Trust** and provides a confident path forward, whether that's proceeding to checkout or returning to shopping.
*   **Background:** The `Scaffold` background is the neutral off-white (`#FFFFFF`), maintaining the app's clean and spacious aesthetic.
*   **Structure:** The `AppBar` provides clear navigation, and the body uses logic to present either an empty state or a list of items, preventing user confusion.

```mermaid
graph TD
    subgraph "Shopping Cart Screen"
        A[Scaffold] --&gt; B(AppBar w/ Back Button);
        A --&gt; C{Body Logic};

        subgraph "AppBar"
            B -- Styling --&gt; B1(Primary Color #0A4F70);
        end

        C -- Is Cart Empty? --&gt; D{Empty State};
        C -- No --&gt; E{Multi-Store Cart};

        subgraph "Empty State"
            D -- Contains --&gt; D1(Column);
            D1 -- Contains --&gt; D2(Icon - outlined shopping_cart);
            D1 -- Contains --> D3(Text - "Your Cart is Empty.");
        end

        subgraph "Multi-Store Cart (ListView)"
            E -- Contains --> F(Store Section - Card);
            F -- Contains --> G(Store Name Header);
            F -- Contains --> H(Items - ListView);
            F -- Contains --> I(Subtotal Text);
            F -- Contains --> J(Proceed to Checkout - ElevatedButton);

            subgraph "Store Card Styling"
                F -- Style --> F1(8px Radius, Soft Shadow, #F5F5F5 Bg);
            end

            subgraph "Cart Item Widget"
              H -- Contains --> H1(Row);
              H1 -- Contains --> H2(Product Image);
              H1 -- Contains --> H3(Column: Name, Qty, Price);
            end

            subgraph "Checkout Button Styling"
                J -- Style --> J1(Primary Color #0A4F70, 8-12px Radius);
            end
        end
    end
```

---

### B. Component Breakdown

#### 1. AppBar: Clear &amp; Controlled Navigation

*   **Color:** The `AppBar` uses the primary Deep Teal/Blue (`#0A4F70`) for consistency and trust.
*   **Leading Action:** A clear back `IconButton` is present to ensure the user feels in control and can easily navigate back to their discovery journey.

#### 2. Body: Conditional Content

The body of the `Scaffold` will display one of two widgets based on the state of the user's cart.

##### a. Empty State

*   **Condition:** Displayed when `Cart.items` is empty.
*   **Layout:** A `Column` with `mainAxisAlignment: MainAxisAlignment.center` to center the content vertically.
*   **Content:**
    *   An `Icon` using the **outlined** `shopping_cart` Material Symbol, with a size of `64.0` and a neutral gray color.
    *   A `SizedBox` with `height: 16.0` for spacing.
    *   A `Text` widget with the string "Your Cart is Empty." using the **Lato** font, styled to be warm and encouraging.

##### b. Multi-Store Cart Display

*   **Condition:** Displayed when `Cart.items` is not empty.
*   **Layout:** A `ListView.builder` that iterates through the cart items, grouped by store.

*   **Store Section `Card`:**
    *   **Component:** For each unique store in the cart, a `Card` widget is created.
    *   **Styling:**
        *   **Shape:** It has a subtle border radius of `8px`.
        *   **Elevation:** It uses a soft shadow to feel tangible and well-crafted.
        *   **Background:** The card's background color is the light gray neutral (`#F5F5F5`) to visually group all items from a single store.
        *   **Margin:** A vertical margin of `8.0` separates the cards from each other.
    *   **Content:** The `Card`'s child is a `Column`.

*   **Store Header:**
    *   **Component:** The first child in the `Column` is a `Padding` widget containing a `Text` widget.
    *   **Content:** Displays the `Store.name`.
    *   **Typography:** Uses the **Lato** font with a bold weight to clearly delineate the section.

*   **Cart Items `ListView`:**
    *   **Component:** A `ListView` displays the items for that specific store.
    *   **Item Widget (`CartItem`):** Each item is a `Padding` widget containing a `Row`.
        *   **Product Image:** A `ClipRRect` with a border radius of `8px` containing an `Image.network` of the `Product.imageUrl`.
        *   **Details `Column`:** A `Column` with `crossAxisAlignment: CrossAxisAlignment.start` containing:
            *   `Text` for `Product.name`.
            *   `Text` for quantity (e.g., "Qty: 2").
            *   `Text` for `Product.price`.
            *   All text uses the **Lato** font.

*   **Store Subtotal &amp; Checkout Button:**
    *   **Layout:** A `Row` at the bottom of the `Card`, below the item list.
    *   **Subtotal:** A `Text` widget displaying the subtotal for that store (e.g., "Subtotal: $55.00").
    *   **Checkout Button:** An `ElevatedButton` with the following properties:
        *   **Text:** "Proceed to Checkout".
        *   **Action:** Initiates the checkout flow *only for the items from that specific store*.
        *   **Styling:**
            *   **Color:** It **must** use the primary Deep Teal/Blue (`#0A4F70`) for a clear, confident call-to-action.
            *   **Shape:** It has the standard `8-12px` border radius.
            *   **Typography:** The button's text uses the **Lato** font.