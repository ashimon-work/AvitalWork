// projects/shared-i18n/src/lib/i18n.keys.ts
import { heMessages, TranslationSchema } from './translations/he';

const keysArray = Object.keys(heMessages) as Array<keyof TranslationSchema>;

export const T = Object.fromEntries(
  keysArray.map(key => [key, key])
) as { [K in keyof TranslationSchema]: K };

export type TranslationKey = keyof TranslationSchema;