import { TestBed, inject, async, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { UsersService } from './users.service';
import { User } from './user';

const mockUsers: User[] = [
  {
    id: 1,
    email: 'user1@email.test',
    password: 'user1password',
    name: 'user1',
    signed_in: false,
  },
  {
    id: 2,
    email: 'user2@email.test',
    password: 'user2password',
    name: 'user2',
    signed_in: false,
  },
];

const mockUser: User = {
  id: 3,
  email: 'user3@email.test',
  password: 'user3password',
  name: 'user3',
  signed_in: false,
};

describe('UsersService', () => {
  let httpTestingController: HttpTestingController;
  let usersService: UsersService;
  const userApi = 'api/user';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersService],
    });

    httpTestingController = TestBed.get(HttpTestingController);
    usersService = TestBed.get(UsersService);
  });

  it('should be created', inject([UsersService], (service: UsersService) => {
    expect(service).toBeTruthy();
  }));

  it('should get all users with get request', async(() => {
    usersService.getUsers().then(users => expect(users).toEqual(mockUsers));

    const req = httpTestingController.expectOne(userApi);
    expect(req.request.method).toEqual('GET');
    req.flush(mockUsers);
  }));

  it('should get a user of id with get request', async(() => {
    usersService.getUser(mockUser.id).then(user => expect(user).toEqual(mockUser));

    const req = httpTestingController.expectOne(`${userApi}/${mockUser.id}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockUser);
  }));

  it('should login with proper username and password', fakeAsync(() => {
    let emit = spyOn(usersService.signedIn, 'emit');
    usersService.login(mockUser.email, mockUser.password)
      .then(user => {
        expect(user).toEqual(mockUser);
        expect(emit).toHaveBeenCalledWith(mockUser);
      });

    const req1 = httpTestingController.expectOne(userApi);
    expect(req1.request.method).toEqual('GET');
    req1.flush(mockUsers.concat([mockUser]));

    tick();

    const req2 = httpTestingController.expectOne(`${userApi}/${mockUser.id}`);
    expect(req2.request.method).toEqual('PUT');
    req2.flush(mockUser);
  }));

  it('should not login with invalid password', async(() => {
    usersService.login(mockUser.email, 'invalid_password')
      .then(user => expect(user).toBeNull())
      .then(_ => expect(usersService.getCurrentUser()).toBeNull());

    const req = httpTestingController.expectOne(userApi);
    expect(req.request.method).toEqual('GET');
    req.flush(mockUsers.concat([mockUser]));
  }));

  it('should store signed user', fakeAsync(() => {
    usersService.signedIn.subscribe(user => expect(user).toEqual(mockUser))
    usersService.login(mockUser.email, mockUser.password)
      .then(_ => expect(usersService.getCurrentUser()).toEqual(mockUser));

    const req = httpTestingController.expectOne(userApi);
    expect(req.request.method).toEqual('GET');
    req.flush(mockUsers.concat([mockUser]));

    tick();

    const req2 = httpTestingController.expectOne(`${userApi}/${mockUser.id}`);
    expect(req2.request.method).toEqual('PUT');
    req2.flush(mockUser);
  }));

  it('should sign out', fakeAsync(() => {
    let emit = spyOn(usersService.signedOut, 'emit');
    usersService.login(mockUser.email, mockUser.password)
      .then(_ => {
        return usersService.logout()
      })
      .then(_ => {
        expect(emit).toHaveBeenCalled();
        expect(usersService.getCurrentUser()).toBeFalsy();
      });

    const req = httpTestingController.expectOne(userApi);
    expect(req.request.method).toEqual('GET');
    req.flush(mockUsers.concat([mockUser]));

    tick();

    const req2 = httpTestingController.expectOne(`${userApi}/${mockUser.id}`);
    expect(req2.request.method).toEqual('PUT');
    req2.flush(mockUser);

    tick();

    const req3 = httpTestingController.expectOne(`${userApi}/${mockUser.id}`);
    expect(req3.request.method).toEqual('PUT');
    req3.flush(mockUser);
  }));
});
