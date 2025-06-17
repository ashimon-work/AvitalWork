// projects/shared-i18n/src/public-api.ts
/*
 * Public API Surface of shared-i18n
 */

export * from './lib/i18n.keys';
export * from './lib/translations/he'; // Keep default export for schema, but barrel handles modules
export * from './lib/translations'; // Export the new barrel file
export * from './lib/i18n.service';
export * from './lib/translate.pipe';
export * from './lib/i18n.module';