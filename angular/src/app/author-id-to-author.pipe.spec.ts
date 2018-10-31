import { TestBed, async, ComponentFixture, inject } from '@angular/core/testing'
import { AuthorIdToAuthorPipe } from './author-id-to-author.pipe';

import { UsersService } from './users.service';
import { User } from './user';

const mockUser: User = {
  id: 3,
  email: 'user3@email.test',
  password: 'user3password',
  name: 'user3',
  signed_in: false,
};

describe('AuthorIdToAuthorPipe', () => {
  let pipe: AuthorIdToAuthorPipe;
  let usersService: jasmine.SpyObj<UsersService>;

  beforeEach(async(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getUser']);

    TestBed.configureTestingModule({
      providers: [
        { provide: UsersService, useValue: usersSpy },
        AuthorIdToAuthorPipe,
      ],
    });
    usersService = TestBed.get(UsersService);
    usersService.getUser.and.returnValue(new Promise(resolve => resolve(mockUser)));
    pipe = TestBed.get(AuthorIdToAuthorPipe);
  }));

  it('create an instance', inject([AuthorIdToAuthorPipe], (pipe) => {
    expect(pipe).toBeTruthy();
  }));

  it('should get user name from id', async(async () => {
    let name = await pipe.transform(mockUser.id);
    expect(name).toEqual(mockUser.name);
  }));
});
