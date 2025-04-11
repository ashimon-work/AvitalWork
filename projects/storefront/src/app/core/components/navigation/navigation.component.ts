import { Component, inject } from '@angular/core';
import { StoreContextService } from '../../services/store-context.service';
import { MobileMenuService } from '../../services/mobile-menu.service'; // Import MobileMenuService
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  private storeContext = inject(StoreContextService);
  private mobileMenuService = inject(MobileMenuService); // Inject MobileMenuService
  currentStoreSlug$: Observable<string | null> = this.storeContext.currentStoreSlug$;

  closeMenuOnClick(): void {
    this.mobileMenuService.closeMenu();
  }
}
