import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order } from '@shared-types';
import { StoreContextService } from '../../../core/services/store-context.service';
import { NotificationService } from '../../../core/services/notification.service';
import { take } from 'rxjs/operators';
import { OrderService } from '../../../order/order.service';

@Component({
  selector: 'app-order-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-details-modal.component.html',
  styleUrl: './order-details-modal.component.scss'
})
export class OrderDetailsModalComponent implements OnChanges {
  @Input() order: Order | null = null;
  @Output() orderUpdated = new EventEmitter<void>();

  newStatus: string = '';
  isLoading: boolean = false;
  isAddingNote: boolean = false;
  newNoteContent: string = '';
  availableStatuses: string[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']; // Example statuses

  emailSubject: string = '';
  emailBody: string = '';
  isSendingEmail: boolean = false;

  trackingNumber: string = '';
  shippingCarrier: string = '';
  isAddingShipping: boolean = false;
  isGeneratingPackingSlip: boolean = false;
  isCancellingOrder: boolean = false;

  private storeSlug: string | null = null;

  constructor(
    private orderService: OrderService,
    private storeContextService: StoreContextService,
    private notificationService: NotificationService
  ) {
    this.storeContextService.currentStoreSlug$.pipe(take(1)).subscribe(slug => {
      this.storeSlug = slug;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order'] && this.order) {
      this.newStatus = this.order.status; // Initialize newStatus with current order status
      // Initialize shipping fields if order has shipping info
      this.trackingNumber = this.order.trackingNumber || '';
      this.shippingCarrier = this.order.shippingMethod || '';
    }
  }

  closeModal(): void {
    // This will be handled by the parent component or a modal service
    // depending on the chosen modal implementation (e.g., Bootstrap, Angular Material)
    console.log('Modal close requested');
  }

  updateOrderStatus(): void {
    if (!this.order || !this.storeSlug || !this.newStatus) {
      this.notificationService.showError('Cannot update order status. Missing information.');
      return;
    }

    this.isLoading = true;
    this.orderService.updateManagerOrderStatus(this.storeSlug, this.order.id, this.newStatus).subscribe({
      next: (updatedOrder: Order) => {
        this.notificationService.showSuccess('Order status updated successfully!');
        this.order = updatedOrder; // Update the displayed order data
        this.orderUpdated.emit(); // Notify parent to refresh list
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error updating order status:', error);
        this.notificationService.showError('Failed to update order status.');
        this.isLoading = false;
      }
    });
  }

  addOrderNote(): void {
    if (!this.order || !this.storeSlug || !this.newNoteContent.trim()) {
      this.notificationService.showError('Cannot add empty note.');
      return;
    }

    this.isAddingNote = true;
    this.orderService.addManagerOrderNote(this.storeSlug, this.order.id, this.newNoteContent).subscribe({
      next: (updatedOrder: Order) => {
        this.notificationService.showSuccess('Note added successfully!');
        // Assuming the backend returns the updated order with the new note
        this.order = updatedOrder;
        this.newNoteContent = ''; // Clear the input
        this.isAddingNote = false;
      },
      error: (error: any) => {
        console.error('Error adding note:', error);
        this.notificationService.showError('Failed to add note.');
        this.isAddingNote = false;
      }
    });
  }

  sendEmailToCustomer(): void {
    if (!this.order || !this.storeSlug || !this.emailSubject.trim() || !this.emailBody.trim()) {
      this.notificationService.showError('Please enter both subject and body for the email.');
      return;
    }

    this.isSendingEmail = true;
    this.orderService.sendManagerOrderEmail(this.storeSlug, this.order.id, this.emailSubject, this.emailBody).subscribe({
      next: (updatedOrder: Order) => {
        this.notificationService.showSuccess('Email sent successfully!');
        // Optionally update the order object if the backend returns it with email history
        this.order = updatedOrder;
        this.emailSubject = ''; // Clear the input fields
        this.emailBody = '';
        this.isSendingEmail = false;
      },
      error: (error: any) => {
        console.error('Error sending email:', error);
        this.notificationService.showError('Failed to send email.');
        this.isSendingEmail = false;
      }
    });
  }

  addShippingInformation(): void {
    if (!this.order || !this.storeSlug || !this.trackingNumber.trim() || !this.shippingCarrier.trim()) {
      this.notificationService.showError('Please enter both tracking number and shipping carrier.');
      return;
    }

    this.isAddingShipping = true;
    this.orderService.addManagerOrderShipping(this.storeSlug, this.order.id, this.trackingNumber, this.shippingCarrier).subscribe({
      next: (updatedOrder: Order) => {
        this.notificationService.showSuccess('Shipping information added successfully!');
        this.order = updatedOrder; // Update the displayed order data
        this.trackingNumber = ''; // Clear input fields
        this.shippingCarrier = '';
        this.isAddingShipping = false;
      },
      error: (error: any) => {
        console.error('Error adding shipping information:', error);
        this.notificationService.showError('Failed to add shipping information.');
        this.isAddingShipping = false;
      }
    });
  }

  generatePackingSlip(): void {
    if (!this.order || !this.storeSlug) {
      this.notificationService.showError('Cannot generate packing slip. Missing order or store information.');
      return;
    }

    this.isGeneratingPackingSlip = true;
    this.orderService.generateManagerPackingSlip(this.storeSlug, this.order.id).subscribe({
      next: (response: Blob) => {
        // Assuming the backend sends the filename in the Content-Disposition header
        const contentDisposition = 'Content-Disposition'; // Replace with actual header name if different
        const filenameMatch = /filename="?(.+)"?/.exec(contentDisposition); // Extract filename
        const filename = filenameMatch && filenameMatch[1] ? filenameMatch[1] : `packing-slip-${this.order!.orderNumber}.pdf`; // Default filename

        const blob = new Blob([response], { type: 'application/pdf' }); // Adjust MIME type if necessary
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        this.notificationService.showSuccess('Packing slip generated successfully!');
        this.isGeneratingPackingSlip = false;
      },
      error: (error: any) => {
        console.error('Error generating packing slip:', error);
        this.notificationService.showError('Failed to generate packing slip.');
        this.isGeneratingPackingSlip = false;
      }
    });
  }

  cancelOrder(): void {
    if (!this.order || !this.storeSlug) {
      this.notificationService.showError('Cannot cancel order. Missing order or store information.');
      return;
    }

    // Optional: Add a confirmation dialog here
    const confirmCancel = confirm('Are you sure you want to cancel this order? This action cannot be undone.');

    if (!confirmCancel) {
      return; // User cancelled the confirmation
    }

    this.isCancellingOrder = true;
    this.orderService.cancelManagerOrder(this.storeSlug, this.order.id).subscribe({
      next: (updatedOrder: Order) => {
        this.notificationService.showSuccess('Order cancelled successfully!');
        this.order = updatedOrder;
        this.orderUpdated.emit(); // Notify parent to refresh list
        this.isCancellingOrder = false;
      },
      error: (error: any) => {
        console.error('Error cancelling order:', error);
        this.notificationService.showError('Failed to cancel order.');
        this.isCancellingOrder = false;
      }
    });
  }

  markAsFulfilled(): void {
    if (!this.order || !this.storeSlug) {
      this.notificationService.showError('Cannot mark as fulfilled. Missing order or store information.');
      return;
    }

    this.isLoading = true;
    this.orderService.markOrderAsFulfilled(this.storeSlug, this.order.id).subscribe({
      next: (updatedOrder: Order) => {
        this.notificationService.showSuccess('Order marked as fulfilled successfully!');
        this.order = updatedOrder;
        this.orderUpdated.emit();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error marking order as fulfilled:', error);
        this.notificationService.showError('Failed to mark order as fulfilled.');
        this.isLoading = false;
      }
    });
  }

  printShippingLabel(): void {
    if (!this.order || !this.storeSlug) {
      this.notificationService.showError('Cannot print shipping label. Missing order or store information.');
      return;
    }

    console.log(`Print shipping label for order ${this.order.id} requested in store ${this.storeSlug}.`);
    // Call the service method for the placeholder backend interaction
    this.orderService.requestShippingLabel(this.storeSlug, this.order.id).subscribe({
      next: (response: { message: string }) => {
        // Show the message from the backend (which might be the placeholder message)
        this.notificationService.showInfo(response.message || 'Printing shipping labels is not yet implemented.');
      },
      error: (error: any) => {
        console.error('Error requesting shipping label:', error);
        // Even if the backend call fails for the placeholder, show the generic message.
        this.notificationService.showInfo('Printing shipping labels is not yet implemented.');
        this.notificationService.showError('Failed to request shipping label from backend.');
      }
    });
  }
}