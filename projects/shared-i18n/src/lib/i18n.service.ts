// projects/shared-i18n/src/lib/i18n.service.ts
import { Injectable, signal } from '@angular/core';
// import { heMessages, TranslationSchema } from './translations/he'; // Default translations
import { TranslationKey } from './i18n.keys';
import { getTranslationModule } from './translations'; // Import the new barrel function
import { TranslationSchema } from './translations/he'; // Keep for type, but don't use heMessages directly for init

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

  private async initLanguage(): Promise<void> {
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
    
    await this.setLanguage(initialLang, false); // Don't save to localStorage again if it was just read
  }

  private isSupportedLanguage(lang: string): lang is SupportedLanguage {
    return lang === 'he' || lang === 'en';
  }

  async setLanguage(lang: SupportedLanguage, savePreference: boolean = true): Promise<void> {
    if (!this.isSupportedLanguage(lang)) {
      console.warn(`Unsupported language: ${lang}. Defaulting to ${DEFAULT_LANGUAGE}.`);
      lang = DEFAULT_LANGUAGE;
    }

    try {
      console.log(`[I18nService] Attempting to load translations for: ${lang}`);
      console.log(`[I18nService] Using getTranslationModule for: ${lang}`);
      // Use the barrel file's function to get the module
      const module = await getTranslationModule(lang);
      console.log(`[I18nService] Successfully imported module for ${lang}:`, module);
      
      const messages = module[`${lang}Messages` as keyof typeof module] as TranslationSchema;
      if (messages) {
        this.translationsSignal.set(messages);
        this.currentLangSignal.set(lang);
        console.log(`[I18nService] Translations and language set for ${lang}`);
      } else {
        console.error(`[I18nService] '${lang}Messages' not found in the imported module for ${lang}.`);
        throw new Error(`'${lang}Messages' not found in module.`);
      }

      if (savePreference) {
        localStorage.setItem('preferred_lang', lang);
        console.log(`[I18nService] Saved language preference: ${lang}`);
      }
    } catch (error) {
      console.error(`[I18nService] Failed to load translations for ${lang}. Falling back to default. Error:`, error);
      // Fallback to default language messages if loading fails
      // Attempt to load 'he' as a last resort if the intended language fails AND it wasn't 'he' already
      if (lang !== 'he') {
        try {
          console.log('[I18nService] Attempting to load HE as ultimate fallback.');
          const heModule = await getTranslationModule('he');
          this.translationsSignal.set(heModule.heMessages as TranslationSchema);
        } catch (heError) {
          console.error('[I18nService] Failed to load HE as ultimate fallback.', heError);
          this.translationsSignal.set({} as TranslationSchema); // Set to empty if HE also fails
        }
      } else {
        this.translationsSignal.set({} as TranslationSchema); // Set to empty if 'he' itself failed
      }
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
      return (messageEntry as (...a: any[]) => string)(...args);
    }
    // If it's not a function, it must be a plain string (as per TranslationSchema)
    // Return the key as fallback if translation is not found (e.g., during initial async load)
    return (messageEntry as string) ?? key;
  }
}