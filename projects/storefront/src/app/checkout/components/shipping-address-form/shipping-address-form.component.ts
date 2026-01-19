import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { T, TranslatePipe, I18nService } from '@shared/i18n';

export interface ShippingAddressData {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  newsletter: boolean;
  terms: boolean;
}

@Component({
  selector: 'app-shipping-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,TranslatePipe],
  templateUrl: './shipping-address-form.component.html',
  styleUrls: ['./shipping-address-form.component.scss']
})
export class ShippingAddressFormComponent implements OnInit {
  @Input() initialValues?: Partial<ShippingAddressData>;
  @Output() formUpdate = new EventEmitter<ShippingAddressData>();
  public tKeys = T;

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: [this.initialValues?.fullName || '', Validators.required],
      email: [this.initialValues?.email || '', [Validators.required, Validators.email]],
      phone: [this.initialValues?.phone || '', Validators.required],
      address1: [this.initialValues?.address1 || '', Validators.required],
      address2: [this.initialValues?.address2 || ''],
      city: [this.initialValues?.city || '', Validators.required],
      state: [this.initialValues?.state || '', Validators.required],
      zip: [this.initialValues?.zip || '', Validators.required],
      country: [this.initialValues?.country || 'USA', Validators.required],
      newsletter: [this.initialValues?.newsletter || false],
      terms: [this.initialValues?.terms || false, Validators.requiredTrue]
    });

    this.form.valueChanges.subscribe(() => {
      this.onFormUpdate();
    });
  }

  onFormUpdate(): void {
    if (this.form.valid) {
      this.formUpdate.emit(this.form.value);
    } else {
      // Optionally mark fields as touched to show errors as user types
      // this.form.markAllAsTouched();
    }
  }
}