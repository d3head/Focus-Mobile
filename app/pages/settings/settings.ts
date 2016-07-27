import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Nav} from 'ionic-angular';
import {AuthService} from '../../services/auth-service';
import {StartScreen} from '../../pages/start-screen/start-screen';


@Component({
  templateUrl: 'build/pages/settings/settings.html'
})
export class SettingsScreen {
  user: any;

  constructor(
    private AuthService: AuthService,
    private nav: Nav
  ) {
    this.user = [];

    this.AuthService.getUser().then(data => {
      this.user = JSON.parse(data);
    });

  }

  logout() {
    this.AuthService.logout();
    this.nav.setRoot(StartScreen);
  }
}
