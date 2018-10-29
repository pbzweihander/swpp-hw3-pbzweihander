import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UsersService } from '../users.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  loginForm = {
    email: "",
    password: "",
  };
  submitting = false;

  constructor(
    private usersService: UsersService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  signin(): void {
    if (this.submitting) return;
    this.submitting = true;

    this.usersService.login(this.loginForm.email, this.loginForm.password).then(user => {
      if (user == null) {
        alert("Email or password is wrong");
        this.submitting = false;
      } else {
        this.router.navigate(['/articles']);
      }
    });
  }
}
