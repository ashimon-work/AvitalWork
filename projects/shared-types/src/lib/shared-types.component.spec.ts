import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedTypesComponent } from './shared-types.component';

describe('SharedTypesComponent', () => {
  let component: SharedTypesComponent;
  let fixture: ComponentFixture<SharedTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
