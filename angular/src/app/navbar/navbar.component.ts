import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { User } from '../user';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Input() title: string;

  signedInSubscription: Subscription;
  signedOutSubscription: Subscription;

  currentUser: User;

  constructor(
    private router: Router,
    private usersService: UsersService,
  ) { }

  ngOnInit() {
    this.signedInSubscription = this.usersService.signedIn.subscribe(u => this.currentUser = u);
    this.signedOutSubscription = this.usersService.signedOut.subscribe(u => this.currentUser = null);
  }

  ngOnDestroy() {
    this.signedInSubscription.unsubscribe();
    this.signedOutSubscription.unsubscribe();
  }

  logout() {
    this.usersService.logout().then(_ => this.router.navigate(["/sign_in"]));
  }
}
