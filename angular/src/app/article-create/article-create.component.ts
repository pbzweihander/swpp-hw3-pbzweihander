import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ArticlesService } from '../articles.service';
import { UsersService } from '../users.service';
import { Article } from '../article';
import { User } from '../user';

@Component({
  selector: 'app-article-create',
  templateUrl: './article-create.component.html',
  styleUrls: ['./article-create.component.css']
})
export class ArticleCreateComponent implements OnInit {
  article: Partial<Article> = {};

  currentUser: User;

  submitting: boolean = false;

  constructor(
    private articlesService: ArticlesService,
    private usersService: UsersService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.currentUser = this.usersService.getCurrentUser();
    if (this.currentUser == null) {
      this.router.navigate(["/sign_in"]);
    }
  }

  back(): void {
    this.router.navigate(['/articles']);
  }

  write(): void {
    if (this.article.title == null || this.article.content == null) return;
    if (this.article.title.length == 0 || this.article.content.length == 0) return;

    if (this.submitting) return;
    this.submitting = true;

    this.article.author_id = this.currentUser.id;

    this.articlesService.write(this.article)
      .then(a => this.router.navigate([`/articles/${a.id}`]));
  }
}
