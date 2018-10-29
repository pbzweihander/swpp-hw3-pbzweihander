import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

// Imports for loading & configuring the in-memory web api
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';

import { AppComponent } from './app.component';
import { SigninComponent } from './signin/signin.component';
import { ArticlesComponent } from './articles/articles.component';
import { AuthorIdToAuthorPipe } from './author-id-to-author.pipe';
import { ArticleCreateComponent } from './article-create/article-create.component';
import { ArticleDetailComponent } from './article-detail/article-detail.component';
import { CommentsComponent } from './comments/comments.component';
import { ArticleViewComponent } from './article-view/article-view.component';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from './navbar/navbar.component';
import { ArticleEditComponent } from './article-edit/article-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    ArticlesComponent,
    AuthorIdToAuthorPipe,
    ArticleCreateComponent,
    ArticleDetailComponent,
    CommentsComponent,
    ArticleViewComponent,
    NavbarComponent,
    ArticleEditComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientInMemoryWebApiModule.forRoot(
      InMemoryDataService, { dataEncapsulation: false }
    ),
    AppRoutingModule,
    NgbModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
