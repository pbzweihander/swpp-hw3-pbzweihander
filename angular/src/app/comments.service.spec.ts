import { TestBed, inject, async } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { CommentsService } from './comments.service';
import { Comment } from './comment';

const articleId: number = 1;

const mockComments: Comment[] = [
  {
    id: 1,
    article_id: articleId,
    author_id: 1,
    content: "comment 1 content",
  },
  {
    id: 2,
    article_id: articleId,
    author_id: 2,
    content: "comment 2 content",
  },
];

const mockComment: Comment = {
  id: 3,
  article_id: articleId,
  author_id: 3,
  content: "comment 3 content",
};

describe('CommentsService', () => {
  let httpTestingController: HttpTestingController;
  let commentsService: CommentsService;
  const commentApi = `api/comments`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommentsService],
    });

    httpTestingController = TestBed.get(HttpTestingController);
    commentsService = TestBed.get(CommentsService);
  });

  it('should be created', inject([CommentsService], (service: CommentsService) => {
    expect(service).toBeTruthy();
  }));

  it('should get all comments with get request', async(() => {
    commentsService.getComments(articleId).then(comments => expect(comments).toEqual(mockComments));

    const req = httpTestingController.expectOne(commentApi);
    expect(req.request.method).toEqual('GET');
    req.flush(mockComments);
  }));

  it('should write comment with post request', async(() => {
    const newComment = {
      author_id: 0,
      article_id: 0,
      content: 'new comment content',
    }
    commentsService.write(newComment).then(comment => expect(comment).toEqual(mockComment));

    const req = httpTestingController.expectOne(commentApi);
    expect(req.request.method).toEqual('POST');
    req.flush(mockComment);
  }));

  it('should edit comment with put request', async(() => {
    commentsService.edit(mockComment).then(comment => expect(comment).toEqual(mockComment));

    const req = httpTestingController.expectOne(`${commentApi}/${mockComment.id}`);
    expect(req.request.method).toEqual('PUT');
    req.flush(mockComment);
  }));

  it('should delete article with delete request', async(() => {
    commentsService.delete(mockComment.id);

    const req = httpTestingController.expectOne(`${commentApi}/${mockComment.id}`);
    expect(req.request.method).toEqual('DELETE');
    req.flush({});
  }));
});
