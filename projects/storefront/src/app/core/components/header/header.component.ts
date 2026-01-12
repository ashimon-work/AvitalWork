// import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
// import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// <<<<<<< HEAD
// import { Observable, Subscription, of, firstValueFrom } from 'rxjs';
// import { map, switchMap } from 'rxjs/operators';
// =======
// import { Observable, Subscription, firstValueFrom } from 'rxjs';
// import { map } from 'rxjs/operators';
// >>>>>>> 4b5e0b88ffb87a9669e57241db21240d8bd2e5da

// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
// import { MatListModule } from '@angular/material/list';
// import { MatBadgeModule } from '@angular/material/badge';
// import { MatMenuModule } from '@angular/material/menu';

// import { CartService } from '../../services/cart.service';
// import { StoreContextService } from '../../services/store-context.service';
// import { AuthService } from '../../services/auth.service';
// <<<<<<< HEAD
// import { ApiService } from '../../services/api.service';
// import { SearchBarComponent } from '../search-bar/search-bar.component';
// import { Category } from '@shared-types';
// import { CategoryDropdownService } from '../../services/category-dropdown.service';
// =======
// import { CartDrawerService } from '../../services/cart-drawer.service';
// import { SearchBarComponent } from '../search-bar/search-bar.component';
// >>>>>>> 4b5e0b88ffb87a9669e57241db21240d8bd2e5da

// interface NavLink {
//   label: string;
//   pathSegments: string[];
//   isStoreSpecific: boolean;
//   key: string;
//   exact?: boolean;
// }

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterLink,
//     RouterLinkActive,
//     MatToolbarModule,
//     MatButtonModule,
//     MatIconModule,
//     MatSidenavModule,
//     MatListModule,
//     MatBadgeModule,
// <<<<<<< HEAD
//     MatMenuModule,
// =======
// >>>>>>> 4b5e0b88ffb87a9669e57241db21240d8bd2e5da
//     SearchBarComponent,
//   ],
//   templateUrl: './header.component.html',
//   styleUrl: './header.component.scss',
// })
// export class HeaderComponent implements OnInit, OnDestroy {
//   @ViewChild('mobileDrawer') mobileDrawer!: MatSidenav;
//   @ViewChild(SearchBarComponent) searchBar!: SearchBarComponent;

//   public storeSlug$: Observable<string | null>;
//   storeName$: Observable<string | undefined>;
//   storeLogoUrl$: Observable<string | undefined | null>;
//   isAuthenticated$: Observable<boolean>;
//   userProfileImageUrl$: Observable<string | undefined | null>;
//   public defaultUserProfileImageUrl =
//     'https://lh3.googleusercontent.com/aida-public/AB6AXuC44Hzw2Taav4khTujCr44832VCInQKGrmMHAEErJ1sru0o-XS9uVoReQQEzDLpC9OoAoZUKM69RkahY-FFPaPF5jpGlzqrIfUatLHXrzt8tg9WGwbuTklTGc4v8cH-uILUQ3CW-L_92nIWVbmWVtfUdrxMaGKeJziBnC_x0B2Ikvk9IsqHRlLid8b7Oibg6-bZ_mGSDB1H7YvWp8vqb00wPXIuMQtuX3mOJOK_ovrNvtQu6a3sYG14bPfBYF20swftpnpdKlQ9dA';

//   cartItemCount$: Observable<number>;
//   private subscriptions = new Subscription();

//   public NAV_LINKS: NavLink[] = [
//     {
//       label: 'Home',
//       pathSegments: [],
//       isStoreSpecific: true,
//       key: 'home',
//       exact: true,
//     },
//     {
//       label: 'About Us',
//       pathSegments: ['about'],
//       isStoreSpecific: true,
//       key: 'about',
//     },
//     {
//       label: 'Contact',
//       pathSegments: ['contact'],
//       isStoreSpecific: true,
//       key: 'contact',
//     },
//   ];

//   constructor(
//     private router: Router,
//     private cartService: CartService,
//     private storeContext: StoreContextService,
//     private authService: AuthService,
//     private apiService: ApiService,
//     private categoryDropdownService: CategoryDropdownService
//     private cartDrawerService: CartDrawerService
//   ) {
//     this.storeSlug$ = this.storeContext.currentStoreSlug$;
//     this.isAuthenticated$ = this.authService.isAuthenticated$;
//     this.userProfileImageUrl$ = this.authService.currentUser$.pipe(
//       map((user) => user?.profilePictureUrl || null)
//     );

//     this.storeName$ = this.storeContext.currentStoreDetails$.pipe(
//       map((store) => store?.name)
//     );
//     this.storeLogoUrl$ = this.storeContext.currentStoreDetails$.pipe(
//       map((store) => store?.logoUrl)
//     );
//     this.cartItemCount$ = this.cartService.getItemCount();
//   }

//   ngOnInit() {}

//   ngOnDestroy() {
//     this.subscriptions.unsubscribe();
//   }

//   generateRouterLink(link: NavLink, slug: string | null | undefined): string[] {
//     if (link.isStoreSpecific) {
//       if (slug) {
//         const segments =
//           link.pathSegments.length === 0 ? [] : link.pathSegments;
//         return ['/', slug, ...segments].filter(
//           (segment) =>
//             segment !== undefined && segment !== null && segment !== ''
//         );
//       } else {
//         return ['/', ...link.pathSegments].filter(
//           (segment) =>
//             segment !== undefined && segment !== null && segment !== ''
//         );
//       }
//     }
//     return ['/', ...link.pathSegments].filter(
// <<<<<<< HEAD
//       (segment) =>
//         segment !== undefined && segment !== null && segment !== ''
// =======
//       (segment) => segment !== undefined && segment !== null && segment !== ''
// >>>>>>> 4b5e0b88ffb87a9669e57241db21240d8bd2e5da
//     );
//   }

//   async onAccountClick(): Promise<void> {
//     const isAuthenticated = await firstValueFrom(this.isAuthenticated$);
//     const slug = await firstValueFrom(this.storeSlug$);

//     if (isAuthenticated) {
//       this.router.navigate(slug ? ['/', slug, 'account'] : ['/account']);
//     } else {
//       this.router.navigate(slug ? ['/', slug, 'login'] : ['/login']);
//     }
//     if (this.mobileDrawer?.opened) {
//       this.mobileDrawer.close();
//     }
//   }

//   async onCartClick(): Promise<void> {
//     this.cartDrawerService.open();
//     if (this.mobileDrawer?.opened) {
//       this.mobileDrawer.close();
//     }
//   }

//   async onLogoClick(): Promise<void> {
//     const slug = await firstValueFrom(this.storeSlug$);
//     this.router.navigate(slug ? ['/', slug] : ['/']);
//     if (this.mobileDrawer?.opened) {
//       this.mobileDrawer.close();
//     }
//   }

//   handleNavLinkClick(): void {
//     if (this.mobileDrawer?.opened) {
//       this.mobileDrawer.close();
//     }
//   }

//   openSearchPanel(): void {
//     console.log('[HeaderComponent] openSearchPanel called');
//     this.searchBar.open();
//   }

// <<<<<<< HEAD
//   toggleShopDropdown(): void {
//     this.categoryDropdownService.toggle();
// =======
//   openSearchPanel(): void {
//     console.log('[HeaderComponent] openSearchPanel called');
//     this.searchBar.open();
// >>>>>>> 4b5e0b88ffb87a9669e57241db21240d8bd2e5da
//   }

//   logout(): void {
//     this.authService.logout();
//     this.router.navigate(['/']);
//     if (this.mobileDrawer?.opened) {
//       this.mobileDrawer.close();
//     }
//   }
// }


import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

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
import { CartDrawerService } from '../../services/cart-drawer.service';
import { ApiService } from '../../services/api.service';
import { CategoryDropdownService } from '../../services/category-dropdown.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';

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
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
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
    { label: 'About Us', pathSegments: ['about'], isStoreSpecific: true, key: 'about' },
    { label: 'Contact', pathSegments: ['contact'], isStoreSpecific: true, key: 'contact' },
  ];

  constructor(
    private router: Router,
    private cartService: CartService,
    private storeContext: StoreContextService,
    private authService: AuthService,
    private apiService: ApiService,
    private categoryDropdownService: CategoryDropdownService,
    private cartDrawerService: CartDrawerService
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

  ngOnInit() {}

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
}
