import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnPolicyPageComponent } from './return-policy-page.component';

describe('ReturnPolicyPageComponent', () => {
  let component: ReturnPolicyPageComponent;
  let fixture: ComponentFixture<ReturnPolicyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnPolicyPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnPolicyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
