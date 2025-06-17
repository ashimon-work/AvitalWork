import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order } from '@shared-types';
import { T, TranslatePipe, TranslationSchema } from '@shared/i18n';
import { StoreContextService } from '../../../core/services/store-context.service';
import { NotificationService } from '../../../core/services/notification.service';
import { take } from 'rxjs/operators';
import { OrderService } from '../../../order/order.service';

@Component({
  selector: 'app-order-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './order-details-modal.component.html',
  styleUrl: './order-details-modal.component.scss'
})
export class OrderDetailsModalComponent implements OnChanges {
  @Input() order: Order | null = null;
  @Output() orderUpdated = new EventEmitter<void>();
  public tKeys = T;

  newStatus: string = '';
  isLoading: boolean = false;
  isAddingNote: boolean = false;
  newNoteContent: string = '';
  availableStatuses: string[] = [
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
  ];

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
      this.newStatus = this.order.status;
      this.trackingNumber = this.order.trackingNumber || '';
      this.shippingCarrier = this.order.shippingMethod || '';
    }
  }

  getOrderStatusTranslationKey(status: string | undefined): keyof TranslationSchema | undefined {
    if (!status) return undefined;
    const keyString = `SM_ORDER_STATUS_${status.toUpperCase()}`;
    return keyString in this.tKeys ? keyString as keyof TranslationSchema : undefined;
  }

  getPaymentStatusTranslationKey(status: string | undefined): keyof TranslationSchema | undefined {
    if (!status) return undefined;
    const keyString = `SM_PAYMENT_STATUS_${status.toUpperCase()}`;
    return keyString in this.tKeys ? keyString as keyof TranslationSchema : undefined;
  }

  closeModal(): void {
    console.log('Modal close requested');
  }

  updateOrderStatus(): void {
    if (!this.order || !this.storeSlug || !this.newStatus) {
      this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_UPDATE_STATUS_MISSING_INFO);
      return;
    }

    this.isLoading = true;
    this.orderService.updateManagerOrderStatus(this.storeSlug, this.order.id, this.newStatus).subscribe({
      next: (updatedOrder: Order) => {
        this.notificationService.showSuccess(this.tKeys.SM_ORDER_DETAILS_SUCCESS_UPDATE_STATUS);
        this.order = updatedOrder;
        this.orderUpdated.emit();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error updating order status:', error);
        this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_UPDATE_STATUS_FAILED);
        this.isLoading = false;
      }
    });
  }

  addOrderNote(): void {
    if (!this.order || !this.storeSlug || !this.newNoteContent.trim()) {
      this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_ADD_NOTE_EMPTY);
      return;
    }

    this.isAddingNote = true;
    this.orderService.addManagerOrderNote(this.storeSlug, this.order.id, this.newNoteContent).subscribe({
      next: (updatedOrder: Order) => {
        this.notificationService.showSuccess(this.tKeys.SM_ORDER_DETAILS_SUCCESS_ADD_NOTE);
        this.order = updatedOrder;
        this.newNoteContent = '';
        this.isAddingNote = false;
      },
      error: (error: any) => {
        console.error('Error adding note:', error);
        this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_ADD_NOTE_FAILED);
        this.isAddingNote = false;
      }
    });
  }

  sendEmailToCustomer(): void {
    if (!this.order || !this.storeSlug || !this.emailSubject.trim() || !this.emailBody.trim()) {
      this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_SEND_EMAIL_MISSING_FIELDS);
      return;
    }

    this.isSendingEmail = true;
    this.orderService.sendManagerOrderEmail(this.storeSlug, this.order.id, this.emailSubject, this.emailBody).subscribe({
      next: (updatedOrder: Order) => {
        this.notificationService.showSuccess(this.tKeys.SM_ORDER_DETAILS_SUCCESS_SEND_EMAIL);
        this.order = updatedOrder;
        this.emailSubject = '';
        this.emailBody = '';
        this.isSendingEmail = false;
      },
      error: (error: any) => {
        console.error('Error sending email:', error);
        this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_SEND_EMAIL_FAILED);
        this.isSendingEmail = false;
      }
    });
  }

  addShippingInformation(): void {
    if (!this.order || !this.storeSlug || !this.trackingNumber.trim() || !this.shippingCarrier.trim()) {
      this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_ADD_SHIPPING_MISSING_FIELDS);
      return;
    }

    this.isAddingShipping = true;
    this.orderService.addManagerOrderShipping(this.storeSlug, this.order.id, this.trackingNumber, this.shippingCarrier).subscribe({
      next: (updatedOrder: Order) => {
        this.notificationService.showSuccess(this.tKeys.SM_ORDER_DETAILS_SUCCESS_ADD_SHIPPING);
        this.order = updatedOrder;
        this.trackingNumber = '';
        this.shippingCarrier = '';
        this.isAddingShipping = false;
      },
      error: (error: any) => {
        console.error('Error adding shipping information:', error);
        this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_ADD_SHIPPING_FAILED);
        this.isAddingShipping = false;
      }
    });
  }

  generatePackingSlip(): void {
    if (!this.order || !this.storeSlug) {
      this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_GENERATE_PACKING_SLIP_MISSING_INFO);
      return;
    }

    this.isGeneratingPackingSlip = true;
    this.orderService.generateManagerPackingSlip(this.storeSlug, this.order.id).subscribe({
      next: (response: Blob) => {
        const contentDisposition = 'Content-Disposition'; // Placeholder, actual header might differ
        const filenameMatch = /filename="?(.+)"?/.exec(contentDisposition);
        const filename = filenameMatch && filenameMatch[1] ? filenameMatch[1] : `packing-slip-${this.order!.orderNumber}.pdf`;

        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        this.notificationService.showSuccess(this.tKeys.SM_ORDER_DETAILS_SUCCESS_GENERATE_PACKING_SLIP);
        this.isGeneratingPackingSlip = false;
      },
      error: (error: any) => {
        console.error('Error generating packing slip:', error);
        this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_GENERATE_PACKING_SLIP_FAILED);
        this.isGeneratingPackingSlip = false;
      }
    });
  }

  cancelOrder(): void {
    if (!this.order || !this.storeSlug) {
      this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_CANCEL_ORDER_MISSING_INFO);
      return;
    }

    const confirmCancel = confirm(this.tKeys.SM_ORDER_DETAILS_CONFIRM_CANCEL_ORDER_MESSAGE);

    if (!confirmCancel) {
      return;
    }

    this.isCancellingOrder = true;
    this.orderService.cancelManagerOrder(this.storeSlug, this.order.id).subscribe({
      next: (updatedOrder: Order) => {
        this.notificationService.showSuccess(this.tKeys.SM_ORDER_DETAILS_SUCCESS_CANCEL_ORDER);
        this.order = updatedOrder;
        this.orderUpdated.emit();
        this.isCancellingOrder = false;
      },
      error: (error: any) => {
        console.error('Error cancelling order:', error);
        this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_CANCEL_ORDER_FAILED);
        this.isCancellingOrder = false;
      }
    });
  }

  markAsFulfilled(): void {
    if (!this.order || !this.storeSlug) {
      this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_MARK_FULFILLED_MISSING_INFO);
      return;
    }

    this.isLoading = true;
    this.orderService.markOrderAsFulfilled(this.storeSlug, this.order.id).subscribe({
      next: (updatedOrder: Order) => {
        this.notificationService.showSuccess(this.tKeys.SM_ORDER_DETAILS_SUCCESS_MARK_FULFILLED);
        this.order = updatedOrder;
        this.orderUpdated.emit();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error marking order as fulfilled:', error);
        this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_MARK_FULFILLED_FAILED);
        this.isLoading = false;
      }
    });
  }

  printShippingLabel(): void {
    if (!this.order || !this.storeSlug) {
      this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_PRINT_LABEL_MISSING_INFO);
      return;
    }

    console.log(`Print shipping label for order ${this.order.id} requested in store ${this.storeSlug}.`);
    this.orderService.requestShippingLabel(this.storeSlug, this.order.id).subscribe({
      next: (response: { message: string }) => {
        this.notificationService.showInfo(response.message || this.tKeys.SM_ORDER_DETAILS_INFO_PRINT_LABEL_NOT_IMPLEMENTED);
      },
      error: (error: any) => {
        console.error('Error requesting shipping label:', error);
        this.notificationService.showInfo(this.tKeys.SM_ORDER_DETAILS_INFO_PRINT_LABEL_NOT_IMPLEMENTED);
        this.notificationService.showError(this.tKeys.SM_ORDER_DETAILS_ERROR_PRINT_LABEL_BACKEND_FAILED);
      }
    });
  }
}