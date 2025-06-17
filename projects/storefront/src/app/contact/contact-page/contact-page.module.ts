import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactPageComponent } from './contact-page.component';
// If you have a specific routing module for this feature, import it here
// import { ContactPageRoutingModule } from './contact-page-routing.module';

@NgModule({
  declarations: [
    // ContactPageComponent is standalone and should not be declared here.
  ],
  imports: [
    CommonModule, // CommonModule can still be useful for other non-standalone components in this module
    ReactiveFormsModule, // ReactiveFormsModule can also be useful here
    // ContactPageRoutingModule // Add if you have a separate routing module
    // If ContactPageComponent is routed, it will be imported directly in the routing configuration.
  ],
  exports: [
  ]
})
export class ContactPageModule { }