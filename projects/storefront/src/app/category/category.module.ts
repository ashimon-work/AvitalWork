import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategoryRoutingModule } from './category-routing.module';

import { CategoryPageComponent } from './category-page/category-page.component';

import { FeaturedProductCardComponent } from '../shared/components/featured-product-card/featured-product-card.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CategoryRoutingModule,
    FormsModule,
    FeaturedProductCardComponent,
    CategoryPageComponent
  ]
})
export class CategoryModule { }
