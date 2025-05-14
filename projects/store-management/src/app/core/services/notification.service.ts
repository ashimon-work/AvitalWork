import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastr = inject(ToastrService);

  constructor() { }

  showError(message: string, title: string = 'Error'): void {
    this.toastr.error(message, title, {
      timeOut: 5000, // 5 seconds
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right'
    });
  }

  showSuccess(message: string, title: string = 'Success'): void {
    this.toastr.success(message, title, {
      timeOut: 3000, // 3 seconds
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right'
    });
  }

  showInfo(message: string, title: string = 'Info'): void {
    this.toastr.info(message, title, {
      timeOut: 3000, // 3 seconds
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right'
    });
  }

  showWarning(message: string, title: string = 'Warning'): void {
    this.toastr.warning(message, title, {
      timeOut: 4000, // 4 seconds
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right'
    });
  }
}