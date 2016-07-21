import {Component, Input, Output, EventEmitter} from '@angular/core';
import {AuthService} from '../../services/auth-service';


@Component({
  templateUrl: 'build/pages/hello-ionic/hello-ionic.html'
})
export class HelloIonicPage {
  user: any;

  constructor(
    private AuthService: AuthService
  ) {
    this.AuthService.updateUserInfo.subscribe(user => console.log('event! 222'));

    this.AuthService.isAuthorized().then(data => {
        if(data) {
          this.AuthService.getUser().then(data => {
            this.user = JSON.parse(data);
            console.log(this.user);
          });
        }
    });
  }
}
