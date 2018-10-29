import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

import { CommentsService } from '../comments.service';
import { UsersService } from '../users.service';
import { Comment } from '../comment';
import { User } from '../user';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  @Input() articleId: number;

  comments: Comment[];

  currentUser: User;

  newCommentContent: string;

  submitting = false;
  deleting = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private commentsService: CommentsService,
    private usersService: UsersService,
  ) { }

  ngOnInit() {
    this.currentUser = this.usersService.getCurrentUser();
    this.getComments();
  }

  getComments(): void {
    this.commentsService.getComments(this.articleId).then(comments => this.comments = comments);
  }

  newComment(): void {
    if (this.newCommentContent.length == 0) return;

    if (this.submitting) return;
    this.submitting = true;

    let comment: Partial<Comment> = {
      article_id: this.articleId,
      author_id: this.currentUser.id,
      content: this.newCommentContent,
    };
    this.commentsService.write(comment)
      .then(comment => { this.submitting = false; return comment; })
      .then(comment => this.comments.push(comment));
  }

  deleteComment(id: number): void {
    if (this.deleting) return;
    this.deleting = true;

    this.commentsService.delete(id)
      .then(_ => this.deleting = false)
      .then(_ => this.comments = this.comments.filter(c => c.id !== id));
  }

  editComment(id: number): void {
    let content = prompt("Edit comment:");

    let comment = this.comments.filter(c => c.id === id)[0];
    comment.content = content;

    this.commentsService.edit(comment);
  }
}
