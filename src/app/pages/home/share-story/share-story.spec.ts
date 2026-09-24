import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareStory } from './share-story';

describe('ShareStory', () => {
  let component: ShareStory;
  let fixture: ComponentFixture<ShareStory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareStory],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareStory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
