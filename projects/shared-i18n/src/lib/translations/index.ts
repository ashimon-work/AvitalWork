// projects/shared-i18n/src/lib/translations/index.ts
import * as he from './he';
import * as en from './en';

export const translations: { [key: string]: any } = {
  he,
  en,
};

export function getTranslationModule(lang: string): Promise<any> {
  switch (lang) {
    case 'he':
      return import('./he');
    case 'en':
      return import('./en');
    default:
      // Fallback or error handling
      console.warn(`Unsupported language for dynamic import: ${lang}, falling back to he`);
      return import('./he');
  }
}