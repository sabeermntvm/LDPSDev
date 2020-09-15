import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultPredictionComponent } from './default-prediction.component';

describe('DefaultPredictionComponent', () => {
  let component: DefaultPredictionComponent;
  let fixture: ComponentFixture<DefaultPredictionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultPredictionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultPredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
