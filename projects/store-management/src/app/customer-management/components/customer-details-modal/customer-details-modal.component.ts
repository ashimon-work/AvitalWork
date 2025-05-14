import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { catchError, of, tap } from 'rxjs';
import { User, Order, Note } from '@shared-types'; // Assuming Order and Note interface are available

@Component({
  selector: 'app-customer-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-details-modal.component.html',
  styleUrl: './customer-details-modal.component.scss'
})
export class CustomerDetailsModalComponent implements OnChanges {
  @Input() customer: User | null = null;

  editableCustomer: User | null = null;
  isLoading = false;
  newNoteContent: string = '';
  isAddingNote = false;
  emailSubject: string = '';
  emailBody: string = '';
  isSendingEmail = false;

  customerOrders: Order[] = [];
  isLoadingOrders = false;

  constructor(
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer'] && this.customer) {
      this.editableCustomer = { ...this.customer };
      this.newNoteContent = ''; // Clear note content when customer changes
      this.customerOrders = []; // Clear previous orders
      if (this.editableCustomer && this.editableCustomer.id) {
        this.loadCustomerOrders(this.editableCustomer.id);
      }
    } else {
      this.editableCustomer = null;
      this.newNoteContent = ''; // Clear note content when customer is null
      this.customerOrders = [];
    }
  }

  loadCustomerOrders(customerId: string): void {
    this.isLoadingOrders = true;
    this.customerService.getManagerCustomerOrders(customerId) // This method needs to be created in CustomerService
      .pipe(
        tap(orders => {
          this.customerOrders = orders;
          this.isLoadingOrders = false;
        }),
        catchError(error => {
          console.error('Error loading customer orders:', error);
          this.notificationService.showError('Failed to load customer orders.');
          this.isLoadingOrders = false;
          this.customerOrders = []; // Ensure orders are cleared on error
          return of([]); // Return empty array to continue stream
        })
      )
      .subscribe();
  }

  addCustomerNote(): void {
    if (!this.editableCustomer || !this.editableCustomer.id || !this.newNoteContent.trim()) {
      this.notificationService.showError('Note content cannot be empty.');
      return;
    }

    this.isAddingNote = true;
    this.customerService.addManagerCustomerNote(this.editableCustomer.id, this.newNoteContent)
      .pipe(
        catchError(error => {
          console.error('Error adding customer note:', error);
          this.notificationService.showError('Failed to add customer note.');
          this.isAddingNote = false;
          return of(null); // Return a safe observable
        })
      )
      .subscribe((updatedCustomer: User | null) => {
        if (updatedCustomer) {
          this.notificationService.showSuccess('Customer note added successfully.');
          this.newNoteContent = ''; // Clear input
          // Assuming the backend returns the updated customer with new notes
          this.customer = { ...updatedCustomer };
          this.editableCustomer = { ...updatedCustomer }; // Update editable copy
        }
        this.isAddingNote = false;
      });
  }

  sendEmailToCustomer(): void {
    if (!this.editableCustomer || !this.editableCustomer.id) {
      this.notificationService.showError('No customer data available to send email.');
      return;
    }

    if (!this.emailSubject.trim() || !this.emailBody.trim()) {
      this.notificationService.showError('Email subject and body cannot be empty.');
      return;
    }

    this.isSendingEmail = true;
    this.customerService.sendManagerCustomerEmail(this.editableCustomer.id, this.emailSubject, this.emailBody)
      .pipe(
        catchError(error => {
          console.error('Error sending customer email:', error);
          this.notificationService.showError('Failed to send customer email.');
          this.isSendingEmail = false;
          return of(null); // Return a safe observable
        })
      )
      .subscribe((response: any) => {
        if (response) {
          this.notificationService.showSuccess('Customer email sent successfully.');
          this.emailSubject = ''; // Clear input
          this.emailBody = ''; // Clear input
        }
        this.isSendingEmail = false;
      });
  }

  saveCustomerChanges(): void {
    if (!this.editableCustomer || !this.editableCustomer.id) {
      this.notificationService.showError('No customer data to save.');
      return;
    }

    this.isLoading = true;
    this.customerService.updateManagerCustomer(this.editableCustomer.id, this.editableCustomer)
      .pipe(
        catchError(error => {
          console.error('Error saving customer changes:', error);
          this.notificationService.showError('Failed to save customer changes.');
          this.isLoading = false;
          return of(null); // Return a safe observable
        })
      )
      .subscribe((updatedCustomer: User | null) => { // Use User type annotation
        if (updatedCustomer) {
          this.notificationService.showSuccess('Customer changes saved successfully.');
          // Optionally update the original customer object or emit an event
          this.customer = { ...updatedCustomer }; // Update displayed data
          // Emit an event to parent to refresh list if needed
          // this.customerUpdated.emit(updatedCustomer);
        }
        this.isLoading = false;
      });
  }
}