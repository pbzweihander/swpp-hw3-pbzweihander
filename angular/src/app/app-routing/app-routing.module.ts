import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";

import { SigninComponent } from "../signin/signin.component";
import { ArticlesComponent } from '../articles/articles.component';
import { ArticleCreateComponent } from '../article-create/article-create.component';
import { ArticleDetailComponent } from '../article-detail/article-detail.component';
import { ArticleEditComponent } from '../article-edit/article-edit.component';

const routes: Routes = [
  { path: '', redirectTo: '/sign_in', pathMatch: 'full' },
  { path: 'sign_in', component: SigninComponent },
  { path: 'articles/:id/edit', component: ArticleEditComponent },
  { path: 'articles/:id', component: ArticleDetailComponent },
  { path: 'article/create', component: ArticleCreateComponent },
  { path: 'articles', component: ArticlesComponent },
  { path: '**', redirectTo: '/sign_in' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})

export class AppRoutingModule { }
