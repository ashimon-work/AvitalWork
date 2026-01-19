import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Order, OrderItem } from 'projects/shared-types/src/lib/order.interface';
import { OrderStatus } from 'projects/shared-types/src/lib/order.types';


import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip'; // Added for potential future use with aria-label

@Component({
  selector: 'app-account-orders-section',
  templateUrl: './account-orders-section.component.html',
  styleUrls: ['./account-orders-section.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TranslatePipe
  ]
})
export class AccountOrdersSectionComponent implements OnInit, OnChanges {
  @Input() orders: Order[] = [];

  @Output() viewOrder = new EventEmitter<string>(); // Emits order.orderNumber
  @Output() downloadInvoice = new EventEmitter<string>(); // Emits order.orderNumber
  public tKeys = T;

  totalOrdersCount: number = 0;
  totalSpent: number = 0;
  totalDeliveredOrders: number = 0;

  // Columns displayed in the table
  displayedColumns: string[] = ['orderNumber', 'date', 'status', 'items', 'total', 'actions'];

  constructor() { }

  ngOnInit(): void {
    this.calculateSummaryStats();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orders']) {
      this.calculateSummaryStats();
    }
  }



  calculateSummaryStats(): void {
    this.totalOrdersCount = this.orders.length;
    this.totalSpent = this.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    this.totalDeliveredOrders = this.orders.filter(order => order.status === 'delivered').length;
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case 'delivered': return 'status-delivered';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'cancelled': return 'status-cancelled';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default:
        const exhaustiveCheck: never = status; // Ensures all cases are handled
        return 'status-default';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getItemCount(order: Order): number {
    return order.items?.length || 0;
  }

  onViewOrder(order: Order): void {
    this.viewOrder.emit(order.orderNumber);
  }

  onDownloadInvoice(order: Order): void {
    this.downloadInvoice.emit(order.orderNumber);
  }

  // Helper to map icon names for template consistency (example with Material Icons)
  getIcon(iconName: 'Package' | 'Eye' | 'Download'): string {
    switch (iconName) {
      case 'Package': return 'inventory_2';
      case 'Eye': return 'visibility';
      case 'Download': return 'download';
      default: return '';
    }
  }
}