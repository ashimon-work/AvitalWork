// projects/shared-i18n/src/lib/i18n.service.ts
import { Injectable, signal } from '@angular/core';
import { heMessages, TranslationSchema } from './translations/he'; // Default translations
import { enMessages } from './translations/en'; // English translations
import { TranslationKey } from './i18n.keys';

// Define supported languages explicitly
export type SupportedLanguage = 'he' | 'en';
export const DEFAULT_LANGUAGE: SupportedLanguage = 'he';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  // Using Angular Signals for current language and translations
  private currentLangSignal = signal<SupportedLanguage>(DEFAULT_LANGUAGE);
  private translationsSignal = signal<TranslationSchema>({} as TranslationSchema); // Initialize with empty or minimal

  public currentLang$ = this.currentLangSignal.asReadonly();
  public translations$ = this.translationsSignal.asReadonly();

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    // For now, force Hebrew for the store
    const initialLang = DEFAULT_LANGUAGE;
    this.setLanguage(initialLang, true);
  }

  private isSupportedLanguage(lang: string): lang is SupportedLanguage {
    return lang === 'he' || lang === 'en';
  }

  setLanguage(lang: SupportedLanguage, savePreference: boolean = true): void {
    if (!this.isSupportedLanguage(lang)) {
      console.warn(`Unsupported language: ${lang}. Defaulting to ${DEFAULT_LANGUAGE}.`);
      lang = DEFAULT_LANGUAGE;
    }

    try {
      console.log(`[I18nService] Setting language to: ${lang}`);
      const messages = lang === 'he' ? heMessages : enMessages;
      console.log(`[I18nService] Loaded messages for ${lang}:`, Object.keys(messages).length, 'keys');
      this.translationsSignal.set(messages);
      this.currentLangSignal.set(lang);
      console.log(`[I18nService] Translations and language set for ${lang}`);

      if (savePreference) {
        localStorage.setItem('preferred_lang', lang);
        console.log(`[I18nService] Saved language preference: ${lang}`);
      }
    } catch (error) {
      console.error(`[I18nService] Failed to set language ${lang}. Error:`, error);
      // Fallback
      this.translationsSignal.set(heMessages);
      this.currentLangSignal.set(DEFAULT_LANGUAGE);
      console.log(`[I18nService] Fallback to default language: ${DEFAULT_LANGUAGE}`);
      if (savePreference) {
        localStorage.setItem('preferred_lang', DEFAULT_LANGUAGE);
        console.log(`[I18nService] Saved fallback language preference: ${DEFAULT_LANGUAGE}`);
      }
    }
  }

  translate(key: string, ...args: any[]): string {
    const messageEntry = this.translationsSignal()[key as TranslationKey]; // Access signal's value

    if (typeof messageEntry === 'function') {
      // Call the function with the provided arguments
      // Explicitly cast to a function type that matches the expected signature
      const result = (messageEntry as (...a: any[]) => string)(...args);
      console.log(`[I18nService] Translated ${key} (function) to:`, result);
      return result;
    }
    // If it's not a function, it must be a plain string (as per TranslationSchema)
    // Return the key as fallback if translation is not found (e.g., during initial async load)
    const result = (messageEntry as string) ?? key;
    if (!messageEntry && messageEntry !== '') {
      console.warn(`[I18nService] Missing translation for key: ${key}, returning key`);
    } else {
      console.log(`[I18nService] Translated ${key} to:`, result);
    }
    return result;
  }
}