import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedNotesComponent } from './shared-notes.component';

describe('SharedNotesComponent', () => {
  let component: SharedNotesComponent;
  let fixture: ComponentFixture<SharedNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SharedNotesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
