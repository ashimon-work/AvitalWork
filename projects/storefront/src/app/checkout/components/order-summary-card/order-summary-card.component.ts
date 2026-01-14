import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { T, TranslatePipe, I18nService } from '@shared/i18n';

export interface OrderItem {
  id: string;
  name: string;
  options: string;
  price: number;
  quantity: number;
  image: string;
}

@Component({
  selector: 'app-order-summary-card',
  standalone: true,
  imports: [CommonModule,TranslatePipe],
  templateUrl: './order-summary-card.component.html',
  styleUrls: ['./order-summary-card.component.scss']
})
export class OrderSummaryCardComponent implements OnChanges {
  @Input() items: OrderItem[] = [];
  @Input() shipping: number = 0;
  @Input() taxes: number = 0;
  @Input() discount?: { code: string; amount: number; };
  @Input() canPlaceOrder: boolean = false;
  @Input() isPlacingOrder: boolean = false;
  @Output() placeOrder = new EventEmitter<void>();
  public tKeys = T;

  subtotal: number = 0;
  total: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateTotals();
  }

  private calculateTotals(): void {
    this.subtotal = this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    this.total = this.subtotal + this.shipping + this.taxes - (this.discount?.amount || 0);
  }

formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
  }).format(amount);
}}