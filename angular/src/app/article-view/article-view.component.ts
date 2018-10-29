import { Component, OnInit, Input } from '@angular/core';
import { Article } from '../article';
import { User } from '../user';

@Component({
  selector: 'app-article-view',
  templateUrl: './article-view.component.html',
  styleUrls: ['./article-view.component.css']
})
export class ArticleViewComponent implements OnInit {
  @Input() article: Article;
  @Input() author: User;

  constructor() { }

  ngOnInit() {
  }

}
