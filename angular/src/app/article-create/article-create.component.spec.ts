import { async, ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { Component, Input } from '@angular/core';

import { ArticleCreateComponent } from './article-create.component';
import { Article } from '../article';
import { User } from '../user';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../users.service';
import { ArticlesService } from '../articles.service';
import { Router } from '@angular/router';

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
}


describe('ArticleCreateComponent', () => {
  let component: ArticleCreateComponent;
  let fixture: ComponentFixture<ArticleCreateComponent>;
  let usersService: jasmine.SpyObj<UsersService>;
  let articlesService: jasmine.SpyObj<ArticlesService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getCurrentUser']);
    const articlesSpy = jasmine.createSpyObj('ArticlesService', ['write']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        ArticleCreateComponent,
        MockNgbTabset,
        MockNgbTab,
        MockArticleView,
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
    articlesService.write.and.returnValue(new Promise(resolve => resolve(mockArticle)));
    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleCreateComponent);
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

  it('should return to article list when back button pressed', async(() => {
    component.back();
    expect(router.navigate).toHaveBeenCalledWith(['/articles']);
  }));

  it('\'s write button is not respond on empty title or content or in submitting', async(() => {
    component.article = { title: null, content: null };
    component.write();
    component.article = { title: "", content: "" };
    component.write();
    component.article = { title: "foo", content: "bar" };
    component.submitting = true;
    component.write();
    expect(articlesService.write).toHaveBeenCalledTimes(0);
  }));

  it('should write new article', async(() => {
    const newArticle = {
      title: 'foo',
      content: 'bar',
    };
    const expectedArticle = {
      title: 'foo',
      content: 'bar',
      author_id: mockUser.id,
    }
    component.article = newArticle;
    component.write();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.submitting).toBeTruthy();
      expect(articlesService.write).toHaveBeenCalledWith(expectedArticle);
      expect(router.navigate).toHaveBeenCalledWith([`/articles/${mockArticle.id}`]);
    });
  }));
});
