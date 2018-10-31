import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PipeTransform, Pipe, Component, Input } from '@angular/core';

import { ArticlesComponent } from './articles.component';
import { User } from '../user';
import { Article } from '../article';
import { UsersService } from '../users.service';
import { ArticlesService } from '../articles.service';
import { Router } from '@angular/router';

@Component({ selector: 'button', template: '' })
class MockButton {
  @Input() routerLink;
  @Input() class;
}

const mockUser: User = {
  id: 3,
  email: 'user3@email.test',
  password: 'user3password',
  name: 'user3',
  signed_in: false,
};

const mockArticles: Article[] = [
  {
    id: 1,
    author_id: 1,
    title: 'article 1 title',
    content: 'article 1 content',
  },
  {
    id: 2,
    author_id: 2,
    title: 'article 2 title',
    content: 'article 2 content',
  }
];

@Pipe({
  name: 'authorIdToAuthor'
})
class MockAuthorIdToAuthorPipe implements PipeTransform {
  transform(id: number, args?: any): Promise<string> {
    return new Promise(r => r(mockUser.name));
  }
}

describe('ArticlesComponent', () => {
  let component: ArticlesComponent;
  let fixture: ComponentFixture<ArticlesComponent>;
  let usersService: jasmine.SpyObj<UsersService>;
  let articlesService: jasmine.SpyObj<ArticlesService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getCurrentUser']);
    const articlesSpy = jasmine.createSpyObj('ArticlesService', ['getArticles']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
      ],
      declarations: [
        ArticlesComponent,
        MockAuthorIdToAuthorPipe,
        MockButton,
      ],
      providers: [
        { provide: UsersService, useValue: usersSpy },
        { provide: ArticlesService, useValue: articlesSpy },
        { provide: Router, useValue: routerSpy },
      ]
    })
      .compileComponents();

    usersService = TestBed.get(UsersService);
    usersService.getCurrentUser.and.returnValue(mockUser);
    articlesService = TestBed.get(ArticlesService);
    articlesService.getArticles.and.returnValue(new Promise(resolve => resolve(mockArticles)));
    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to signin when not signed in', async(() => {
    usersService.getCurrentUser.and.returnValue(null);
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/sign_in']);
  }));

  it('should get articles', async(() => {
    component.ngOnInit();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(articlesService.getArticles).toHaveBeenCalled();
      expect(component.articles).toEqual(mockArticles);
    });
  }));
});
