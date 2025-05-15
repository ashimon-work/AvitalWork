// projects/shared-i18n/src/lib/translations/en.ts
import { TranslationSchema } from './he';

export const enMessages: TranslationSchema = {
  GREETING: "Hello, World!",
  NAV_HOME: "Home",
  WELCOME_USER: (userName: string) => `Welcome, ${userName}!`
};