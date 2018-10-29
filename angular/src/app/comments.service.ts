import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Comment } from './comment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  constructor(private http: HttpClient) { }

  async getComments(article_id: number): Promise<Comment[]> {
    let comments = await this.http.get<Comment[]>("api/comments", httpOptions).toPromise();
    return comments.filter(c => c.article_id === article_id);
  }

  async write(comment: Partial<Comment>): Promise<Comment> {
    return await this.http.post<Comment>("api/comments", comment, httpOptions).toPromise();
  }

  async edit(comment: Comment): Promise<Comment> {
    await this.http.put(`api/comments/${comment.id}`, comment, httpOptions).toPromise();
    return comment;
  }

  async delete(id: number): Promise<void> {
    await this.http.delete(`api/comments/${id}`, httpOptions).toPromise();
  }
}
