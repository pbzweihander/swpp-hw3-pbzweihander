import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Article } from './article';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {
  constructor(private http: HttpClient) { }

  async getArticles(): Promise<Article[]> {
    return await this.http.get<Article[]>("api/articles", httpOptions).toPromise();
  }

  async getArticle(id: number): Promise<Article> {
    return await this.http.get<Article>(`api/articles/${id}`, httpOptions).toPromise();
  }

  async write(article: Partial<Article>): Promise<Article> {
    return await this.http.post<Article>("api/articles", article, httpOptions).toPromise();
  }

  async edit(article: Article): Promise<Article> {
    await this.http.put(`api/articles/${article.id}`, article, httpOptions).toPromise();
    return article;
  }

  async delete(id: number): Promise<void> {
    await this.http.delete(`api/articles/${id}`, httpOptions).toPromise();
  }
}
