import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigPainelComponent } from './config-painel.component';

describe('ConfigPainelComponent', () => {
  let component: ConfigPainelComponent;
  let fixture: ComponentFixture<ConfigPainelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigPainelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigPainelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
