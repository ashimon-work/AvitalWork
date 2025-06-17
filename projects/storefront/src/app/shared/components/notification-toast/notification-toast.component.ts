import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { Subject, timer } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './notification-toast.component.html',
  styleUrl: './notification-toast.component.scss'
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  public tKeys = T;
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  currentNotification: Notification | null = null;
  isVisible: boolean = false;

  ngOnInit(): void {
    this.notificationService.notifications$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(notification => {
          this.currentNotification = notification;
          this.isVisible = true;
          // Use timer to hide the notification after a duration
          return timer(notification.duration || 3000);
        })
      )
      .subscribe(() => {
        this.isVisible = false;
        // Clear the notification after hiding
        setTimeout(() => this.currentNotification = null, 300); // Allow fade-out animation
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Optional: Allow manual closing
  closeNotification(): void {
    this.isVisible = false;
    setTimeout(() => this.currentNotification = null, 300); // Allow fade-out animation
  }
}