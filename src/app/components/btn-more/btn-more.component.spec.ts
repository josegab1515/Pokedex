import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnMoreComponent } from './btn-more.component';

describe('BtnMoreComponent', () => {
  let component: BtnMoreComponent;
  let fixture: ComponentFixture<BtnMoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnMoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
