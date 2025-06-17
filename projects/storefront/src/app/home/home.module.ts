import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeRoutingModule } from './home-routing.module'; // Import routing module
import { HomepageComponent } from './homepage/homepage.component'; // Import component

// Import Standalone Components used by HomepageComponent
import { CarouselComponent } from './components/carousel/carousel.component';
// import { SearchBarComponent } from '../core/components/search-bar/search-bar.component'; // Assuming SearchBar is needed on homepage, though plan puts it in header
// import { NewsletterFormComponent } from '../shared/components/newsletter-form/newsletter-form.component'; // Assuming Newsletter is needed on homepage, though plan puts it in footer

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HomeRoutingModule,
    CarouselComponent,
    HomepageComponent,
    // SearchBarComponent, // Re-evaluate if needed directly here vs. header/footer
    // NewsletterFormComponent, // Re-evaluate if needed directly here vs. header/footer
  ],
})
export class HomeModule {
  constructor() {
    console.log('<<<<< HomeModule Constructor Loaded >>>>>'); // Add log here
  }
}
