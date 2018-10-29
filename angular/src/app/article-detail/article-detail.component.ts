import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { Article } from '../article';
import { ArticlesService } from '../articles.service';
import { UsersService } from '../users.service';
import { User } from '../user';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {
  article: Article;
  author: User;

  currentUser: User;

  deleting = false;

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
    const id = +this.activatedRoute.snapshot.paramMap.get('id');
    this.articlesService.getArticle(id)
      .then(article => {
        this.article = article;
        if (this.article == null)
          this.router.navigate(["/sign_in"]);
        else
          return this.usersService.getUser(article.author_id)
            .then(user => this.author = user);
      });
  }

  back(): void {
    this.router.navigate(["/articles"]);
  }

  edit(): void {
    this.router.navigate([`/articles/${this.article.id}/edit`]);
  }

  delete(): void {
    if (this.deleting) return;
    this.deleting = true;

    this.articlesService.delete(this.article.id)
      .then(_ => this.deleting = false)
      .then(_ => this.router.navigate(["/articles"]));
  }
}
