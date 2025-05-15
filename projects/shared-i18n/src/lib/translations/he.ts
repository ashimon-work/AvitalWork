// projects/shared-i18n/src/lib/translations/he.ts
export const heMessages = {
  GREETING: "שלום, עולם!",
  NAV_HOME: "בית",
  // Add a sample key for interpolation
  WELCOME_USER: (userName: string) => `ברוך הבא, ${userName}!`
};

// This type represents the structure all other language files must adhere to.
export type TranslationSchema = typeof heMessages;