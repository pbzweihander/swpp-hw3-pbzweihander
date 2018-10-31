import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';
import { UsersService } from '../users.service';
import { Router } from '@angular/router';
import { User } from '../user';
import { EventEmitter } from '@angular/core';

const mockUser: User = {
  id: 3,
  email: 'user3@email.test',
  password: 'user3password',
  name: 'user3',
  signed_in: false,
};

class MockUserService {
  signedIn = new EventEmitter<User>();
  signedOut = new EventEmitter();

  getCurrentUser(): User {
    return mockUser;
  }

  async logout(): Promise<void> {
    return;
  }
}

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let usersService: jasmine.SpyObj<UsersService>;
  let usersServiceLogout: jasmine.Spy;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      providers: [
        { provide: UsersService, useClass: MockUserService },
        { provide: Router, useValue: routerSpy },
      ],
    })
      .compileComponents();

    usersService = TestBed.get(UsersService);
    router = TestBed.get(Router);
    usersServiceLogout = spyOn(usersService, 'logout');
    usersServiceLogout.and.returnValue(new Promise(r => r()));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe', async(() => {
    component.ngOnInit();
    fixture.whenStable()
      .then(() => {
        fixture.detectChanges();
        component.ngOnDestroy();
        expect(component.signedInSubscription).toBeTruthy();
        expect(component.signedOutSubscription).toBeTruthy();
        usersService.signedIn.emit(mockUser);
        return fixture.whenStable();
      })
      .then(() => {
        fixture.detectChanges();
        expect(component.currentUser).toEqual(mockUser);
        usersService.signedOut.emit();
        return fixture.whenStable();
      })
      .then(() => {
        fixture.detectChanges();
        expect(component.currentUser).toBeFalsy();
      });
  }));

  it('should unsubscribe', async(() => {
    component.ngOnInit();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      component.ngOnDestroy();
      expect(component.signedInSubscription.closed).toBeTruthy();
      expect(component.signedOutSubscription.closed).toBeTruthy();
    })
  }));

  it('should logout', async(() => {
    component.logout();
    fixture.whenStable().then(() => {
      expect(usersServiceLogout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/sign_in']);
    });
  }));
});
