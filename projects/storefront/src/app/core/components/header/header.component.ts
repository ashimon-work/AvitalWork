import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core'; // Removed inject, ElementRef, HostListener
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// FormsModule, ReactiveFormsModule removed as search is delegated
import { Observable, Subscription, of, firstValueFrom } from 'rxjs'; // Removed Subject, fromEvent, operators not needed by header
import { map } from 'rxjs/operators'; // Keep map if used by other parts
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { HostListener } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { StoreContextService } from '../../services/store-context.service';
import { AuthService } from '../../services/auth.service';
// ApiService removed, SearchBarComponent will use it
import { CartDrawerService } from '../../services/cart-drawer.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { CategoryDropdownService } from '../../services/category-dropdown.service';
import { MatMenuModule } from '@angular/material/menu';
import { ApiService } from '../../services/api.service';


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
    SearchBarComponent,
    // FormsModule, ReactiveFormsModule removed
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() variant: 'transparent' | 'light' | 'dark' = 'transparent'; // <--- הוסף כאן
  isScrolled = false;
  shopOpen = false;


  @ViewChild('mobileDrawer') mobileDrawer!: MatSidenav;
  @ViewChild(SearchBarComponent) searchBar!: SearchBarComponent;


  public storeSlug$: Observable<string | null>;
  storeName$: Observable<string | undefined>;
  storeLogoUrl$: Observable<string | undefined | null>;
  isAuthenticated$: Observable<boolean>;
  userProfileImageUrl$: Observable<string | undefined | null>;
  public defaultUserProfileImageUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC44Hzw2Taav4khTujCr44832VCInQKGrmMHAEErJ1sru0o-XS9uVoReQQEzDLpC9OoAoZUKM69RkahY-FFPaPF5jpGlzqrIfUatLHXrzt8tg9WGwbuTklTGc4v8cH-uILUQ3CW-L_92nIWVbmWVtfUdrxMaGKeJziBnC_x0B2Ikvk9IsqHRlLid8b7Oibg6-bZ_mGSDB1H7YvWp8vqb00wPXIuMQtuX3mOJOK_ovrNvtQu6a3sYG14bPfBYF20swftpnpdKlQ9dA';

  cartItemCount$: Observable<number>;
  private subscriptions = new Subscription();

  public NAV_LINKS: NavLink[] = [
    { label: 'Home', pathSegments: [], isStoreSpecific: true, key: 'home', exact: true },
    { label: 'Contact', pathSegments: ['contact'], isStoreSpecific: true, key: 'contact' },
    { label: 'About', pathSegments: ['about'], isStoreSpecific: true, key: 'about' },
  ];
  isSearchOpen = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    private storeContext: StoreContextService,
    private authService: AuthService,
    private cartDrawerService: CartDrawerService,
    private categoryDropdownService: CategoryDropdownService,
    private apiService: ApiService,
  ) {

    this.storeSlug$ = this.storeContext.currentStoreSlug$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.userProfileImageUrl$ = this.authService.currentUser$.pipe(
      map(user => user?.profilePictureUrl || null)
    );
    this.storeName$ = this.storeContext.currentStoreDetails$.pipe(map(store => store?.name));
    this.storeLogoUrl$ = this.storeContext.currentStoreDetails$.pipe(map(store => store?.logoUrl));
    this.cartItemCount$ = this.cartService.getItemCount();
  }

  ngOnInit() {
    // Search-related subscriptions removed
  }
  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  toggleCard() {
    this.isSearchOpen = !this.isSearchOpen;
  }
  generateRouterLink(link: NavLink, slug: string | null | undefined): string[] {
    if (link.isStoreSpecific) {
      return slug
        ? ['/', slug, ...link.pathSegments].filter(s => s)
        : ['/', ...link.pathSegments].filter(s => s);
    }
    return ['/', ...link.pathSegments].filter(s => s);
  }

  async onAccountClick(): Promise<void> {
    const isAuthenticated = await firstValueFrom(this.isAuthenticated$);
    const slug = await firstValueFrom(this.storeSlug$);
    const path = isAuthenticated
      ? slug ? ['/', slug, 'account'] : ['/account']
      : slug ? ['/', slug, 'login'] : ['/login'];
    this.router.navigate(path);
    this.mobileDrawer?.close();
  }

  async onCartClick(): Promise<void> {
    this.cartDrawerService.open();
    this.mobileDrawer?.close();
  }

  async onLogoClick(): Promise<void> {
    const slug = await firstValueFrom(this.storeSlug$);
    this.router.navigate(slug ? ['/', slug] : ['/']);
    this.mobileDrawer?.close();
  }
  handleNavLinkClick(): void {
    this.mobileDrawer?.close();
  }
  openSearchPanel(): void {
    console.log('[HeaderComponent] openSearchPanel called');
    this.searchBar.open();
  }
  toggleShopDropdown(): void {
    this.categoryDropdownService.toggle();
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.mobileDrawer?.close();
  }
  get variantClass(): string {
    return `header-${this.variant}`;
  }
}
