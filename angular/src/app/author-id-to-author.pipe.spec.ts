import { AuthorIdToAuthorPipe } from './author-id-to-author.pipe';

describe('AuthorIdToAuthorPipe', () => {
  it('create an instance', () => {
    const pipe = new AuthorIdToAuthorPipe();
    expect(pipe).toBeTruthy();
  });
});
