// projects/shared-i18n/src/lib/i18n.module.ts
import { NgModule } from '@angular/core';
import { TranslatePipe } from './translate.pipe';

@NgModule({
  imports: [TranslatePipe],
  exports: [TranslatePipe],
})
export class SharedI18nModule {}