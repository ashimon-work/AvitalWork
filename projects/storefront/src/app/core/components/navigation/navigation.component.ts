import { Component, inject } from '@angular/core';
import { StoreContextService } from '../../services/store-context.service';
import { MobileMenuService } from '../../services/mobile-menu.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  public tKeys = T;
  private storeContext = inject(StoreContextService);
  private mobileMenuService = inject(MobileMenuService);
  currentStoreSlug$: Observable<string | null> = this.storeContext.currentStoreSlug$;

  closeMenuOnClick(): void {
    this.mobileMenuService.closeMenu();
  }
}
