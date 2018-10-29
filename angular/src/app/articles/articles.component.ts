import { Component, OnInit } from '@angular/core';
import { Article } from '../article';
import { ArticlesService } from "../articles.service";
import { Router } from '@angular/router';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {
  articles: Article[];

  constructor(
    private articlesService: ArticlesService,
    private usersService: UsersService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (this.usersService.getCurrentUser() == null) {
      this.router.navigate(["/sign_in"]);
    } else {
      this.getArticles();
    }
  }

  getArticles(): void {
    this.articlesService.getArticles().then(articles => this.articles = articles);
  }

  createArticle(): void {
    this.router.navigate(["/article/create"]);
  }
}
