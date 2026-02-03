export const i18n = {
  en: {
    welcome: `Hi! Welcome to 'Smarty' 🤖. I'm your personal store management assistant from SmartApp. I'm here to help you save valuable time by managing your store directly from WhatsApp.

What can I do?
- Add new products to your site in under a minute.
- Easily update prices and stock levels.
- Show you real-time sales and profitability reports.

Ready to start? Just choose an option below:`,
    mainMenu:
      '1. ➕ Add New Product\n2. 🏪 Manage Store\n3. 📊 Reports & Settings\n4. 🗑️ Delete a Product',
    addProduct_awaitingName:
      "Great, let's add a new product. First, what is the product's name? (e.g., Nike Air Max 90)",
    addProduct_awaitingCategory:
      "Got it. Which category should this product be in? Please send the corresponding number:\n{categoryList}\n\nOr, to add a new category, type 'new' and send.",
    addProduct_awaitingNewCategoryName:
      'Great! What is the name of the new category?',
    addProduct_awaitingPrice:
      "Perfect, assigned to the category. Now for the price. What is the product's price in ILS?",
    addProduct_askVatInclusion:
      'Does this price include VAT?',
    addProduct_priceConfirmed:
      'Got it. The price is {finalPrice} ILS. Now, please provide a short description for the product.',
    addProduct_priceWithVat:
      'Got it. The final price including VAT is {finalPrice} ILS. Now, please provide a short description for the product.',
    addProduct_awaitingDescription:
      'Got it. The final price is {finalPrice} ILS. Now, please provide a short description for the product.',
    addProduct_awaitingColors:
      "Great, description saved. Now for the product options. Let's start with colors.\nWhat colors are available for this model? Please send a list separated by commas (e.g., White, Black, Red).",
    addProduct_awaitingSizes:
      "Understood. Now for the sizes. What sizes are available?\nYou can send:\n• Individual sizes separated by commas (e.g., 41, 42, 43, 44)\n• Or a range with dash (e.g., 20-25) and I'll ask for the step size.",
    addProduct_awaitingStock:
      "Perfect. Now let's define the stock for each combination of color and size.\nLet's start with the color {firstColor}. The sizes you defined are {sizes}.\nPlease send me the stock quantity for these sizes in that exact order, separated by commas.",
    addProduct_awaitingNextStock:
      'Got it ({currentColor}: {stockLevels}).\nNow for the color {nextColor}. What is the stock for sizes {sizes} (in the same format)?',
    addProduct_awaitingSizeStep:
      'Great! You entered a range: {range}.\nWhat step size would you like? For example:\n• "2" will create: 20, 22, 24\n• "3" will create: 20, 23, 26',
    addProduct_askVariations:
      "Does this product have variations (colors, sizes)?\n\n• Yes - I'll ask for colors and sizes\n• No - I'll just ask for stock amount",
    addProduct_awaitingSimpleStock:
      'How many units of this product do you have in stock?',
    yes_button: 'Yes',
    no_button: 'No',
    manageCategories_askCategory:
      'Which category would you like to manage?\n\n{categoryList}',
    manageCategories_askAction:
      'What would you like to do with "{categoryName}"?\n\n1. 📝 Edit a product in this category\n2. ✏️ Edit category name',
    manageCategories_editName: 'What should be the new name for this category?',
    manageCategories_nameUpdated:
      'Category name updated successfully! New name: "{newName}"',
    manageCategories_noProducts: 'This category has no products yet.',
    manageCategories_selectProduct:
      'Which product would you like to edit?\n\n{productList}',
    manageStore_menu:
      'Store Management\n\nWhat would you like to manage?\n\n1. ➕ Add New Category\n2. 📁 Manage Existing Categories\n3. 📝 Manage Products by Category',
    manageStore_addCategory: 'What should be the name of the new category?',
    manageStore_categoryCreated:
      'Category "{categoryName}" created successfully!',
    manageStore_noCategories:
      "You don't have any categories yet. Create your first category!",
    manageStore_selectCategory:
      'Which category would you like to manage?\n\n{categoryList}',
    manageStore_categoryOptions:
      'What would you like to do with "{categoryName}"?\n\n1. ✏️ Edit Category Name\n2. 📝 Edit Products in Category\n3. 🗑️ Delete Category (if empty)',
    manageStore_categoryHasProducts:
      'Cannot delete category "{categoryName}" because it contains products. Remove all products first.',
    manageStore_categoryDeleted:
      'Category "{categoryName}" has been deleted successfully!',
    manageStore_categoryExists:
      'Category "{categoryName}" already exists! Please choose a different name.',
    manageStore_addCategorySuccess:
      'What should be the name of the new category?',
    manageStore_button_addCategory: 'Add New Category',
    manageStore_button_existingCategories: 'Manage Existing Categories',
    manageStore_button_productsByCategory: 'Manage Products by Category',
    manageCategories_button_editProduct: 'Edit a product in this category',
    manageCategories_button_editName: 'Edit category name',
    manageStore_button_editName: 'Edit Category Name',
    manageCategories_editNamePrompt: "Please enter a new name for this category",
    error_invalidCategoryName: "Invalid name. Please enter a valid category name.",
    manageStore_button_editProducts: 'Edit Products in Category',
    manageStore_button_deleteCategory: 'Delete Category (if empty)',
    reportsAndSettings_menu:
      'Reports & Settings\n\nWhat would you like to do?\n\n1. 📊 View Store Reports\n2. ⚙️ App Settings',
    reportsAndSettings_button_reports: 'View Store Reports',
    reportsAndSettings_button_settings: 'App Settings',
    manageCategories_button_askCategory:
      'Which category would you like to manage?',
    manageStore_button_selectCategory:
      'Which category would you like to manage?',
    addProduct_awaitingImages:
      "Excellent, stock is updated. We're almost done!\nThe final step: Images 📸. Please send me the product images now. You can send multiple photos. When you're finished, just type 'done'.",
    addProduct_awaitingConfirmation:
      '{summary}\n\nIs everything correct and ready to be published?\n1. ✅ Yes, Publish\n2. ✏️ No, I need to fix something',
    addProduct_publishSuccess:
      "Perfect! The product is now live in your store! 🎉\nGood luck with the sales!\n\nWhat's next?",
    addProduct_fixChoice: `No problem. What would you like to fix? Please select the number:
1. Name or Category
2. Price
3. Description
4. Colors or Sizes
5. Stock
6. Images (Add/Remove)`,
    edit_name: "Let's fix the name. What is the correct product name?",
    edit_price:
      "Let's fix the price. What is the correct base price (before VAT)?",
    edit_description:
      "Let's fix the description. What is the correct description?",
    edit_colors:
      "Let's fix the colors. What are the correct colors, separated by commas?",
    edit_stock:
      "Let's fix the stock. Starting with {firstColor}, what is the stock for sizes {sizes}?",
    edit_stock_simple: "Let's fix the stock. What is the new stock quantity?",
    edit_next_stock:
      'Got it. Now for the color {nextColor}. What is the stock for sizes {sizes} (in the same format)?',
    edit_images:
      "Let's fix the images. Please send the new images. Type 'done' when finished.",
    editCategory_success: "Success! Category renamed to '{newName}'.",
     editCategory_nameExistsError: "A category with that name already exists. Please choose another.",
    invalid_input:
      "Sorry, I didn't understand that. Please choose a number from the menu.",
    unauthorized: 'Sorry, you are not authorized to use this bot.',
    manager_welcome:
      'Welcome, Manager! Please select a store to manage:\n{storeList}',
    manager_store_selected: `You are now managing the store. What would you like to do?
1. ➕ Add New Product
2. 📝 Manage Existing Product
3. 📊 View Reports
4. 🗑️ Delete a Product`,
    invalid_store: "Sorry, that's not a valid store number. Please try again.",
    language_selection: 'Please select your preferred language:',
    language_updated: 'Language updated successfully.',
    switch_language: 'Switch Language',
    add_another_product: 'Add Another Product',
    main_menu_button: 'Back to Main Menu',
    publish_button: 'Yes, Publish',
    edit_button: 'No, I need to edit',
    reset_message: 'Conversation has been reset.',
    reset_button: 'Reset',
    summary_product: 'Product',
    summary_category: 'Category',
    summary_price: 'Price',
    summary_description: 'Description',
    summary_variations_stock: 'Variations & Stock',
    summary_color: 'Color',
    summary_size: 'Size',
    summary_stock: 'Stock',
    summary_vat_included: '(incl. VAT)',
    summary_missing_variants_note: '⚠️ *Note:* This product is missing color and size information.',
    no_products_to_manage: 'There are no products in the store to manage.',
    add_new_product: 'Add New Product',
    select_product_to_manage:
      'Please select a product to manage:\n{productList}',
    product_unchanged: 'Product information remains unchanged.',
    product_updated: 'Product has been successfully updated!',
    settingsMenu: 'Settings',
    product_missing_variants:
      "This product is missing color and size information. Let's add it now.",
    store_details_title: 'Store Details',
    store_details_name: 'Name',
    store_details_description: 'Description',
    store_details_products: 'Products',
    store_details_categories: 'Categories',
    store_details_sales: 'Total Sales',
    store_details_revenue: 'Total Revenue',
    back_to_main_menu: 'Back to Main Menu',
    no_color_default: 'No Color',
    standard_size_default: 'Standard',
    no_categories_found: "No categories found in your store.",
    deleteProduct_selectCategory: "Please choose a category to delete a product from:\n{list}",
    no_products_in_category: "No products were found in this category.",
    deleteProduct_selectProduct: "Please select the product you want to delete:\n{list}",
    deleteProduct_confirm: "Are you sure you want to delete the product \"{productName}\"?",
    deleteProduct_success: "The product was successfully deleted ✅",
    deleteProduct_cancelled: "Product deletion was cancelled ❌",

  },
  he: {
    welcome: `היי! ברוכים הבאים ל'סמארטי' 🤖. אני עוזר ניהול החנות האישי שלכם מבית SmartApp. אני כאן כדי לעזור לכם לחסוך זמן יקר על ידי ניהול החנות שלכם ישירות מהווטסאפ.

מה אני יכול לעשות?
- להוסיף מוצרים חדשים לאתר שלכם בפחות מדקה.
- לעדכן בקלות מחירים ומלאי.
- להציג לכם דוחות מכירה ורווחיות בזמן אמת.

מוכנים להתחיל? פשוט בחרו אפשרות למטה:`,
    mainMenu: '1. ➕ הוספת מוצר חדש\n2. 🏪 ניהול חנות\n3. 📊 דוחות והגדרות\n4. מחק מוצר 🗑️ ',
    addProduct_awaitingName:
      'מעולה, בואו נוסיף מוצר חדש. ראשית, מה שם המוצר? (לדוגמה, נייקי אייר מקס 90)',
    addProduct_awaitingCategory:
      "הבנתי. לאיזו קטגוריה המוצר צריך להשתייך? אנא שלחו את המספר המתאים:\n{categoryList}\n\nאו, כדי להוסיף קטגוריה חדשה, הקלידו 'חדש' ושלחו.",
    addProduct_awaitingNewCategoryName: 'מעולה! מה שם הקטגוריה החדשה?',
    addProduct_awaitingPrice:
      'מושלם, שויך לקטגורית {categoryName}. עכשיו למחיר. מה מחיר המוצר בשקלים?',
    addProduct_askVatInclusion:
      'האם המחיר הזה כולל מע"מ?',
    addProduct_priceConfirmed:
      'הבנתי. המחיר הוא {finalPrice} שקלים. עכשיו, אנא ספקו תיאור קצר למוצר.',
    addProduct_priceWithVat:
      'הבנתי. המחיר הסופי כולל מע"מ הוא {finalPrice} שקלים. עכשיו, אנא ספקו תיאור קצר למוצר.',
    addProduct_awaitingDescription:
      'הבנתי. המחיר הסופי הוא {finalPrice} ש"ח. עכשיו, אנא ספקו תיאור קצר למוצר.',
    addProduct_awaitingColors:
      'מעולה, התיאור נשמר. עכשיו לאפשרויות המוצר. נתחיל עם צבעים.\nאילו צבעים זמינים לדגם זה? אנא שלחו רשימה מופרדת בפסיקים (למשל, לבן, שחור, אדום).',
    addProduct_awaitingSizes:
      'הבנתי. עכשיו למידות. אילו מידות זמינות?\nניתן לשלוח:\n• מידות בודדות מופרדות בפסיקים (למשל, 41, 42, 43, 44)\n• או טווח עם מקף (למשל, 20-25) ואני אשאל לגודל הצעד.',
    addProduct_awaitingStock:
      'מושלם. עכשיו נגדיר את המלאי לכל שילוב של צבע ומידה.\nנתחיל עם הצבע {firstColor}. המידות שהגדרתם הן {sizes}.\nאנא שלחו לי את כמות המלאי למידות אלו בסדר המדויק הזה, מופרדת בפסיקים.',
    addProduct_awaitingNextStock:
      'הבנתי ({currentColor}: {stockLevels}).\nעכשיו לצבע {nextColor}. מה המלאי למידות {sizes} (באותו פורמט)?',
    addProduct_awaitingSizeStep:
      'מעולה! הזנת טווח: {range}.\nאיזה גודל צעד תרצה? לדוגמה:\n• "2" ייצור: 20, 22, 24\n• "3" ייצור: 20, 23, 26',
    addProduct_askVariations:
      'האם למוצר זה יש וריאציות (צבעים, מידות)?\n\n• כן - אשאל לגבי צבעים ומידות\n• לא - אשאל רק לגבי כמות במלאי',
    addProduct_awaitingSimpleStock: 'כמה יחידות מהמוצר יש לך במלאי?',
    yes_button: 'כן',
    no_button: 'לא',
    manageCategories_askCategory: 'איזו קטגוריה תרצה לנהל?\n\n{categoryList}',
    manageCategories_askAction:
      'מה תרצה לעשות עם "{categoryName}"?\n\n1. 📝 עריכת מוצר בקטגוריה זו\n2. ✏️ עריכת שם הקטגוריה',
    manageCategories_editName: 'מה צריך להיות השם החדש של הקטגוריה?',
    manageCategories_noProducts: 'לקטגוריה זו אין עדיין מוצרים.',
    manageCategories_selectProduct: 'איזה מוצר תרצה לערוך?\n\n{productList}',
    manageStore_menu:
      'ניהול חנות\n\nמה תרצה לנהל?\n\n1. ➕ הוספת קטגוריה חדשה\n2. 📁 ניהול קטגוריות קיימות\n3. 📝 ניהול מוצרים לפי קטגוריה',
    manageStore_addCategory: 'מה צריך להיות שם הקטגוריה החדשה?',
    manageStore_categoryCreated: 'הקטגוריה "{categoryName}" נוצרה בהצלחה!',
    manageStore_noCategories:
      'אין לך עדיין קטגוריות. צור את הקטגוריה הראשונה שלך!',
    manageStore_selectCategory: 'איזו קטגוריה תרצה לנהל?\n\n{categoryList}',
    manageStore_categoryOptions:
      'מה תרצה לעשות עם "{categoryName}"?\n\n1. ✏️ עריכת שם הקטגוריה\n2. 📝 עריכת מוצרים בקטגוריה\n3. 🗑️ מחיקת הקטגוריה (אם ריקה)',
    manageStore_categoryHasProducts:
      'לא ניתן למחוק את הקטגוריה "{categoryName}" כי היא מכילה מוצרים. הסר את כל המוצרים תחילה.',
    manageStore_categoryDeleted: 'הקטגוריה "{categoryName}" נמחקה בהצלחה!',
    manageStore_categoryExists:
      'הקטגוריה "{categoryName}" כבר קיימת! אנא בחר שם אחר.',
    manageStore_addCategorySuccess: 'מה צריך להיות שם הקטגוריה החדשה?',
    manageStore_button_addCategory: 'הוסף קטגוריה',
    manageStore_button_existingCategories: 'ניהול קטגוריות',
    manageStore_button_productsByCategory: 'מוצרים לפי קטגוריה',
    manageCategories_button_editProduct: 'עריכת מוצר בקטגוריה',
    manageCategories_button_editName: 'עריכת שם הקטגוריה',
    
    manageCategories_editNamePrompt: "הקלד שם חדש לקטגוריה",
    manageCategories_nameUpdated: "שם הקטגוריה עודכן בהצלחה ל־{{newName}}",
    error_invalidCategoryName: "שם קטגוריה לא תקין. נסה שוב.",
    manageStore_button_editName: 'עריכת שם הקטגוריה',
    manageStore_button_editProducts: 'עריכת מוצרים בקטגוריה',
    manageStore_button_deleteCategory: 'מחק קטגוריה',
    reportsAndSettings_menu:
      'דוחות והגדרות\n\nמה תרצה לעשות?\n\n1. 📊 צפייה בדוחות החנות\n2. ⚙️ הגדרות האפליקציה',
    reportsAndSettings_button_reports: 'צפייה בדוחות',
    reportsAndSettings_button_settings: 'הגדרות אפליקציה',
    manageCategories_button_askCategory: 'בחר קטגוריה',
    manageStore_button_selectCategory: 'בחר קטגוריה',
    addProduct_awaitingImages:
      "מצוין, המלאי עודכן. אנחנו כמעט מסיימים!\nהשלב האחרון: תמונות 📸. אנא שלחו לי עכשיו את תמונות המוצר. ניתן לשלוח מספר תמונות. כשתסיימו, פשוט הקלידו 'סיום'.",
    addProduct_awaitingConfirmation:
      '{summary}\n\nהאם הכל נכון ומוכן לפרסום?\n1. ✅ כן, פרסם\n2. ✏️ לא, אני צריך לתקן משהו',
    addProduct_publishSuccess:
      'מושלם! המוצר עלה לאוויר בחנות שלכם! 🎉\nבהצלחה עם המכירות!\n\nמה השלב הבא?',
    addProduct_fixChoice: `אין בעיה. מה תרצו לתקן? אנא בחרו את המספר:
1. שם או קטגוריה
2. מחיר
3. תיאור
4. צבעים או מידות
5. מלאי
6. תמונות (הוספה/הסרה)`,
    edit_name: 'בואו נתקן את השם. מהו שם המוצר הנכון?',
    edit_price: 'בואו נתקן את המחיר. מהו המחיר הבסיסי הנכון (לפני מע"מ)?',
    edit_description: 'בואו נתקן את התיאור. מהו התיאור הנכון?',
    edit_colors: 'בואו נתקן את הצבעים. מהם הצבעים הנכונים, מופרדים בפסיקים?',
    edit_stock:
      'בואו נתקן את המלאי. נתחיל עם {firstColor}, מה המלאי למידות {sizes}?',
    edit_stock_simple: 'בואו נתקן את המלאי. מה הכמות החדשה במלאי?',
    edit_next_stock:
      'הבנתי. עכשיו לצבע {nextColor}. מה המלאי למידות {sizes} (באותו פורמט)?',
    edit_images:
      "בואו נתקן את התמונות. אנא שלחו את התמונות החדשות. הקלידו 'סיום' כשתסיימו.",
    editCategory_nameExistsError: "קטגוריה בשם זה כבר קיימת. אנא בחר אחרת.",
    invalid_input: 'מצטער, לא הבנתי. אנא בחרו מספר מהתפריט.',
    unauthorized: 'מצטער, אינך מורשה להשתמש בבוט זה.',
    manager_welcome: 'ברוך הבא, מנהל! אנא בחר חנות לניהול:\n{storeList}',
    manager_store_selected: `כעת אתה מנהל את החנות. מה תרצה לעשות?
1. ➕ הוספת מוצר חדש
2. 📝 ניהול מוצר קיים
3. 📊 צפייה בדוחות
4. 🗑️ מחק מוצר`,
    invalid_store: 'מצטער, זהו מספר חנות לא חוקי. אנא נסה שוב.',
    language_selection: 'אנא בחר את השפה המועדפת עליך:',
    language_updated: 'השפה עודכנה בהצלחה.',
    switch_language: 'החלף שפה',
    add_another_product: 'הוסף מוצר נוסף',
    main_menu_button: 'חזרה לתפריט הראשי',
    publish_button: 'כן, פרסם',
    edit_button: 'לא, אני צריך לערוך',
    reset_message: 'השיחה אופסה.',
    reset_button: 'איפוס',
    summary_product: 'מוצר',
    summary_category: 'קטגוריה',
    summary_price: 'מחיר',
    summary_description: 'תיאור',
    summary_variations_stock: 'וריאציות ומלאי',
    summary_color: 'צבע',
    summary_size: 'מידה',
    summary_stock: 'מלאי',
    summary_vat_included: '(כולל מע"מ)',
    summary_missing_variants_note: '⚠️ *הערה:* המוצר חסר מידע על צבע ומידה.',
    no_products_to_manage: 'אין מוצרים בחנות לניהול.',
    add_new_product: 'הוסף מוצר חדש',
    select_product_to_manage: 'אנא בחר מוצר לניהול:\n{productList}',
    product_unchanged: 'פרטי המוצר נשארו ללא שינוי.',
    product_updated: 'המוצר עודכן בהצלחה!',
    settingsMenu: 'הגדרות',
    product_missing_variants:
      'למוצר זה חסר מידע על צבע ומידה. בואו נוסיף אותו עכשיו.',
    store_details_title: 'פרטי החנות',
    store_details_name: 'שם',
    store_details_description: 'תיאור',
    store_details_products: 'מוצרים',
    store_details_categories: 'קטגוריות',
    store_details_sales: 'סה"כ מכירות',
    store_details_revenue: 'סה"כ הכנסות',
    back_to_main_menu: 'חזרה לתפריט הראשי',
    no_color_default: 'ללא צבע',
    standard_size_default: 'סטנדרטית',
    no_categories_found: "לא נמצאו קטגוריות בחנות שלך.",
    deleteProduct_selectCategory: "אנא בחר קטגוריה שממנה תרצה למחוק מוצר:\n{list}",
    no_products_in_category: "לא נמצאו מוצרים בקטגוריה זו.",
    deleteProduct_selectProduct: "אנא בחר את המוצר שברצונך למחוק:\n{list}",
    deleteProduct_confirm: "האם אתה בטוח שברצונך למחוק את המוצר \"{productName}\"?",
    deleteProduct_success: "המוצר נמחק בהצלחה ✅",
    deleteProduct_cancelled: "המחיקה בוטלה ❌",
  },
};
