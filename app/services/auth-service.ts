import {Injectable, Output, EventEmitter} from '@angular/core';
import {Storage, LocalStorage} from 'ionic-angular';

@Injectable()
export class AuthService {
  authStatus: boolean;
  local: any;
  user: any;
  @Output() updateUserInfo = new EventEmitter();

  constructor() {
    this.authStatus = false;
    this.local = new Storage(LocalStorage);
  }

  isAuthorized() {
    return this.local.get('token');
  }

  login(data) {
    this.local.set('token', data.token);
    this.local.set('user', JSON.stringify(data.user[0]));
    this.user = JSON.stringify(data.user[0]);
    this.updateUserInfo.emit(this.user);
  }

  logout() {
    this.local.remove('token', null);
    this.local.remove('user', null);
  }

  getUser() {
    return this.local.get('user');
  }
}
