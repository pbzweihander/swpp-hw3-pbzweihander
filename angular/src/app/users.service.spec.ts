import { TestBed, inject, async } from '@angular/core/testing';
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
]

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

  it('should login with proper username and password', async(() => {
    usersService.signedIn.subscribe(user => expect(user).toEqual(mockUser))
    usersService.login(mockUser.email, mockUser.password)
      .then(user => expect(user).toEqual(mockUser));

    const req = httpTestingController.expectOne(userApi);
    expect(req.request.method).toEqual('GET');
    req.flush(mockUsers.concat([mockUser]));
  }));

  it('should not login with invalid password', async(() => {
    usersService.login(mockUser.email, 'invalid_password')
      .then(user => expect(user).toBeNull())
      .then(_ => expect(usersService.getCurrentUser()).toBeNull());

    const req = httpTestingController.expectOne(userApi);
    expect(req.request.method).toEqual('GET');
    req.flush(mockUsers.concat([mockUser]));
  }));

  it('should store signed user', async(() => {
    usersService.signedIn.subscribe(user => expect(user).toEqual(mockUser))
    usersService.login(mockUser.email, mockUser.password)
      .then(_ => expect(usersService.getCurrentUser()).toEqual(mockUser));

    const req = httpTestingController.expectOne(userApi);
    expect(req.request.method).toEqual('GET');
    req.flush(mockUsers.concat([mockUser]));
  }))
});
