import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComputorComponent } from './computor.component';

describe('ComputorComponent', () => {
  let component: ComputorComponent;
  let fixture: ComponentFixture<ComputorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComputorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComputorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
