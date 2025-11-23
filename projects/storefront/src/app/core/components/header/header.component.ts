import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'; // Removed inject, ElementRef, HostListener
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// FormsModule, ReactiveFormsModule removed as search is delegated
import { Observable, Subscription, of, firstValueFrom } from 'rxjs'; // Removed Subject, fromEvent, operators not needed by header
import { map, switchMap } from 'rxjs/operators'; // Keep map if used by other parts, add switchMap

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';

import { CartService } from '../../services/cart.service';
import { StoreContextService } from '../../services/store-context.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
// SearchBarComponent will use it
import { SearchBarComponent } from '../search-bar/search-bar.component'; // Import SearchBarComponent
import { Category } from '@shared-types';

interface NavLink {
  label: string;
  pathSegments: string[];
  isStoreSpecific: boolean;
  key: string;
  exact?: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule,
    MatMenuModule,
    SearchBarComponent, // Add SearchBarComponent here
    // FormsModule, ReactiveFormsModule removed
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('mobileDrawer') mobileDrawer!: MatSidenav;

  public storeSlug$: Observable<string | null>;
  storeName$: Observable<string | undefined>;
  storeLogoUrl$: Observable<string | undefined | null>;
  isAuthenticated$: Observable<boolean>;
  userProfileImageUrl$: Observable<string | undefined | null>;
  public defaultUserProfileImageUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC44Hzw2Taav4khTujCr44832VCInQKGrmMHAEErJ1sru0o-XS9uVoReQQEzDLpC9OoAoZUKM69RkahY-FFPaPF5jpGlzqrIfUatLHXrzt8tg9WGwbuTklTGc4v8cH-uILUQ3CW-L_92nIWVbmWVtfUdrxMaGKeJziBnC_x0B2Ikvk9IsqHRlLid8b7Oibg6-bZ_mGSDB1H7YvWp8vqb00wPXIuMQtuX3mOJOK_ovrNvtQu6a3sYG14bPfBYF20swftpnpdKlQ9dA';

  cartItemCount$: Observable<number>;
  categories$: Observable<Category[]>;
  private subscriptions = new Subscription();

  // All search-related properties removed:
  // searchQuery, searchSuggestions$, currentSearchSuggestions, searchQueryChanged,
  // showSuggestions, activeSuggestionIndex, destroy$, searchInputFocused,
  // desktopSearchInput, mobileSearchInput

  public NAV_LINKS: NavLink[] = [
    {
      label: 'Home',
      pathSegments: [],
      isStoreSpecific: true,
      key: 'home',
      exact: true,
    },
    {
      label: 'About Us',
      pathSegments: ['about'],
      isStoreSpecific: true,
      key: 'about',
    },
    {
      label: 'Contact',
      pathSegments: ['contact'],
      isStoreSpecific: true,
      key: 'contact',
    },
  ];

  constructor(
    private router: Router,
    private cartService: CartService,
    private storeContext: StoreContextService,
    private authService: AuthService,
    private apiService: ApiService
    // ElementRef removed
  ) {
    this.storeSlug$ = this.storeContext.currentStoreSlug$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.userProfileImageUrl$ = this.authService.currentUser$.pipe(
      map((user) => user?.profilePictureUrl || null)
    );

    this.storeName$ = this.storeContext.currentStoreDetails$.pipe(
      map((store) => store?.name)
    );
    this.storeLogoUrl$ = this.storeContext.currentStoreDetails$.pipe(
      map((store) => store?.logoUrl)
    );
    this.cartItemCount$ = this.cartService.getItemCount();
    this.categories$ = this.storeSlug$.pipe(
      switchMap((storeSlug) => {
        if (storeSlug) {
          return this.apiService.getStoreCategories(storeSlug);
        } else {
          return of([]);
        }
      })
    );
  }

  ngOnInit() {
    // Search-related subscriptions removed
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    // destroy$ for search removed
  }

  generateRouterLink(link: NavLink, slug: string | null | undefined): string[] {
    if (link.isStoreSpecific) {
      if (slug) {
        const segments =
          link.pathSegments.length === 0 ? [] : link.pathSegments;
        return ['/', slug, ...segments].filter(
          (segment) =>
            segment !== undefined && segment !== null && segment !== ''
        );
      } else {
        return ['/', ...link.pathSegments].filter(
          (segment) =>
            segment !== undefined && segment !== null && segment !== ''
        );
      }
    }
    return ['/', ...link.pathSegments].filter(
      (segment) => segment !== undefined && segment !== null && segment !== ''
    );
  }

  // All search-related methods removed:
  // onSearchQueryChanged, fetchSearchSuggestions, clearSearch, onSearchFocus,
  // handleKeyDown, selectSuggestion, slugify, performSearch

  async onAccountClick(): Promise<void> {
    const isAuthenticated = await firstValueFrom(this.isAuthenticated$);
    const slug = await firstValueFrom(this.storeSlug$);

    if (isAuthenticated) {
      this.router.navigate(slug ? ['/', slug, 'account'] : ['/account']);
    } else {
      this.router.navigate(slug ? ['/', slug, 'login'] : ['/login']);
    }
    if (this.mobileDrawer?.opened) {
      this.mobileDrawer.close();
    }
  }

  async onCartClick(): Promise<void> {
    const slug = await firstValueFrom(this.storeSlug$);
    this.router.navigate(slug ? ['/', slug, 'cart'] : ['/cart']);
    if (this.mobileDrawer?.opened) {
      this.mobileDrawer.close();
    }
  }

  async onLogoClick(): Promise<void> {
    const slug = await firstValueFrom(this.storeSlug$);
    this.router.navigate(slug ? ['/', slug] : ['/']);
    if (this.mobileDrawer?.opened) {
      this.mobileDrawer.close();
    }
  }

  handleNavLinkClick(): void {
    if (this.mobileDrawer?.opened) {
      this.mobileDrawer.close();
    }
  }

  async onCategoryClick(category: Category): Promise<void> {
    const slug = await firstValueFrom(this.storeSlug$);
    this.router.navigate([`/${slug}/category`, category.id]);
    if (this.mobileDrawer?.opened) {
      this.mobileDrawer.close();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    if (this.mobileDrawer?.opened) {
      this.mobileDrawer.close();
    }
  }
}
