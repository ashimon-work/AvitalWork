import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductPageComponent } from './product-page/product-page.component';

const routes: Routes = [
  {
    path: ':id', // Matches '/product/:id' because the parent route is 'product'
    component: ProductPageComponent
  },
  // Optional: Add a default route for '/product' if needed
  // { path: '', redirectTo: '/some-default-product-list', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }