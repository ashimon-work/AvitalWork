import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShippingMethod } from '../../../core/services/api.service';
import { T, TranslatePipe, I18nService } from '@shared/i18n';

@Component({
  selector: 'app-shipping-method',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './shipping-method.component.html',
  styleUrls: ['./shipping-method.component.scss']
})
export class ShippingMethodComponent {
  @Input() shippingMethods: ShippingMethod[] = [];
  @Input() selectedMethod: ShippingMethod | null = null;
  @Output() selectionChange = new EventEmitter<ShippingMethod>();
  public tKeys = T;

  selectMethod(method: ShippingMethod) {
    this.selectionChange.emit(method);
  }
}