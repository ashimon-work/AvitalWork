import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body text-center">
              <div class="text-success mb-3">
                <i class="fas fa-check-circle fa-4x"></i>
              </div>
              <h3 class="text-success">Payment Method Added Successfully!</h3>
              <p class="mb-4">Your credit card has been securely saved. You can now complete your order.</p>
              <button class="btn btn-primary" (click)="returnToCheckout()">
                Return to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PaymentSuccessComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Automatically close the window after 3 seconds if it's a popup
    if (window.opener) {
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  }

  returnToCheckout(): void {
    if (window.opener) {
      window.close();
    } else {
      this.router.navigate(['/checkout']);
    }
  }
} 