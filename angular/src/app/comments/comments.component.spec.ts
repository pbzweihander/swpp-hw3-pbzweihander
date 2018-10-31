import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CommentsComponent } from './comments.component';
import { UsersService } from '../users.service';
import { Article } from '../article';
import { User } from '../user';
import { CommentsService } from '../comments.service';
import { Comment } from '../comment';
import { ActivatedRoute } from '@angular/router';

class MockActivatedRoute { }

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

const mockComments: Comment[] = [
  {
    id: 1,
    article_id: mockArticle.id,
    author_id: 1,
    content: "comment 1 content",
  },
  {
    id: 2,
    article_id: mockArticle.id,
    author_id: 2,
    content: "comment 2 content",
  },
];

const mockComment: Comment = {
  id: 3,
  article_id: mockArticle.id,
  author_id: 3,
  content: "comment 3 content",
};

@Pipe({
  name: 'authorIdToAuthor'
})
class MockAuthorIdToAuthorPipe implements PipeTransform {
  transform(id: number, args?: any): Promise<string> {
    return new Promise(r => r(mockUser.name));
  }
}

describe('CommentsComponent', () => {
  let component: CommentsComponent;
  let fixture: ComponentFixture<CommentsComponent>;
  let usersService: jasmine.SpyObj<UsersService>;
  let commentsService: jasmine.SpyObj<CommentsService>;
  let prompt: jasmine.Spy;

  beforeEach(async(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getCurrentUser']);
    const commentsSpy = jasmine.createSpyObj('CommentsService', ['getComments', 'write', 'delete', 'edit']);

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        CommentsComponent,
        MockAuthorIdToAuthorPipe,
      ],
      providers: [
        { provide: UsersService, useValue: usersSpy },
        { provide: CommentsService, useValue: commentsSpy },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
      ],
    })
      .compileComponents();

    usersService = TestBed.get(UsersService);
    usersService.getCurrentUser.and.returnValue(mockUser);
    commentsService = TestBed.get(CommentsService);
    commentsService.getComments.and.returnValue(new Promise(r => r(mockComments)));
    commentsService.write.and.returnValue(new Promise(r => r(mockComment)));
    commentsService.edit.and.returnValue(new Promise(r => r(mockComment)));
    commentsService.delete.and.returnValue(new Promise(r => r()));
    prompt = spyOn(window, 'prompt');
    prompt.and.returnValue("foo");
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get comments', async(() => {
    component.ngOnInit();
    expect(component.currentUser).toEqual(mockUser);
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.comments).toEqual(mockComments);
    });
  }));

  it('should not respond to new button', async(() => {
    component.newCommentContent = "";
    component.newComment();
    component.newCommentContent = "new comment content";
    component.submitting = true;
    component.newComment();
    expect(commentsService.write).toHaveBeenCalledTimes(0);
  }));

  it('should write new comment', async(() => {
    component.articleId = mockArticle.id;
    component.currentUser = mockUser;
    component.newCommentContent = "new comment content";
    component.newComment();
    expect(component.submitting).toBeTruthy();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.submitting).toBeFalsy();
      expect(commentsService.write).toHaveBeenCalledWith({
        article_id: mockArticle.id,
        author_id: mockUser.id,
        content: "new comment content",
      });
    });
  }));

  it('should not respond to delete button', async(() => {
    component.deleting = true;
    component.deleteComment(0);
    expect(commentsService.delete).toHaveBeenCalledTimes(0);
  }));

  it('should delete comment', async(() => {
    component.deleteComment(1);
    expect(component.deleting).toBeTruthy();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.deleting).toBeFalsy();
      expect(commentsService.delete).toHaveBeenCalledWith(1);
    });
  }));

  it('should edit comment', async(() => {
    component.comments = mockComments;
    component.editComment(mockComments[0].id);

    expect(commentsService.edit).toHaveBeenCalledWith({
      id: mockComments[0].id,
      article_id: mockComments[0].article_id,
      author_id: mockComments[0].author_id,
      content: "foo",
    });
  }))
});
