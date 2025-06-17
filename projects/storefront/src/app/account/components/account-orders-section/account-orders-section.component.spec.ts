import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AccountOrdersSectionComponent } from './account-orders-section.component';
import { Order } from 'projects/shared-types/src/lib/order.interface';
import { OrderStatus } from 'projects/shared-types/src/lib/order.types';

describe('AccountOrdersSectionComponent', () => {
  let component: AccountOrdersSectionComponent;
  let fixture: ComponentFixture<AccountOrdersSectionComponent>;

  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: '#ORD-TEST-001',
      orderReference: 'ref-1',
      status: 'delivered' as OrderStatus,
      totalAmount: 100,
      subtotal: 100,
      shippingCost: 0,
      taxAmount: 0,
      createdAt: new Date().toISOString(),
      items: [{ id: 'i1', productId: 'p1', productName: 'Test Product', quantity: 1, price: 100 }],
    },
    {
      id: '2',
      orderNumber: '#ORD-TEST-002',
      orderReference: 'ref-2',
      status: 'processing' as OrderStatus,
      totalAmount: 50,
      subtotal: 50,
      shippingCost: 0,
      taxAmount: 0,
      createdAt: new Date().toISOString(),
      items: [{ id: 'i2', productId: 'p2', productName: 'Test Product 2', quantity: 2, price: 25 }],
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountOrdersSectionComponent],
      imports: [
        CommonModule,
        NoopAnimationsModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountOrdersSectionComponent);
    component = fixture.componentInstance;
    component.orders = mockOrders; // Provide mock data
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct number of orders in the table', () => {
    const tableRows = fixture.nativeElement.querySelectorAll('table.orders-table tr.mat-row');
    expect(tableRows.length).toBe(mockOrders.length);
  });

  it('should display order details correctly in the first row', () => {
    const firstOrder = mockOrders[0];
    const firstRowCells = fixture.nativeElement.querySelectorAll('table.orders-table tr.mat-row:first-child td.mat-cell');
    
    expect(firstRowCells[0].textContent).toContain(firstOrder.orderNumber);
    // Date formatting check can be more complex, this is a basic check
    expect(firstRowCells[1].textContent).toBeTruthy(); 
    expect(firstRowCells[2].textContent).toContain(component.getStatusLabel(firstOrder.status as OrderStatus));
    expect(firstRowCells[3].textContent).toContain(firstOrder.items?.length.toString());
    // Currency formatting check can be more complex
    expect(firstRowCells[4].textContent).toContain(firstOrder.totalAmount.toString()); 
  });

  it('should calculate summary statistics correctly', () => {
    component.ngOnInit(); // Ensure stats are calculated if not already by detectChanges
    expect(component.totalOrdersCount).toBe(mockOrders.length);
    expect(component.totalSpent).toBe(mockOrders.reduce((sum, order) => sum + order.totalAmount, 0));
    expect(component.totalDeliveredOrders).toBe(mockOrders.filter(o => o.status === 'delivered').length);
  });

  it('should emit viewOrder event when view button is clicked', () => {
    spyOn(component.viewOrder, 'emit');
    const viewButton = fixture.nativeElement.querySelector('table.orders-table tr.mat-row:first-child .view-button');
    viewButton.click();
    expect(component.viewOrder.emit).toHaveBeenCalledWith(mockOrders[0].orderNumber);
  });

  it('should show "Download Invoice" button for delivered orders', () => {
    const deliveredOrderRow = fixture.nativeElement.querySelector('table.orders-table tr.mat-row:first-child'); // First mock is delivered
    const downloadButton = deliveredOrderRow.querySelector('.invoice-button');
    expect(downloadButton).toBeTruthy();
  });

  it('should not show "Download Invoice" button for processing orders', () => {
    const processingOrderIndex = mockOrders.findIndex(o => o.status === 'processing');
    if (processingOrderIndex !== -1) {
      const processingOrderRow = fixture.nativeElement.querySelectorAll('table.orders-table tr.mat-row')[processingOrderIndex];
      const downloadButton = processingOrderRow.querySelector('.invoice-button');
      expect(downloadButton).toBeFalsy();
    }
  });

  it('should display "no orders" message when orders array is empty', () => {
    component.orders = [];
    fixture.detectChanges();
    const noOrdersMessage = fixture.nativeElement.querySelector('.no-orders-card');
    const table = fixture.nativeElement.querySelector('.orders-table-card');
    expect(noOrdersMessage).toBeTruthy();
    expect(table).toBeFalsy();
  });

});