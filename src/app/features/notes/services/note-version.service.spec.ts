import { TestBed } from '@angular/core/testing';

import { NoteVersionService } from './note-version.service';

describe('NoteVersionService', () => {
  let service: NoteVersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoteVersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
