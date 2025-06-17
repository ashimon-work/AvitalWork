import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-progress-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-progress-indicator.component.html',
  styleUrls: ['./checkout-progress-indicator.component.scss']
})
export class CheckoutProgressIndicatorComponent {
  @Input() currentStep: number = 1;
}