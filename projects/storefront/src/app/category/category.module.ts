import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

import { CategoryRoutingModule } from './category-routing.module';

import {  } from './category-page/category-page.component'; // Import the component

import { ProductCardComponent } from '../shared/components/product-card/product-card.component'; // Import standalone ProductCardComponent
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CategoryRoutingModule,
    FormsModule,
    ProductCardComponent
  ]
})
export class CategoryModule { }
