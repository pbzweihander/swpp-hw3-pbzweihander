import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';

import { ArticleEditComponent } from './article-edit.component';
import { User } from '../user';
import { Article } from '../article';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../users.service';
import { ArticlesService } from '../articles.service';
import { FormsModule } from '@angular/forms';

@Component({ selector: 'ngb-tabset', template: '' })
class MockNgbTabset {
}

@Component({ selector: 'ngb-tab', template: '' })
class MockNgbTab {
  @Input() title: string;
  @Input() id: string;
}

@Component({ selector: 'app-article-view', template: '' })
class MockArticleView {
  @Input() article: Article;
  @Input() author: User;
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
  title: 'article 3 title',
  content: 'article 3 content',
};

const mockArticleEdited: Article = {
  id: 3,
  author_id: mockUser.id,
  title: 'article 3 title edited',
  content: 'article 3 content edited',
};

const emptyArticle: Article = {
  id: 0,
  author_id: 0,
  title: "",
  content: "",
};

describe('ArticleEditComponent', () => {
  let component: ArticleEditComponent;
  let fixture: ComponentFixture<ArticleEditComponent>;
  let usersService: jasmine.SpyObj<UsersService>;
  let articlesService: jasmine.SpyObj<ArticlesService>;
  let router: jasmine.SpyObj<Router>;
  let confirm: jasmine.Spy;

  beforeEach(async(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getCurrentUser']);
    const articlesSpy = jasmine.createSpyObj('ArticlesService', ['getArticle', 'edit']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        ArticleEditComponent,
        MockNgbTabset,
        MockNgbTab,
        MockArticleView,
      ],
      providers: [
        { provide: UsersService, useValue: usersSpy },
        { provide: ArticlesService, useValue: articlesSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
      ],
    })
      .compileComponents();

    usersService = TestBed.get(UsersService);
    usersService.getCurrentUser.and.returnValue(mockUser);
    articlesService = TestBed.get(ArticlesService);
    articlesService.getArticle.and.returnValue(new Promise(r => r(mockArticle)));
    articlesService.edit.and.returnValue(new Promise(r => r(mockArticleEdited)));
    router = TestBed.get(Router);
    confirm = spyOn(window, 'confirm');
    confirm.and.returnValue(true);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleEditComponent);
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
      expect(component.origArticle).toEqual(mockArticle);
    });
  }));

  it('should return to signin when article is unavailable', async(() => {
    articlesService.getArticle.and.returnValue(new Promise(r => r(null)));
    component.ngOnInit();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(articlesService.getArticle).toHaveBeenCalledWith(mockArticle.id);
      expect(component.article).toEqual(null);
      expect(component.origArticle).toEqual(null);
      expect(router.navigate).toHaveBeenCalledWith(['/sign_in']);
    });
  }));

  it('should return to article list when back button pressed if nothing changed', async(() => {
    component.origArticle = mockArticle;
    component.article = mockArticle;
    component.back();
    expect(router.navigate).toHaveBeenCalledWith([`/articles/${mockArticle.id}`]);
  }));

  it('should confirm and return when something changed', async(() => {
    component.origArticle = mockArticle;
    component.article = mockArticleEdited;
    component.back();

    expect(confirm).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith([`/articles/${mockArticle.id}`]);
  }));

  it('should not return when user choose no', async(() => {
    confirm.and.returnValue(false);
    component.origArticle = mockArticle;
    component.article = mockArticleEdited;
    component.back();

    expect(confirm).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledTimes(0);
  }));

  it('\'s confirm button does not respond when title or content is empty or already submitting', async(() => {
    component.article = emptyArticle;
    component.submit();
    component.article = mockArticleEdited;
    component.submitting = true;
    component.submit();
    expect(articlesService.edit).toHaveBeenCalledTimes(0);
  }));

  it('should edit article', async(() => {
    component.article = mockArticleEdited;
    component.submit();
    expect(component.submitting).toBeTruthy();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.submitting).toBeFalsy();
      expect(articlesService.edit).toHaveBeenCalledWith(mockArticleEdited);
      expect(router.navigate).toHaveBeenCalledWith([`/articles/${mockArticle.id}`]);
    });
  }))
});
