import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { SigninComponent } from './signin.component';
import { UsersService } from '../users.service';
import { Router } from '@angular/router';
import { User } from '../user';

const mockUser: User = {
  id: 3,
  email: 'user3@email.test',
  password: 'user3password',
  name: 'user3',
  signed_in: false,
};

describe('SigninComponent', () => {
  let component: SigninComponent;
  let fixture: ComponentFixture<SigninComponent>;
  let usersService: jasmine.SpyObj<UsersService>;
  let router: jasmine.SpyObj<Router>;
  let alert: jasmine.Spy;


  beforeEach(async(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [SigninComponent],
      providers: [
        { provide: UsersService, useValue: usersSpy },
        { provide: Router, useValue: routerSpy },
      ]
    })
      .compileComponents();

    usersService = TestBed.get(UsersService);
    usersService.login.and.returnValue(new Promise(r => r(mockUser)));
    router = TestBed.get(Router);
    alert = spyOn(window, 'alert');
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not respone', async(() => {
    component.submitting = true;
    component.signin();
    expect(usersService.login).toHaveBeenCalledTimes(0);
  }));

  it('should login', async(() => {
    component.loginForm = {
      email: 'foo',
      password: 'bar',
    };
    component.signin();
    expect(component.submitting).toBeTruthy();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith(['/articles']);
    });
  }));

  it('should not login', async(() => {
    usersService.login.and.returnValue(new Promise(r => r(null)));
    component.loginForm = {
      email: 'foo',
      password: 'bar',
    };
    component.signin();
    expect(component.submitting).toBeTruthy();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(alert).toHaveBeenCalled();
      expect(component.submitting).toBeFalsy();
    });
  }));
});
