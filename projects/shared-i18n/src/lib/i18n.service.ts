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
    // 1. Check localStorage for a saved language preference
    let preferredLang = localStorage.getItem('preferred_lang') as SupportedLanguage | null;

    // 2. If not found, check browser's navigator.language
    if (!preferredLang) {
      const browserLang = navigator.language.split('-')[0] as SupportedLanguage; // e.g., "en-US" -> "en"
      if (this.isSupportedLanguage(browserLang)) {
        preferredLang = browserLang;
      }
    }

    // 3. Fallback to default language if no preference or unsupported browser lang
    const initialLang = preferredLang && this.isSupportedLanguage(preferredLang) ? preferredLang : DEFAULT_LANGUAGE;

    this.setLanguage(initialLang, false); // Don't save to localStorage again if it was just read
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

  translate<K extends TranslationKey>(
    key: K,
    // Type for args: if the message is a function, use its parameters, otherwise, it's an empty array.
    ...args: TranslationSchema[K] extends (...a: any[]) => string ? Parameters<TranslationSchema[K]> : []
  ): string {
    const messageEntry = this.translationsSignal()[key]; // Access signal's value

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