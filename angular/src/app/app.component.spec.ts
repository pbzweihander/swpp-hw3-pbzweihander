import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';

@Component({ selector: 'app-navbar', template: '' })
class MockNavbar {
  @Input() title: string;
}

@Component({ selector: 'router-outlet', template: '' })
class MockRouterOutlet {
}


describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MockNavbar,
        MockRouterOutlet,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', async(() => {
    expect(component).toBeTruthy();
  }));

  it(`should have as title 'SWPP HW-2'`, async(() => {
    expect(component.title).toEqual('SWPP HW-2');
  }));
});
