import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body text-center">
              <div class="text-danger mb-3">
                <i class="fas fa-times-circle fa-4x"></i>
              </div>
              <h3 class="text-danger">Payment Method Setup Failed</h3>
              <p class="mb-4">There was an issue adding your credit card. Please try again or contact support.</p>
              <div class="d-grid gap-2">
                <button class="btn btn-primary" (click)="returnToCheckout()">
                  Try Again
                </button>
                <button class="btn btn-outline-secondary" (click)="contactSupport()">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PaymentFailureComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Automatically close the window after 5 seconds if it's a popup
    if (window.opener) {
      setTimeout(() => {
        window.close();
      }, 5000);
    }
  }

  returnToCheckout(): void {
    if (window.opener) {
      window.close();
    } else {
      this.router.navigate(['/checkout']);
    }
  }

  contactSupport(): void {
    if (window.opener) {
      window.close();
    } else {
      this.router.navigate(['/contact']);
    }
  }
} 