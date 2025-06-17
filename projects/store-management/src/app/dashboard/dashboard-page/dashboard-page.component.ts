import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DashboardService, Notification } from '../dashboard.service'; // Import Notification interface
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../core/services/websocket.service';
import { NotificationService as UiNotificationService } from '../../core/services/notification.service';
import { BaseChartDirective } from 'ng2-charts';
import { CategoryScale, Chart, ChartConfiguration, ChartOptions, ChartType, registerables } from 'chart.js';
import { T, TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, TranslatePipe],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  public tKeys = T;
  dashboardData: any;
  recentOrders: any[] = [];
  totalOrders: number = 0;
  currentPage: number = 1;
  private notificationSubscription: Subscription | undefined;
  itemsPerPage: number = 50;
  sortColumn: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  storeSlug: string | null = null;
  inventoryAlerts: any[] = [];
  notifications: Notification[] = []; // Use Notification interface
  showNotificationsList: boolean = false;
  selectedTimePeriod: string = 'daily';

  // Chart properties
  public salesChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [],
    labels: []
  };
  public salesChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    }
  };
  public salesChartType: 'line' = 'line';

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private websocketService: WebsocketService,
    private uiNotificationService: UiNotificationService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    // Get storeSlug from route parameters
    this.storeSlug = this.route.snapshot.paramMap.get('storeSlug');

    if (!this.storeSlug) {
      console.error('Store slug not found in route parameters.');
      this.uiNotificationService.showError('Store identifier is missing. Cannot load dashboard.', 'Configuration Error');
      // Optionally, navigate to a generic error page or a "select store" page if applicable
      // For now, just show error and prevent further execution in ngOnInit
      return;
    }

    // Fetch overall dashboard data (performance cards, health score)
    this.dashboardService.getDashboardData(this.storeSlug).subscribe({
      next: (data) => {
        this.dashboardData = data;
        console.log('Overall dashboard data fetched:', this.dashboardData);
      },
      error: (error) => {
        console.error('Error fetching overall dashboard data:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          errorBody: error.error
        });
        this.uiNotificationService.showError('Failed to load dashboard summary data.', 'Data Error');
      }
    });

    // Fetch initial sales chart data (default period)
    this.fetchSalesChartData(this.selectedTimePeriod);

    // Fetch initial inventory alerts
    this.fetchInventoryAlerts();

    // Fetch initial paginated and sorted recent orders
    this.fetchRecentOrders();

    // Fetch initial notifications
    this.fetchNotifications();

    // Subscribe to WebSocket notifications
    this.notificationSubscription = this.websocketService.listen('newNotification').subscribe({
      next: (notification: Notification) => { // Use Notification interface
        console.log('Received new notification via WebSocket:', notification);
        this.handleNewNotification(notification);
      },
      error: (error: any) => {
        console.error('WebSocket notification error:', error);
        this.uiNotificationService.showWarning('Could not connect to real-time notification service. Some updates may be delayed.', 'Connection Issue');
      }
    });

    // TODO: Subscribe to other real-time updates (e.g., new orders, low stock alerts via WebSocket) - Backend dependent
  }

  fetchNotifications(): void {
    if (!this.storeSlug) {
      console.error('Store slug is missing, cannot fetch notifications.');
      return;
    }
    this.dashboardService.getNotifications(this.storeSlug).subscribe({
      next: (data) => {
        this.notifications = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        console.log('Notifications fetched and sorted:', this.notifications);
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
        this.uiNotificationService.showError('Failed to load notifications.', 'Data Error');
      }
    });
  }

  toggleNotificationsList(): void {
    this.showNotificationsList = !this.showNotificationsList;
    if (this.showNotificationsList && this.notifications.some(n => !n.isRead)) {
      // Optionally mark all as read when opening the list, or have a separate button
      // For now, we'll require explicit action to mark as read.
    }
  }

  handleNewNotification(notification: Notification): void {
    // Add the new notification to the beginning of the array to show newest first
    this.notifications.unshift(notification);
    if (this.notifications.length > 100) { // Limit to 100 notifications
      this.notifications.pop();
    }
    // Show a toast for the new notification
    this.uiNotificationService.showInfo(notification.message, 'New Notification');
    console.log('New notification added:', notification);
  }

  markNotificationAsRead(notificationId: string): void {
    if (!this.storeSlug) return;
    this.dashboardService.markNotificationAsRead(notificationId).subscribe({
      next: (updatedNotification) => {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index > -1) {
          this.notifications[index] = updatedNotification;
          this.notifications = [...this.notifications]; // Trigger change detection
        }
        console.log('Notification marked as read:', updatedNotification);
      },
      error: (error) => console.error('Error marking notification as read:', error)
    });
  }

  deleteNotification(notificationId: string): void {
    if (!this.storeSlug) return;
    this.dashboardService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        console.log('Notification deleted:', notificationId);
      },
      error: (error) => console.error('Error deleting notification:', error)
    });
  }


  fetchSalesChartData(period: string): void {
    if (!this.storeSlug) {
      console.error('Store slug is missing, cannot fetch sales chart data.');
      return;
    }
    this.dashboardService.getSalesChartData(this.storeSlug, period).subscribe({
      next: (data) => {
        console.log('Sales chart data fetched:', data);
        this.updateSalesChart(data);
      },
      error: (error) => {
        console.error('Error fetching sales chart data:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          errorBody: error.error
        });
        this.uiNotificationService.showError('Failed to load sales chart data.', 'Data Error');
      }
    });
  }

  fetchInventoryAlerts(): void {
    if (!this.storeSlug) {
      console.error('Store slug is missing, cannot fetch inventory alerts.');
      return;
    }
    this.dashboardService.getInventoryAlerts(this.storeSlug).subscribe({
      next: (data) => {
        console.log('Inventory alerts fetched:', data);
        this.inventoryAlerts = data;
      },
      error: (error) => {
        console.error('Error fetching inventory alerts:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          errorBody: error.error
        });
        this.uiNotificationService.showError('Failed to load inventory alerts.', 'Data Error');
      }
    });
  }

  fetchRecentOrders(): void {
    if (!this.storeSlug) {
      console.error('Store slug is missing, cannot fetch recent orders.');
      return;
    }
    this.dashboardService.getRecentOrders(this.storeSlug, this.currentPage, this.itemsPerPage, this.sortColumn, this.sortDirection).subscribe({ // Pass storeSlug
      next: (data) => {
        if (data && data.data && data.total !== undefined) {
          this.recentOrders = data.data;
          this.totalOrders = data.total;
          console.log('Recent orders fetched:', this.recentOrders, 'Total:', this.totalOrders);
        } else {
          console.warn('Recent orders data is null or undefined, or missing properties.');
          this.recentOrders = []; // Initialize with empty array to prevent errors
          this.totalOrders = 0;
          // Optionally handle the case where data is missing
        }
      },
      error: (error) => {
        console.error('Error fetching recent orders:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          errorBody: error.error // This often contains the response body
        });
        this.uiNotificationService.showError('Failed to load recent orders.', 'Data Error');
      }
    });
  }

  updateSalesChart(chartData: any): void {
    if (!chartData || !chartData.labels || !chartData.datasets) {
      this.salesChartData = { datasets: [], labels: [] };
      return;
    }

    this.salesChartData.labels = chartData.labels;
    this.salesChartData.datasets = chartData.datasets.map((dataset: any) => ({
      ...dataset,
      fill: 'origin', // Fill area below the line
      tension: 0.3 // Add some curve to the line
    }));
    // Manually trigger chart update if necessary, depending on ng2-charts version and setup
    // This might not be needed if ng2-charts detects the object mutation
  }

  onSortChange(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc'; // Default to ascending when changing column
    }
    console.log('Sorting changed:', this.sortColumn, this.sortDirection);
    this.currentPage = 1; // Reset to first page on sort change
    this.fetchRecentOrders(); // Fetch data with new sorting
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      console.log('Page changed:', this.currentPage);
      this.fetchRecentOrders(); // Fetch data for the new page
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalOrders / this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.itemsPerPage - 1, this.totalOrders - 1);
  }

  goToProducts(): void {
    if (!this.storeSlug) return;
    this.router.navigate(['../products'], { relativeTo: this.route });
  }

  goToOrders(): void {
    if (!this.storeSlug) return;
    this.router.navigate(['../orders'], { relativeTo: this.route });
  }

  goToSettings(): void {
    if (!this.storeSlug) return;
    this.router.navigate(['../settings'], { relativeTo: this.route });
  }

  viewOrder(orderId: string): void {
    if (!this.storeSlug) return;
    // Assuming an order details route like ':storeSlug/orders/:orderId'
    this.router.navigate(['../orders', orderId], { relativeTo: this.route });
  }

  onTimePeriodChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTimePeriod = selectElement.value;
    console.log('Time period changed:', this.selectedTimePeriod);
    this.fetchSalesChartData(this.selectedTimePeriod);
  }

  onCompareChange(event: Event): void {
    const checkboxElement = event.target as HTMLInputElement;
    console.log('Compare checkbox changed:', checkboxElement.checked);
    // TODO: Implement logic to update chart data for comparison
    // Need to pass storeSlug here as well
  }

  ngOnDestroy(): void {
    // Unsubscribe from WebSocket notifications to prevent memory leaks
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    // TODO: Unsubscribe from other subscriptions if added
  }

  clearAllNotifications(): void {
    if (!this.storeSlug) {
      console.error('Store slug is missing, cannot clear notifications.');
      return;
    }
    // This uses the service method that DELETES all notifications for the user/store
    this.dashboardService.clearAllNotifications(this.storeSlug).subscribe({
      next: (response) => {
        console.log(`Cleared ${response.deleted} notifications from backend.`);
        this.notifications = [];
        this.showNotificationsList = false; // Hide list after clearing
      },
      error: (error) => {
        console.error('Error clearing all notifications:', error);
        this.uiNotificationService.showError('Failed to clear all notifications.', 'Operation Failed');
      }
    });
  }

  markAllNotificationsAsRead(): void {
    if (!this.storeSlug) {
      console.error('Store slug is missing, cannot mark all notifications as read.');
      return;
    }
    this.dashboardService.markAllNotificationsAsRead(this.storeSlug).subscribe({
      next: (response) => {
        console.log(`Marked ${response.updated} notifications as read.`);
        this.fetchNotifications(); // Refresh the list to show updated status
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
        this.uiNotificationService.showError('Failed to mark all notifications as read.', 'Operation Failed');
      }
    });
  }

  get unreadNotificationCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get hasUnreadNotifications(): boolean {
    return this.notifications.some(n => !n.isRead);
  }
}

