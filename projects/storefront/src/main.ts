import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import he from '@angular/common/locales/he';

registerLocaleData(he);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
