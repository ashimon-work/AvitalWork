import { Component } from '@angular/core';
import { T, TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-shipping-policy-page',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './shipping-policy-page.component.html',
  styleUrl: './shipping-policy-page.component.scss'
})
export class ShippingPolicyPageComponent {
  public tKeys = T;
}
