# Using the shared-i18n Library

This guide explains how to use the `shared-i18n` library for type-safe internationalization in your Angular application.

## 1. Importing Translation Keys and Types

The primary way to interact with the library is through the `T` object and the `TranslationKey` type.

-   `T`: An object where keys are the translation keys (e.g., `GREETING`) and values are the same string literals (e.g., `"GREETING"`). This provides compile-time checking for key existence.
-   `TranslationKey`: A TypeScript type representing the union of all available translation keys (e.g., `"GREETING" | "NAV_HOME"`).

```typescript
import { T, TranslationKey } from '@shared/i18n';
```

## 2. Accessing Translation Messages

To get the actual translated string, you'll need to:

1.  Import the specific language messages object (e.g., `heMessages`, `enMessages`).
2.  Use a key from the `T` object to access the message from the imported language object.

**Example in a Component:**

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { T, TranslationKey, heMessages, enMessages, TranslationSchema } from '@shared/i18n'; // Or your chosen language

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>{{ T.GREETING }}</h2> <!-- Displays the key "GREETING" -->
    <p>Hebrew: {{ heMessages[T.GREETING] }}</p>
    <p>English: {{ enMessages[T.GREETING] }}</p>
    <p>Welcome (HE): {{ welcomeMessageHe }}</p>
    <p>Welcome (EN): {{ welcomeMessageEn }}</p>
  `
})
export class MyComponent {
  public readonly T = T; // Expose T to the template
  public readonly heMessages = heMessages; // Expose chosen language messages
  public readonly enMessages = enMessages;

  public welcomeMessageHe: string;
  public welcomeMessageEn: string;

  constructor() {
    // Example of using a simple key
    const greetingKey: TranslationKey = T.GREETING;
    console.log('Greeting Key:', greetingKey);
    console.log('Hebrew Greeting:', heMessages[greetingKey]);

    // Example of using a key for a function (interpolated message)
    const welcomeKey: TranslationKey = T.WELCOME_USER;
    // Ensure the message is a function before calling
    if (typeof heMessages[welcomeKey] === 'function') {
      this.welcomeMessageHe = (heMessages[welcomeKey] as (userName: string) => string)('משה');
    } else {
      this.welcomeMessageHe = 'Error: WELCOME_USER is not a function in heMessages';
    }

    if (typeof enMessages[welcomeKey] === 'function') {
      this.welcomeMessageEn = (enMessages[welcomeKey] as (userName: string) => string)('Moses');
    } else {
      this.welcomeMessageEn = 'Error: WELCOME_USER is not a function in enMessages';
    }
  }
}
```

## 3. Translation Schema

The `TranslationSchema` type is exported from `./lib/translations/he` (as Hebrew is the base language). It represents the expected structure (keys and their types, including function signatures) that all other language files must adhere to. This ensures consistency across translations.

```typescript
import { TranslationSchema } from '@shared/i18n'; // or from '@shared/i18n/lib/translations/he'

// Example: Defining another language
// projects/shared-i18n/src/lib/translations/fr.ts
// import { TranslationSchema } from './he';
//
// export const frMessages: TranslationSchema = {
//   GREETING: "Bonjour le monde!",
//   NAV_HOME: "Accueil",
//   WELCOME_USER: (userName: string) => `Bienvenue, ${userName}!`
// };
```

## 4. Building the Library

If you make changes to the `shared-i18n` library, you need to rebuild it so that applications consuming it can pick up the changes.

Use the following command from the monorepo root:

```bash
npm run build -- shared-i18n
```

This is preferred over `ng build shared-i18n` to avoid potential terminal environment issues.

## Future Enhancements (Not yet implemented)

-   **Translation Service:** A service will be provided to manage the current language and retrieve translations dynamically.
-   **Translation Pipe:** A pipe will be available for easy use of translations directly in templates.