import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}