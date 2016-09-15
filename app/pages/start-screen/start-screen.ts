import {Component, ViewChild} from '@angular/core';
import {Slides, MenuController, Nav} from 'ionic-angular';
import {LoginScreen} from './login';
import {SignupScreen} from './signup';


@Component({
  templateUrl: 'build/pages/start-screen/start-screen.html'
})
export class StartScreen {
  mySlideOptions = {
    initialSlide: 0,
    loop: true
  };

  constructor(private nav: Nav, private menu: MenuController) {
    this.menu.enable(false);
  }

  login() {
    this.nav.push(LoginScreen);
  }

  signup() {
    this.nav.push(SignupScreen);
  }
}
