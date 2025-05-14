import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { Subject, catchError, of } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CustomerService } from '../services/customer.service'; // Corrected import path
import { NotificationService } from '../../core/services/notification.service';

// Declare bootstrap globally if using it directly
declare var bootstrap: any;

@Component({
  selector: 'app-customer-management-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Removed providers: [CustomerService] to use the root-provided service
  templateUrl: './customer-management-page.component.html',
  styleUrl: './customer-management-page.component.scss'
})
export class CustomerManagementPageComponent implements OnInit {

  customers: any[] = []; // Replace 'any[]' with a proper customer interface later
  searchTerm: string = '';
  selectedFilter: string = '';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10; // Customers per page
  totalCustomers: number = 0;
  totalPages: number = 0;

  // Sorting properties
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  isLoading: boolean = false;
  isExporting: boolean = false; // Loading state for export
  error: string | null = null;

  selectedCustomer: any | null = null;
  isModalLoading: boolean = false;

  private searchTermChanged: Subject<string> = new Subject<string>();

  constructor(
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadCustomers();

    this.searchTermChanged.pipe(
      debounceTime(500), // Wait for 500ms after the last emit before emitting
      distinctUntilChanged() // Only emit when the current value is different than the last
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1; // Reset to first page on search
      this.loadCustomers();
    });
  }

  onSearchTermChange(event: any): void {
    this.searchTermChanged.next(event.target.value);
  }

  onFilterChange(event: any): void {
    this.selectedFilter = event.target.value;
    this.currentPage = 1;
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.error = null;
    this.customerService.getManagerCustomers(
      this.searchTerm,
      this.selectedFilter,
      this.currentPage,
      this.pageSize,
      this.sortColumn,
      this.sortDirection
    ).subscribe({
      next: (response: any) => { // Added type annotation
        this.customers = response.data;
        this.totalCustomers = response.total;
        this.totalPages = Math.ceil(this.totalCustomers / this.pageSize);
        this.isLoading = false;
      },
      error: (err: any) => { // Added type annotation
        console.error('Error loading customers:', err);
        this.error = 'Failed to load customers. Please try again later.';
        this.isLoading = false;
        this.notificationService.showError('Failed to load customers.'); // Use notification service
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCustomers();
    }
  }

  sortCustomers(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadCustomers();
  }

  openCustomerDetailsModal(customer: any): void { // Replace 'any' with a proper customer interface later
    if (!customer || !customer.id) {
      this.notificationService.showError('Invalid customer data.');
      return;
    }

    this.isModalLoading = true;
    this.selectedCustomer = null; // Clear previous data

    this.customerService.getManagerCustomerDetails(customer.id).pipe(
      catchError(err => {
        console.error('Error fetching customer details:', err);
        this.notificationService.showError('Failed to load customer details.');
        this.isModalLoading = false;
        return of(null); // Return an observable of null to continue the stream
      })
    ).subscribe((details: any) => {
      if (details) {
        this.selectedCustomer = details;
        this.isModalLoading = false;
        // Implement Bootstrap modal opening logic here
        const modalElement = document.getElementById('customerDetailsModal');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        } else {
          console.error('Customer details modal element not found.');
          this.notificationService.showError('Modal component not found.');
        }
      }
    });
  }

  closeModal(): void {
    // Implement Bootstrap modal closing logic here
    const modalElement = document.getElementById('customerDetailsModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    this.selectedCustomer = null;
  }

  // TODO: Add methods for other user actions like editing, contacting, etc.

  exportCustomers(): void {
    this.isExporting = true;
    this.customerService.exportManagerCustomers(this.searchTerm, this.selectedFilter).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const blob = response.body;
        if (!blob) {
          this.notificationService.showError('Export failed: No data received.');
          this.isExporting = false;
          return;
        }

        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'customers.csv'; // Default filename
        if (contentDisposition) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.isExporting = false;
        this.notificationService.showSuccess('Customer data exported successfully.');
      },
      error: (err: any) => {
        console.error('Error exporting customers:', err);
        this.isExporting = false;
        this.notificationService.showError('Failed to export customer data.');
      }
    });
  }
}