import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { T, TranslatePipe } from '@shared/i18n';
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationToastComponent } from './shared/components/notification-toast/notification-toast.component';
import { CartDrawerComponent } from './cart/components/cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    NotificationToastComponent,
    TranslatePipe,
    CartDrawerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public tKeys = T;
  isAuthenticated$!: Observable<boolean>;

  private authService = inject(AuthService);

  ngOnInit(): void {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }
}
