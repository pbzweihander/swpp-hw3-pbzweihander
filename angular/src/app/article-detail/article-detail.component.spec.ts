import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';

import { ArticleDetailComponent } from './article-detail.component';
import { User } from '../user';
import { Article } from '../article';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../users.service';
import { ArticlesService } from '../articles.service';

@Component({ selector: 'app-article-view', template: '' })
class MockArticleView {
  @Input() article: Article;
  @Input() author: User;
}

@Component({ selector: 'app-comments', template: '' })
class MockComments {
  @Input() articleId: number;
}

class MockParamMap {
  get(id): number {
    expect(id).toEqual('id');
    return mockArticle.id;
  }
}

class MockSnapshot {
  paramMap = new MockParamMap();
}

class MockActivatedRoute {
  snapshot = new MockSnapshot();
}

const mockUser: User = {
  id: 3,
  email: 'user3@email.test',
  password: 'user3password',
  name: 'user3',
  signed_in: false,
};

const mockArticle: Article = {
  id: 3,
  author_id: mockUser.id,
  title: 'test article 3 title',
  content: 'test article 3 content',
}

describe('ArticleDetailComponent', () => {
  let component: ArticleDetailComponent;
  let fixture: ComponentFixture<ArticleDetailComponent>;
  let usersService: jasmine.SpyObj<UsersService>;
  let articlesService: jasmine.SpyObj<ArticlesService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getCurrentUser', 'getUser']);
    const articlesSpy = jasmine.createSpyObj('ArticlesService', ['getArticle', 'delete']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [
        ArticleDetailComponent,
        MockArticleView,
        MockComments,
      ],
      providers: [
        { provide: UsersService, useValue: usersSpy },
        { provide: ArticlesService, useValue: articlesSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
      ]
    })
      .compileComponents();

    usersService = TestBed.get(UsersService);
    usersService.getCurrentUser.and.returnValue(mockUser);
    usersService.getUser.and.returnValue(new Promise(r => r(mockUser)));
    articlesService = TestBed.get(ArticlesService);
    articlesService.getArticle.and.returnValue(new Promise(r => r(mockArticle)));
    articlesService.delete.and.returnValue(new Promise(r => r()));
    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleDetailComponent);
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

  it('should get article', async(() => {
    component.ngOnInit();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(articlesService.getArticle).toHaveBeenCalledWith(mockArticle.id);
      expect(component.article).toEqual(mockArticle);
      expect(usersService.getUser).toHaveBeenCalledWith(mockUser.id);
      expect(component.author).toEqual(mockUser);
    });
  }));

  it('should return to article list when article is unavailable', async(() => {
    articlesService.getArticle.and.returnValue(new Promise(r => r(null)));
    component.ngOnInit();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(articlesService.getArticle).toHaveBeenCalledWith(mockArticle.id);
      expect(component.article).toEqual(null);
      expect(router.navigate).toHaveBeenCalledWith(['/articles']);
    });
  }));

  it('should return to article list when back button pressed', async(() => {
    component.back();
    expect(router.navigate).toHaveBeenCalledWith(['/articles']);
  }));

  it('should navigate to article edit when edit button pressed', async(() => {
    component.article = mockArticle;
    component.edit();
    expect(router.navigate).toHaveBeenCalledWith([`/articles/${mockArticle.id}/edit`]);
  }));

  it('\'s delete button does not respond when deleting', async(() => {
    component.deleting = true;
    component.delete();
    expect(articlesService.delete).toHaveBeenCalledTimes(0);
  }));

  it('should delete article', async(() => {
    component.article = mockArticle;
    component.delete();
    expect(component.deleting).toBeTruthy();
    expect(articlesService.delete).toHaveBeenCalledWith(mockArticle.id);

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.deleting).toBeFalsy();
      expect(router.navigate).toHaveBeenCalledWith(['/articles']);
    });
  }));
});
