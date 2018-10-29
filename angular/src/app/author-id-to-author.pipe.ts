import { Pipe, PipeTransform } from '@angular/core';
import { UsersService } from './users.service';

@Pipe({
  name: 'authorIdToAuthor'
})
export class AuthorIdToAuthorPipe implements PipeTransform {
  constructor(private usersService: UsersService) { }

  async transform(id: number, args?: any): Promise<string> {
    let user = await this.usersService.getUser(id);
    return user.name;
  }
}
