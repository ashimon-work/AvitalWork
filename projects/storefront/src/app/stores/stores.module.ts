import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoresPageComponent } from './stores-page/stores-page.component';

@NgModule({
  declarations: [
    StoresPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    StoresPageComponent
  ]
})
export class StoresModule { }