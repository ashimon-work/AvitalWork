import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, switchMap, takeUntil, tap, catchError, of, filter } from 'rxjs';
import { SettingsService } from '../settings.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { NotificationService } from '../../core/services/notification.service';
import { T, TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, JsonPipe, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss'
})
export class SettingsPageComponent implements OnInit, OnDestroy {
  public tKeys = T;
  settings: any | null = null;
  editableSettings: any | null = null;
  isLoading = false;
  isSaving = false;
  isResetting = false;
  error: any | null = null;
  currentCategory: string | null = null;
  private storeSlug: string | null = null;
  testEmailRecipient: string = '';
  isTestingEmail = false;
  testPaymentAmount: number | null = null;
  testPaymentCurrency: string = '';
  isTestingPayment = false;
  isDownloadingBackup = false;
  selectedBackupFile: File | null = null;
  isRestoringBackup = false;
  settingCategories: string[] = [
    'general',
    'shipping',
    'payments',
    'taxes',
    'notifications',
    'users-permissions',
    'appearance',
    'integrations'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private settingsService: SettingsService,
    public storeContextService: StoreContextService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.storeContextService.currentStoreSlug$.pipe(
      filter(storeSlug => storeSlug !== null),
      switchMap(storeSlug => {
        this.storeSlug = storeSlug; // Store storeSlug
        return this.route.paramMap.pipe(
          tap(params => {
            this.currentCategory = params.get('category');
            this.settings = null;
            this.error = null;
            this.isLoading = true;
          }),
          switchMap(params => {
            const category = params.get('category');
            if (category && storeSlug) {
              return this.settingsService.getManagerSettingsByCategory(storeSlug, category).pipe(
                catchError(err => {
                  this.error = err;
                  this.isLoading = false;
                  // Assume a notification service exists and is injected elsewhere or available globally
                  // notificationService.showError('Failed to load settings.');
                  return of(null);
                })
              );
            } else {
              this.isLoading = false;
              return of(null);
            }
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(settings => {
      this.settings = settings;
      this.editableSettings = this.deepCopy(settings);
      this.isLoading = false;
    });

    // Redirect to 'general' if no category is provided in the route, once storeSlug is available
    this.storeContextService.currentStoreSlug$.pipe(
      filter(storeSlug => storeSlug !== null),
      takeUntil(this.destroy$)
    ).subscribe(storeSlug => {
      if (!this.route.snapshot.paramMap.has('category') && storeSlug) {
        this.router.navigate(['/manager', storeSlug, 'settings', 'general']);
      }
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Simple deep copy function (can be replaced with a utility library like lodash)
  private deepCopy(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      const copy: any[] = [];
      for (let i = 0; i < obj.length; i++) {
        copy[i] = this.deepCopy(obj[i]);
      }
      return copy;
    }

    const copy: { [key: string]: any } = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = this.deepCopy(obj[key]);
      }
    }
    return copy;
  }

  saveChanges(): void {
    if (!this.storeSlug || !this.currentCategory || !this.editableSettings) {
      // Optionally show an error notification if context is missing
      // notificationService.showError('Cannot save changes: Missing store context or category.');
      return;
    }

    this.isSaving = true;
    this.settingsService.updateManagerSettingsByCategory(
      this.storeSlug,
      this.currentCategory,
      this.editableSettings
    ).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        // Assume a notification service exists
        // notificationService.showSuccess('Settings saved successfully!');
        console.log('Settings saved successfully!'); // Placeholder
        this.isSaving = false;
        // Optionally refetch settings to ensure UI is in sync
        // This would involve re-triggering the settings loading logic,
        // perhaps by navigating to the same route or calling a dedicated load method.
        // For simplicity, we'll just log for now.
        // this.loadSettings(this.storeSlug, this.currentCategory);
      }),
      catchError(err => {
        this.error = err;
        this.isSaving = false;
        // Assume a notification service exists
        // notificationService.showError('Failed to save settings.');
        console.error('Failed to save settings:', err); // Placeholder
        return of(null); // Continue the stream
      })
    ).subscribe();
  }

  resetToDefaults(): void {
    if (!this.storeSlug || !this.currentCategory) {
      this.notificationService.showError('Cannot reset settings: Missing store context or category.');
      return;
    }

    this.isResetting = true;
    this.settingsService.resetManagerSettingsByCategory(this.storeSlug, this.currentCategory)
      .pipe(
        takeUntil(this.destroy$),
        tap(response => {
          this.notificationService.showSuccess(`${this.formatCategoryName(this.currentCategory!)} settings reset to defaults.`);
          this.isResetting = false;
          // Reload settings after reset
          if (response && response.settings) {
            this.settings = response.settings;
            this.editableSettings = this.deepCopy(response.settings);
          } else {
            // Fallback to full reload if settings not in response
            this.loadSettings(this.storeSlug!, this.currentCategory!);
          }
        }),
        catchError(err => {
          this.error = err;
          this.isResetting = false;
          this.notificationService.showError(`Failed to reset ${this.formatCategoryName(this.currentCategory!)} settings.`);
          console.error(`Failed to reset ${this.formatCategoryName(this.currentCategory!)} settings:`, err);
          return of(null);
        })
      )
      .subscribe();
  }

  testEmailConfiguration(): void {
    if (!this.storeSlug || !this.testEmailRecipient) {
      this.notificationService.showError('Please enter a recipient email address.');
      return;
    }

    this.isTestingEmail = true;
    this.settingsService.testManagerEmailConfiguration(this.storeSlug, this.testEmailRecipient)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.notificationService.showSuccess('Test email sent successfully!');
          this.isTestingEmail = false;
        }),
        catchError(err => {
          this.notificationService.showError('Failed to send test email.');
          console.error('Failed to send test email:', err);
          this.isTestingEmail = false;
          return of(null);
        })
      )
      .subscribe();
  }

  testPaymentConfiguration(): void {
    if (!this.storeSlug || this.testPaymentAmount === null || this.testPaymentCurrency === '') {
      this.notificationService.showError('Please enter a test amount and currency.');
      return;
    }

    this.isTestingPayment = true;
    this.settingsService.testManagerPaymentConfiguration(this.storeSlug, this.testPaymentAmount, this.testPaymentCurrency)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.notificationService.showSuccess('Test payment initiated successfully!');
          this.isTestingPayment = false;
        }),
        catchError(err => {
          this.notificationService.showError('Failed to initiate test payment.');
          console.error('Failed to initiate test payment:', err);
          this.isTestingPayment = false;
          return of(null);
        })
      )
      .subscribe();
  }

  formatCategoryName(category: string): string {
    if (!category) {
      return '';
    }
    // This will now return the translation key for the formatted name,
    // assuming the formatted name itself is not directly a key.
    // For direct key mapping, see getCategoryTranslationKey.
    // This function is still used if you need the display string BEFORE translation.
    return category.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  getCategoryTranslationKey(categorySlug: string | null): keyof typeof T {
    if (!categorySlug) {
      // Return a default or placeholder key if categorySlug is null
      return 'SM_SETTINGS_PAGE_TITLE'; // Or handle as an error/empty string appropriately
    }
    switch (categorySlug) {
      case 'general': return 'SM_SETTINGS_CATEGORY_GENERAL';
      case 'shipping': return 'SM_SETTINGS_CATEGORY_SHIPPING';
      case 'payments': return 'SM_SETTINGS_CATEGORY_PAYMENTS';
      case 'taxes': return 'SM_SETTINGS_CATEGORY_TAXES';
      case 'notifications': return 'SM_SETTINGS_CATEGORY_NOTIFICATIONS';
      case 'users-permissions': return 'SM_SETTINGS_CATEGORY_USERS_PERMISSIONS';
      case 'appearance': return 'SM_SETTINGS_CATEGORY_APPEARANCE';
      case 'integrations': return 'SM_SETTINGS_CATEGORY_INTEGRATIONS';
      default:
        // Fallback for unknown categories, or throw an error
        // For now, returning a generic title key as a fallback.
        // Consider logging an error here if an unknown category is encountered.
        console.warn(`Unknown settings category slug: ${categorySlug}`);
        return 'SM_SETTINGS_PAGE_TITLE'; // Placeholder
    }
  }

  downloadBackup(): void {
    if (!this.storeSlug) {
      this.notificationService.showError('Cannot download backup: Missing store context.');
      return;
    }

    this.isDownloadingBackup = true;
    this.settingsService.downloadManagerSettingsBackup(this.storeSlug)
      .pipe(
        takeUntil(this.destroy$),
        tap(response => {
          const contentDisposition = response.headers.get('content-disposition');
          let filename = 'settings_backup.json'; // Default filename
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1];
            }
          }

          const blob = new Blob([response.body as BlobPart], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          this.notificationService.showSuccess('Settings backup downloaded successfully!');
          this.isDownloadingBackup = false;
        }),
        catchError(err => {
          this.notificationService.showError('Failed to download settings backup.');
          console.error('Failed to download settings backup:', err);
          this.isDownloadingBackup = false;
          return of(null);
        })
      )
      .subscribe();
  }

  onBackupFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedBackupFile = element.files[0];
      this.notificationService.showSuccess(`File selected: ${this.selectedBackupFile.name}`);
    } else {
      this.selectedBackupFile = null;
      this.notificationService.showInfo('No file selected.');
    }
  }

  restoreBackup(): void {
    if (!this.storeSlug) {
      this.notificationService.showError('Cannot restore backup: Missing store context.');
      return;
    }

    if (!this.selectedBackupFile) {
      this.notificationService.showInfo('Please select a backup file first.');
      return;
    }

    this.isRestoringBackup = true;
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target?.result as string);
        this.settingsService.restoreManagerSettings(this.storeSlug!, backupData)
          .pipe(
            takeUntil(this.destroy$),
            tap(() => {
              this.notificationService.showSuccess('Settings restored successfully!');
              this.isRestoringBackup = false;
              this.selectedBackupFile = null; // Clear selected file
              // Optionally refetch settings for the current category
              if (this.storeSlug && this.currentCategory) {
                 this.loadSettings(this.storeSlug, this.currentCategory);
              }
            }),
            catchError(err => {
              this.notificationService.showError('Failed to restore settings.');
              console.error('Failed to restore settings:', err);
              this.isRestoringBackup = false;
              return of(null);
            })
          )
          .subscribe();
      } catch (error) {
        this.notificationService.showError('Failed to parse backup file. Please ensure it is a valid JSON file.');
        console.error('Failed to parse backup file:', error);
        this.isRestoringBackup = false;
      }
    };

    reader.onerror = (error) => {
      this.notificationService.showError('Failed to read backup file.');
      console.error('Failed to read backup file:', error);
      this.isRestoringBackup = false;
    };

    reader.readAsText(this.selectedBackupFile);
  }

  // Add a helper method to load settings, used after restore
  private loadSettings(storeSlug: string, category: string): void {
    this.isLoading = true;
    this.settingsService.getManagerSettingsByCategory(storeSlug, category).pipe(
      catchError(err => {
        this.error = err;
        this.isLoading = false;
        this.notificationService.showError('Failed to reload settings after restore.');
        return of(null);
      })
    ).subscribe(settings => {
      this.settings = settings;
      this.editableSettings = this.deepCopy(settings);
      this.isLoading = false;
    });
  }
}