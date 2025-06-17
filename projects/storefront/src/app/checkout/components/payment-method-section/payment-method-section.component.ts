import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShippingAddressFormComponent, ShippingAddressData } from '../shipping-address-form/shipping-address-form.component';

@Component({
  selector: 'app-payment-method-section',
  standalone: true,
  imports: [CommonModule, ShippingAddressFormComponent],
  templateUrl: './payment-method-section.component.html',
  styleUrls: ['./payment-method-section.component.scss']
})
export class PaymentMethodSectionComponent {
  @Input() storedCard?: { last4: string; brand: string; };
  @Output() cardUpdate = new EventEmitter<{ last4: string; brand: string; }>();

  showBillingForm = false;
  isModalOpen = false;

  handleBillingSubmit(data: ShippingAddressData) {
    console.log('Billing address submitted:', data);
  }

  handleCardSave() {
    // In a real scenario, you'd get this data from the Tranzila iframe/callback
    this.cardUpdate.emit({ last4: '4242', brand: 'Visa' });
    this.isModalOpen = false;
  }
}