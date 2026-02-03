// projects/shared-i18n/src/lib/translate.pipe.ts
import { Pipe, PipeTransform, ChangeDetectorRef, inject, effect, untracked } from '@angular/core';
import { I18nService, SupportedLanguage } from './i18n.service';
import { TranslationKey } from './i18n.keys';
import { TranslationSchema } from './translations/he';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Set to false because it depends on the service's state (current language)
               // and needs to re-evaluate when the language changes.
})
export class TranslatePipe implements PipeTransform {
  private i18nService = inject(I18nService);
  private cdr = inject(ChangeDetectorRef);

  private lastKey: string | undefined;
  private lastArgs: any[] = [];
  private lastValue: string = '';

  constructor() {
    // Effect to react to language or translation changes
    effect(() => {
      // Re-evaluate currentLang$ and translations$ when they change
      this.i18nService.currentLang$(); 
      this.i18nService.translations$();

      // Mark for check if the key was previously transformed
      // This ensures the pipe re-runs if the language changed.
      // untracked is used to prevent this effect from re-running if lastKey/lastArgs change here.
      untracked(() => {
        if (this.lastKey) {
          this.cdr.markForCheck();
        }
      });
    });
  }

  transform(key: string, ...args: any[]): string {
    // Store the key and args for re-evaluation if language changes
    this.lastKey = key;
    this.lastArgs = args;
    
    this.lastValue = this.i18nService.translate(key, ...args);
    return this.lastValue;
  }
}