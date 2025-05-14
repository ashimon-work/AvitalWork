import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagementNotFoundPageComponent } from './management-not-found-page/management-not-found-page.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ManagementNotFoundPageComponent,
  ],
  exports: [
    ManagementNotFoundPageComponent
  ]
})
export class ManagementNotFoundModule { }