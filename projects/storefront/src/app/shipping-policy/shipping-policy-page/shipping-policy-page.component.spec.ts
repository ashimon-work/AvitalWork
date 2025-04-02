import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingPolicyPageComponent } from './shipping-policy-page.component';

describe('ShippingPolicyPageComponent', () => {
  let component: ShippingPolicyPageComponent;
  let fixture: ComponentFixture<ShippingPolicyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingPolicyPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingPolicyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
