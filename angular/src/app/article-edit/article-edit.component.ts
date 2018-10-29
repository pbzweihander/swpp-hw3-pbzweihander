import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { Article } from '../article';
import { ArticlesService } from '../articles.service';
import { UsersService } from '../users.service';
import { User } from '../user';

@Component({
  selector: 'app-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.css']
})
export class ArticleEditComponent implements OnInit {
  articleId: number;
  article: Article;
  origArticle: Article;

  currentUser: User;

  submitting = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private articlesService: ArticlesService,
    private usersService: UsersService,
  ) { }

  ngOnInit() {
    this.currentUser = this.usersService.getCurrentUser();
    if (this.currentUser == null) {
      this.router.navigate(["/sign_in"]);
    } else {
      this.getArticle();
    }
  }

  getArticle(): void {
    this.articleId = +this.activatedRoute.snapshot.paramMap.get('id');
    this.articlesService.getArticle(this.articleId)
      .then(article => {
        this.article = article;
        this.origArticle = article;
        if (this.article == null)
          this.router.navigate(["/sign_in"]);
      });
  }

  back(): void {
    if (this.article.title === this.origArticle.title && this.article.content === this.origArticle.content)
      this.router.navigate([`/articles/${this.articleId}`]);
    else {
      let confirmation = confirm("Are you sure? The change will be lost.");
      if (confirmation) {
        this.router.navigate([`/articles/${this.articleId}`]);
      }
    }
  }

  submit(): void {
    if (this.article.title.length == 0 || this.article.content.length == 0) return;

    if (this.submitting) return;
    this.submitting = true;

    this.articlesService.edit(this.article)
      .then(_ => this.submitting = false)
      .then(_ => this.router.navigate([`/articles/${this.articleId}`]));
  }
}
