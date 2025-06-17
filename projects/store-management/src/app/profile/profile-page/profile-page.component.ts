import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { catchError, finalize, of } from 'rxjs';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { T, TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, JsonPipe, TranslatePipe], // Add FormsModule, JsonPipe and TranslatePipe
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnInit {
  public tKeys = T;

  managerProfile: any;
  editableProfile: any;
  isLoading = true;
  isSavingPersonalInfo = false; // Renamed for clarity
  personalInfoError: any = null; // Renamed for clarity

  // Password change properties
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  isChangingPassword = false;
  passwordChangeError: any = null;

  // 2FA properties
  is2faSetupVisible = false;
  twoFactorSecret: string | null = null;
  qrCodeUrl: string | null = null;
  confirmationCode = '';
  isInitiating2fa = false;
  isConfirming2fa = false;
  twoFactorError: any = null;

  // 2FA Disable properties
  is2faDisableVisible = false;
  disable2faVerification = '';
  isDisabling2fa = false;
  disable2faError: any = null;

  // Profile Picture
  selectedProfilePicture: File | null = null;
  isUploadingPicture = false;
  profilePictureError: any = null;
  profilePicturePreviewUrl: string | ArrayBuffer | null = null;

  // 2FA Backup Codes
  backupCodes: string[] = [];
  isLoadingBackupCodes = false;
  backupCodesError: any = null;
  showBackupCodes = false;

  // Notification Preferences
  notificationPreferences: any = {}; // Will hold { emailOrderUpdates: true, ... }
  editableNotificationPreferences: any = {};
  isLoadingNotificationPreferences = false;
  isSavingNotificationPreferences = false;
  notificationPreferencesError: any = null;

  // Login History
  loginHistory: any[] = [];
  isLoadingLoginHistory = false;
  loginHistoryError: any = null;
  loginHistoryPage = 1;
  loginHistoryLimit = 10;
  loginHistoryTotal = 0;


  // Assuming a notification service exists and is injected
  // constructor(private profileService: ProfileService, private notificationService: NotificationService) { }
  constructor(private profileService: ProfileService) { }

  ngOnInit(): void {
    this.getManagerProfile();
    this.getNotificationPreferences();
    this.getLoginHistory();
  }

  initiate2faSetup(): void {
    this.isInitiating2fa = true;
    this.twoFactorError = null;
    this.profileService.initiateManager2faSetup().pipe(
      catchError(error => {
        this.twoFactorError = error;
        // Assuming a notification service exists
        // this.notificationService.showError('Failed to initiate 2FA setup.');
        console.error('Error initiating 2FA setup:', error);
        return of(null);
      }),
      finalize(() => {
        this.isInitiating2fa = false;
      })
    ).subscribe((response: any) => {
      if (response && response.twoFactorSecret && response.qrCodeUrl) {
        this.twoFactorSecret = response.twoFactorSecret;
        this.qrCodeUrl = response.qrCodeUrl;
        this.is2faSetupVisible = true;
        this.confirmationCode = ''; // Clear previous code
      }
    });
  }

  confirm2faSetup(): void {
    if (!this.confirmationCode) {
      this.twoFactorError = { message: 'Please enter the confirmation code.' };
      // Assuming a notification service exists
      // this.notificationService.showError('Please enter the confirmation code.');
      return;
    }

    this.isConfirming2fa = true;
    this.twoFactorError = null;

    this.profileService.confirmManager2faSetup(this.confirmationCode).pipe(
      catchError(error => {
        this.twoFactorError = error;
        // Assuming a notification service exists
        // this.notificationService.showError('Failed to confirm 2FA setup.');
        console.error('Error confirming 2FA setup:', error);
        return of(null);
      }),
      finalize(() => {
        this.isConfirming2fa = false;
      })
    ).subscribe((response: any) => {
      if (response && response.isTwoFactorEnabled) {
        // Assuming a notification service exists
        // this.notificationService.showSuccess('2FA enabled successfully!');
        console.log('2FA enabled successfully.');
        // Update the profile to reflect 2FA is enabled
        if (this.managerProfile) {
          this.managerProfile.isTwoFactorEnabled = true;
        }
        this.is2faSetupVisible = false; // Hide the setup section
        this.twoFactorSecret = null;
        this.qrCodeUrl = null;
        this.confirmationCode = '';
      }
    });
  }
  initiate2faDisable(): void {
    this.is2faDisableVisible = true;
    this.disable2faVerification = ''; // Clear previous input
    this.disable2faError = null; // Clear previous errors
  }

  confirm2faDisable(): void {
    if (!this.disable2faVerification) {
      this.disable2faError = { message: 'Please enter the verification code.' };
      // Assuming a notification service exists
      // this.notificationService.showError('Please enter the verification code.');
      console.error('Verification code is required to disable 2FA.');
      return;
    }

    this.isDisabling2fa = true;
    this.disable2faError = null;

    this.profileService.disableManager2fa(this.disable2faVerification).pipe(
      catchError(error => {
        this.disable2faError = error;
        // Assuming a notification service exists
        // this.notificationService.showError('Failed to disable 2FA.');
        console.error('Error disabling 2FA:', error);
        return of(null);
      }),
      finalize(() => {
        this.isDisabling2fa = false;
      })
    ).subscribe((response: any) => {
      if (response && response.isTwoFactorEnabled === false) {
        // Assuming a notification service exists
        // this.notificationService.showSuccess('2FA disabled successfully!');
        console.log('2FA disabled successfully.');
        // Update the profile to reflect 2FA is disabled
        if (this.managerProfile) {
          this.managerProfile.isTwoFactorEnabled = false;
        }
        this.is2faDisableVisible = false; // Hide the disable section
        this.disable2faVerification = '';
      }
    });
  }

  getManagerProfile(): void {
    this.isLoading = true;
    this.personalInfoError = null;
    this.profileService.getManagerProfile().pipe(
      catchError(error => {
        this.personalInfoError = error;
        // Assuming a notification service exists
        // this.notificationService.showError('Failed to load profile.');
        console.error('Error fetching manager profile:', error);
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe((profile: any) => {
      this.managerProfile = profile;
      if (profile) {
        // Initialize editableProfile with a deep copy
        this.editableProfile = JSON.parse(JSON.stringify(profile));
        this.profilePicturePreviewUrl = profile.profilePictureUrl || 'https://via.placeholder.com/100'; // Use actual or placeholder
      }
    });
  }

  onProfilePictureSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedProfilePicture = element.files[0];
      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicturePreviewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedProfilePicture as Blob);
      this.profilePictureError = null; // Clear previous error
    } else {
      this.selectedProfilePicture = null;
      // Optionally revert to original picture or placeholder if selection is cleared
      // this.profilePicturePreviewUrl = this.managerProfile?.profilePictureUrl || 'https://via.placeholder.com/100';
    }
  }

  uploadProfilePicture(): void {
    if (!this.selectedProfilePicture) {
      this.profilePictureError = { message: 'Please select a picture to upload.' };
      // this.notificationService.showError('Please select a picture to upload.');
      return;
    }

    this.isUploadingPicture = true;
    this.profilePictureError = null;

    this.profileService.uploadManagerProfilePicture(this.selectedProfilePicture).pipe(
      catchError(error => {
        this.profilePictureError = error;
        // this.notificationService.showError('Failed to upload profile picture.');
        console.error('Error uploading profile picture:', error);
        return of(null);
      }),
      finalize(() => {
        this.isUploadingPicture = false;
      })
    ).subscribe((response: any) => {
      if (response && response.profilePictureUrl) {
        // this.notificationService.showSuccess('Profile picture updated successfully!');
        console.log('Profile picture updated successfully.');
        if (this.managerProfile) {
          this.managerProfile.profilePictureUrl = response.profilePictureUrl;
        }
        this.profilePicturePreviewUrl = response.profilePictureUrl;
        this.selectedProfilePicture = null; // Clear selection
      }
    });
  }


  savePersonalInfo(): void {
    if (!this.editableProfile) {
      return; // Should not happen if profile is loaded
    }

    this.isSavingPersonalInfo = true;
    this.personalInfoError = null; // Clear previous errors

    // Extract only the fields that can be updated
    const updatedData = {
      firstName: this.editableProfile.firstName,
      lastName: this.editableProfile.lastName,
      phone: this.editableProfile.phone,
      // Add other editable fields if any
    };

    this.profileService.updateManagerPersonalInfo(updatedData).pipe(
      catchError(error => {
        this.personalInfoError = error;
        // Assuming a notification service exists
        // this.notificationService.showError('Failed to update profile.');
        console.error('Error updating manager profile:', error);
        return of(null);
      }),
      finalize(() => {
        this.isSavingPersonalInfo = false;
      })
    ).subscribe((updatedProfile: any) => {
      if (updatedProfile) {
        this.managerProfile = updatedProfile; // Update displayed profile
        // Assuming a notification service exists
        // this.notificationService.showSuccess('Profile updated successfully!');
        console.log('Profile updated successfully:', updatedProfile);
        // Re-initialize editableProfile with the latest data
        this.editableProfile = JSON.parse(JSON.stringify(updatedProfile));
      }
    });
  }

  changePassword(form: NgForm): void {
    if (form.invalid) {
      console.log('Password change form is invalid.');
      return;
    }


    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordChangeError = { message: 'New passwords do not match.' };
      console.error('New passwords do not match.');
      // Assuming a notification service exists
      // this.notificationService.showError('New passwords do not match.');
      return;
    }

    this.isChangingPassword = true;
    this.passwordChangeError = null; // Clear previous errors

    const passwordData = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmNewPassword,
    };

    this.profileService.changeManagerPassword(passwordData).pipe(
      catchError(error => {
        this.passwordChangeError = error;
        // Assuming a notification service exists
        // this.notificationService.showError('Failed to change password.');
        console.error('Error changing password:', error);
        return of(null);
      }),
      finalize(() => {
        this.isChangingPassword = false;
      })
    ).subscribe((response: any) => {
      if (response) {
        // Assuming a notification service exists
        // this.notificationService.showSuccess('Password changed successfully!');
        console.log('Password changed successfully.');
        // Clear the password fields on success
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
        form.resetForm(); // Reset form validation state
      }
    });
  }

  getBackupCodes(): void {
    this.isLoadingBackupCodes = true;
    this.backupCodesError = null;
    this.showBackupCodes = false;
    this.profileService.getManager2faBackupCodes().pipe(
      catchError(error => {
        this.backupCodesError = error;
        // this.notificationService.showError('Failed to fetch backup codes.');
        console.error('Error fetching backup codes:', error);
        return of(null);
      }),
      finalize(() => {
        this.isLoadingBackupCodes = false;
      })
    ).subscribe((codes: string[] | null) => {
      if (codes) {
        this.backupCodes = codes;
        this.showBackupCodes = true;
        // this.notificationService.showInfo('Backup codes fetched. Store them safely.');
        console.log('Backup codes fetched.');
      }
    });
  }

  hideBackupCodes(): void {
    this.showBackupCodes = false;
    this.backupCodes = [];
  }

  getNotificationPreferences(): void {
    this.isLoadingNotificationPreferences = true;
    this.notificationPreferencesError = null;
    this.profileService.getManagerNotificationPreferences().pipe(
      catchError(error => {
        this.notificationPreferencesError = error;
        // this.notificationService.showError('Failed to load notification preferences.');
        console.error('Error fetching notification preferences:', error);
        return of(null);
      }),
      finalize(() => {
        this.isLoadingNotificationPreferences = false;
      })
    ).subscribe((prefs: any) => {
      if (prefs) {
        this.notificationPreferences = prefs;
        this.editableNotificationPreferences = JSON.parse(JSON.stringify(prefs)); // Deep copy
      }
    });
  }

  saveNotificationPreferences(): void {
    this.isSavingNotificationPreferences = true;
    this.notificationPreferencesError = null;
    this.profileService.updateManagerNotificationPreferences(this.editableNotificationPreferences).pipe(
      catchError(error => {
        this.notificationPreferencesError = error;
        // this.notificationService.showError('Failed to save notification preferences.');
        console.error('Error saving notification preferences:', error);
        return of(null);
      }),
      finalize(() => {
        this.isSavingNotificationPreferences = false;
      })
    ).subscribe((updatedPrefs: any) => {
      if (updatedPrefs) {
        this.notificationPreferences = updatedPrefs;
        this.editableNotificationPreferences = JSON.parse(JSON.stringify(updatedPrefs));
        // this.notificationService.showSuccess('Notification preferences saved.');
        console.log('Notification preferences saved.');
      }
    });
  }

  getLoginHistory(page: number = this.loginHistoryPage): void {
    this.isLoadingLoginHistory = true;
    this.loginHistoryError = null;
    this.loginHistoryPage = page; // Update current page

    this.profileService.getManagerLoginHistory(this.loginHistoryPage, this.loginHistoryLimit).pipe(
      catchError(error => {
        this.loginHistoryError = error;
        // this.notificationService.showError('Failed to load login history.');
        console.error('Error fetching login history:', error);
        return of({ items: [], total: 0 }); // Return empty on error
      }),
      finalize(() => {
        this.isLoadingLoginHistory = false;
      })
    ).subscribe((response: any) => { // Assuming response is { items: [], total: number }
      if (response && response.items) {
        this.loginHistory = response.items;
        this.loginHistoryTotal = response.total;
      } else {
        this.loginHistory = [];
        this.loginHistoryTotal = 0;
      }
    });
  }

  // Helper for pagination
  get totalLoginHistoryPages(): number {
    return Math.ceil(this.loginHistoryTotal / this.loginHistoryLimit);
  }
}