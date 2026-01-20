// projects/shared-i18n/src/lib/i18n.keys.ts
import { heMessages, TranslationSchema } from './translations/he';

export type TranslationKey = keyof TranslationSchema;

const keysArray = Object.keys(heMessages) as Array<TranslationKey>;

export const T = Object.fromEntries(
  keysArray.map(key => [key, key])
) as { [K in TranslationKey]: K };