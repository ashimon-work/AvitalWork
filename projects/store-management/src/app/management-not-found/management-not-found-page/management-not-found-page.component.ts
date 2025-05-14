import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ErrorReportingService, ReportErrorPayload } from '../../core/services/error-reporting.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-management-not-found-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './management-not-found-page.component.html',
  styleUrls: ['./management-not-found-page.component.scss']
})
export class ManagementNotFoundPageComponent implements OnInit {
  private router = inject(Router);
  private location = inject(Location);
  private errorReportingService = inject(ErrorReportingService);

  currentUrl: string = '';
  showReportForm: boolean = false;
  reportComment: string = '';
  reportStatus: 'idle' | 'success' | 'error' = 'idle';
  errorMessage: string = '';

  constructor() { }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    console.warn(`Management 404 Not Found: ${this.currentUrl}`);
  }

  goBack(): void {
    this.location.back();
  }

  goToDashboard(): void {
    this.router.navigate(['/management/dashboard']); // Adjust if your dashboard route is different
  }

  toggleReportForm(): void {
    this.showReportForm = !this.showReportForm;
    this.reportStatus = 'idle'; // Reset status when toggling
    this.reportComment = ''; // Clear comment
  }

  submitReport(): void {
    if (!this.currentUrl) {
      this.reportStatus = 'error';
      this.errorMessage = 'Cannot report error: Current URL is not available.';
      return;
    }

    const payload: ReportErrorPayload = {
      url: this.currentUrl,
      comment: this.reportComment.trim() || undefined
    };

    this.errorReportingService.reportError(payload).subscribe({
      next: () => {
        this.reportStatus = 'success';
        this.showReportForm = false; // Hide form on success
        // Optionally, show a success message for a few seconds
        setTimeout(() => this.reportStatus = 'idle', 5000);
      },
      error: (err) => {
        console.error('Error reporting broken link:', err);
        this.reportStatus = 'error';
        this.errorMessage = err.error?.message || err.message || 'Failed to report broken link. Please try again later.';
         // Keep form open on error to allow retry or modification
      }
    });
  }
}