# Context Spreading Pattern in State Machine

## Rule of Thumb

**Spread context when you ADD or UPDATE context properties needed by future states.**
**Don't spread context when you ONLY change the currentState.**

## Pattern 1: Only State Change (No Context Spread)

```typescript
// ✅ CORRECT: Only changing state, no context updates needed
return { ...state, currentState: 'manageStore_main' };
```

**When to use:**
- Simple navigation without storing data
- Going back to a menu
- Error recovery where context doesn't need updates

**Examples from code:**
- Line 1542: `return { ...state, currentState: 'manageStore_main' };` - Navigation only
- Line 1609: `return { ...state, currentState: 'manageStore_main' };` - Navigation only
- Line 1723: `return { ...state, currentState: 'manageStore_main' };` - Navigation only

## Pattern 2: State Change + Context Update (Manual Spread)

```typescript
// ✅ CORRECT: Updating context with new data needed by next state
return {
  ...state,
  currentState: 'manageCategories_selectProduct',
  context: { ...context, categoryProducts: products.map((p) => p.id) },
};
```

**When to use:**
- Adding new context properties (e.g., `categoryProducts`, `selectedCategoryId`)
- Updating existing context properties (e.g., `categories` array)
- Storing data from user input or database queries

**Examples from code:**
- Line 1488: `context: { ...context, categories: categories.map((c) => c.id) }` - Storing category IDs
- Line 1558: `context: { ...context, categoryProducts: products.map((p) => p.id) }` - Storing product IDs
- Line 1587-1591: Adding `selectedCategoryId` and `selectedCategoryName`
- Line 1625: Updating `categories` array

## Pattern 3: Using createStateTransition Helper

```typescript
// ✅ CORRECT: Helper automatically spreads context
return createStateTransition(state, 'mainMenu', { someProperty: value });
```

**When to use:**
- When you want cleaner code
- The helper automatically does: `context: { ...state.context, ...contextUpdates }`

**Examples from code:**
- Line 2181: `return createStateTransition(state, 'mainMenu');` - No context updates
- Line 823: `return createStateTransition(state, 'addProduct_awaitingPrice', { categoryId, categoryName });` - With context updates

## Common Mistakes

### ❌ WRONG: Forgetting to spread when updating context
```typescript
// This OVERWRITES the entire context, losing all previous properties!
return {
  ...state,
  currentState: 'nextState',
  context: { categoryProducts: products.map((p) => p.id) }, // ❌ Missing ...context
};
```

### ✅ CORRECT: Always spread existing context when updating
```typescript
return {
  ...state,
  currentState: 'nextState',
  context: { ...context, categoryProducts: products.map((p) => p.id) }, // ✅ Preserves existing context
};
```

## Decision Tree

```
Do you need to ADD or UPDATE context properties?
├─ YES → Spread context: `context: { ...context, newProperty: value }`
└─ NO  → Don't spread: `{ ...state, currentState: 'nextState' }`
```

## Real Examples from handleManageStoreSelectCategory

### Example 1: No Context Spread (Line 1542)
```typescript
// User selects category but category has no products
// Only need to navigate back, no data to store
return { ...state, currentState: 'manageStore_main' };
```

### Example 2: Context Spread Needed (Line 1558)
```typescript
// User selects category with products
// Need to store product IDs for next state to use
return {
  ...state,
  currentState: 'manageCategories_selectProduct',
  context: { ...context, categoryProducts: products.map((p) => p.id) }, // ✅ Store product IDs
};
```

### Example 3: Context Spread Needed (Line 1587-1591)
```typescript
// User selects a category for management
// Need to store selected category info for later use
return {
  ...state,
  currentState: 'manageStore_categoryOptions',
  context: {
    ...context, // ✅ Preserve existing context
    selectedCategoryId: categoryId, // ✅ Add new property
    selectedCategoryName: category.name, // ✅ Add new property
  },
};
```

### Example 4: Context Spread Needed (Line 1488, 1513, 1625)
```typescript
// Need to store fresh category list for selection
// Updating the categories array in context
return {
  ...state,
  currentState: 'manageStore_selectCategory',
  context: { ...context, categories: categories.map((c) => c.id) }, // ✅ Update categories array
};
```













