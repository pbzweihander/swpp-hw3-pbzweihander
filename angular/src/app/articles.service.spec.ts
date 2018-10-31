import { TestBed, inject, async } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { ArticlesService } from './articles.service';
import { Article } from './article';

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

const mockArticle: Article = {
  id: 3,
  author_id: 3,
  title: 'article 3 title',
  content: 'article 3 content',
}

describe('ArticlesService', () => {
  let httpTestingController: HttpTestingController;
  let articlesService: ArticlesService;
  const articleApi = 'api/articles';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ArticlesService]
    });
    httpTestingController = TestBed.get(HttpTestingController);
    articlesService = TestBed.get(ArticlesService);
  });

  it('should be created', inject([ArticlesService], (service: ArticlesService) => {
    expect(service).toBeTruthy();
  }));

  it('should get all articles with get request', async(() => {
    articlesService.getArticles().then(articles => expect(articles).toEqual(mockArticles));

    const req = httpTestingController.expectOne(articleApi);
    expect(req.request.method).toEqual('GET');
    req.flush(mockArticles);
  }));

  it('should get article of id with get request', async(() => {
    articlesService.getArticle(mockArticle.id).then(article => expect(article).toEqual(mockArticle));

    const req = httpTestingController.expectOne(`${articleApi}/${mockArticle.id}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockArticle);
  }));

  it('should write article with post request', async(() => {
    const newArticle = {
      author_id: 0,
      title: 'new article title',
      content: 'new article content',
    }
    articlesService.write(newArticle).then(article => expect(article).toEqual(mockArticle));

    const req = httpTestingController.expectOne(articleApi);
    expect(req.request.method).toEqual('POST');
    req.flush(mockArticle);
  }));

  it('should edit article with put request', async(() => {
    articlesService.edit(mockArticle)
      .then(article => expect(article).toEqual(mockArticle));

    const req = httpTestingController.expectOne(`${articleApi}/${mockArticle.id}`);
    expect(req.request.method).toEqual('PUT');
    req.flush(mockArticle);
  }));

  it('should delete article with delete request', async(() => {
    articlesService.delete(mockArticle.id);

    const req = httpTestingController.expectOne(`${articleApi}/${mockArticle.id}`);
    expect(req.request.method).toEqual('DELETE');
    req.flush({});
  }));
});
