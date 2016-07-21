import {Component, ViewChild} from '@angular/core';
import {Slides, Nav} from 'ionic-angular';
import {LoginScreen} from './login';


@Component({
  templateUrl: 'build/pages/start-screen/start-screen.html'
})
export class StartScreen {
  mySlideOptions = {
    initialSlide: 0,
    loop: true
  };

  constructor(private nav: Nav) {

  }

  openPage(page) {
    // navigate to the new page if it is not the current page
    //console.log(LoginScreen);
    this.nav.push(LoginScreen);
  }
}
