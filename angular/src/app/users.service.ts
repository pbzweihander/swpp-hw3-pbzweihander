import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from './user';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  signedIn = new EventEmitter<User>();
  signedOut = new EventEmitter();

  private signedUser: User = null;

  constructor(private http: HttpClient) { }

  async getUsers(): Promise<User[]> {
    return await this.http.get<User[]>("api/user", httpOptions).toPromise();
  }

  async getUser(id: number): Promise<User> {
    return await this.http.get<User>(`api/user/${id}`, httpOptions).toPromise();
  }

  async login(email: string, password): Promise<User> {
    let users = await this.getUsers();
    let u = users.filter(u => u.email === email && u.password === password);
    if (u.length == 0)
      return null;
    else {
      let user = u[0];
      user.signed_in = true;
      await this.http.put(`api/user/${user.id}`, user, httpOptions).toPromise();
      this.signedIn.emit(user);
      this.signedUser = user;
      return user;
    }
  }

  async logout(): Promise<void> {
    this.signedUser.signed_in = false;
    await this.http.put(`api/user/${this.signedUser.id}`, this.signedUser, httpOptions).toPromise();
    this.signedOut.emit();
    this.signedUser = null;
  }

  getCurrentUser(): User {
    return this.signedUser;
  }
}
