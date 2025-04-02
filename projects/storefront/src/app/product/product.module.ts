import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRoutingModule } from './product-routing.module'; // Import routing module
import { ProductPageComponent } from './product-page/product-page.component'; // Import component


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProductRoutingModule // Import the routing module
  ]
})
export class ProductModule { }
