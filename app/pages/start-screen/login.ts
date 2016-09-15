import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Slides, Nav, LoadingController, AlertController, MenuController, Events, NavParams} from 'ionic-angular';
import {FORM_DIRECTIVES, FormBuilder,  ControlGroup, Validators, AbstractControl} from '@angular/common';
import {FormValidator} from '../../validator/FormValidator';
import {DataService} from '../../services/DataService';
import {AuthService} from '../../services/auth-service';
import {TasksScreen} from '../../pages/tasks/tasks';
import {PlayFocusScreen} from '../../pages/play/play';
import {SyncEvent} from 'ts-events';

let userEvent = new SyncEvent();

@Component({
  providers: [DataService],
  template: `
  <ion-header>
    <ion-navbar light>
      <button menuToggle>
        <ion-icon name="menu">Назад</ion-icon>
      </button>
      <ion-title>Сброс пароля</ion-title>
    </ion-navbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item>
          <ion-input type="email" value="" name="email" placeholder="Эл. Почта" [(ngModel)]="resetForm.email"></ion-input>
      </ion-item>
    </ion-list>

    <ion-list *ngIf="sendedEmail">
      <div text-center padding>
        На вашу почту отправлен проверочный код. Введите его в поле ниже и придумайте новый пароль.
      </div>

      <ion-item>
          <ion-input type="text" value="" name="token" placeholder="Код" [(ngModel)]="resetForm.token"></ion-input>
      </ion-item>

      <ion-item>
          <ion-input type="password" value="" name="password" placeholder="Пароль" [(ngModel)]="resetForm.password"></ion-input>
      </ion-item>

      <ion-item>
          <ion-input type="password" value="" name="password_confirmation" placeholder="Пароль" [(ngModel)]="resetForm.password_confirmation"></ion-input>
      </ion-item>
    </ion-list>

    <div padding>
      <button *ngIf="!sendedEmail" full-width primary type="submit" class="custom-button" (click)="sentMail()">Сбросить пароль</button>

      <button *ngIf="sendedEmail" full-width primary type="submit" class="custom-button" (click)="resetPassword()">Сменить пароль</button>
    </div>
  </ion-content>`
})
class ForgetScreen {
  resetForm: any;
  sendedEmail: any;

  constructor(
    private navParams: NavParams,
    private as: AuthService,
    private nav: Nav,
    private menu: MenuController,
    private ds: DataService,
    private alert: AlertController,
    private loadingCtrl: LoadingController,
    private Alert: AlertController,
    public events: Events
  ) {
    this.resetForm = {};
    this.sendedEmail = false;
  }

  sentMail() {
    let loading = this.loadingCtrl.create();

    loading.present();

    if(this.resetForm.email) {
      this.ds.post('password-restore', this.resetForm)
        .subscribe(data => {
          loading.dismiss();
          if(!data.error) {
            this.sendedEmail = true;
          } else {
            let alert = this.Alert.create({
              title: 'Ошибка!',
              subTitle: data.error,
              buttons: ['OK']
            });

            alert.present(alert);
          }
        }, error => {
          loading.dismiss();
          let alert = this.Alert.create({
            title: 'Ошибка!',
            subTitle: error,
            buttons: ['OK']
          });

          alert.present(alert);
        });
    } else {
      loading.dismiss();
    }
  }

  resetPassword() {
    let loading = this.loadingCtrl.create();

    loading.present();

    if(this.resetForm.email && this.resetForm.password && this.resetForm.password_confirmation && this.resetForm.token) {
      this.ds.post('password-reset', this.resetForm)
        .subscribe(data => {
          loading.dismiss();
          if(!data.error) {
            this.as.login(data);
            this.menu.enable(true);
            this.events.publish('user:login', data);
            console.log(data);
            if(data.user[0].purchased_billing_rate[0].activated) {
              this.nav.setRoot(TasksScreen);
            } else {
              this.nav.setRoot(PlayFocusScreen);
            }


            window["plugins"].OneSignal.sendTag("id", data.user[0].id);


            window["plugins"].OneSignal.registerForPushNotifications();

            window["plugins"].OneSignal.setSubscription(true);
          } else {
            let alert = this.Alert.create({
              title: 'Ошибка!',
              subTitle: data.error,
              buttons: ['OK']
            });

            alert.present(alert);
          }
        }, error => {
          loading.dismiss();
          let alert = this.Alert.create({
            title: 'Ошибка!',
            subTitle: error,
            buttons: ['OK']
          });

          alert.present(alert);
        });
    } else {
      loading.dismiss();
    }
  }
}

@Component({
  templateUrl: 'build/pages/start-screen/login.html',
  providers: [DataService, AuthService]
})
export class LoginScreen {
  authForm: ControlGroup;
  email: any;
  password: any;
  wrong_email: any;
  wrong_password_empty: any;
  @Output() updateUser = new EventEmitter();

  constructor(
    private navController: Nav,
    private fb: FormBuilder,
    private ds: DataService,
    private as: AuthService,
    private nav: Nav,
    private menu: MenuController,
    public events: Events,
    private Alert: AlertController,
    private loadingCtrl: LoadingController
  ) {
    this.email = "";
    this.password = "";
    this.wrong_email = false;
    this.wrong_password_empty = false;
    this.menu.enable(false);
  }

  clearErrors() {
    this.wrong_email = false;
    this.wrong_password_empty = false;
  };

  validateEmail(email) {
    let re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

    if(!re.test(email) || email.length == 0) {
      this.wrong_email = true;
    } else {
      this.wrong_email = false;
    }
  };

  validatePassword(pass) {
    if(pass.length == 0) {
      this.wrong_password_empty = true;
    } else {
      this.wrong_password_empty = false;
    }
  };

  forget() {
    this.nav.push(ForgetScreen);
  }

  onSubmit() {
    let loading = this.loadingCtrl.create({
      content: 'Авторизируемся...'
    });

    loading.present();

    this.validateEmail(this.email);
    this.validatePassword(this.password);

    if(!this.wrong_email && !this.wrong_password_empty) {
      let form = {
        email: this.email,
        password: this.password
      };

      this.ds.post('signin', form)
        .subscribe(data => {
          loading.dismiss();
          if(!data.error) {

            this.as.login(data);
            this.menu.enable(true);
            this.events.publish('user:login', data);
            console.log(data);
            if(data.user[0].purchased_billing_rate[0].activated) {
              this.nav.setRoot(TasksScreen);
            } else {
              this.nav.setRoot(PlayFocusScreen);
            }


            window["plugins"].OneSignal.sendTag("id", data.user[0].id);


            window["plugins"].OneSignal.registerForPushNotifications();

            window["plugins"].OneSignal.setSubscription(true);
          } else {
            let alert = this.Alert.create({
              title: 'Ошибка!',
              subTitle: data.error,
              buttons: ['OK']
            });

            alert.present(alert);
          }
        }, error => {
          loading.dismiss();
          let alert = this.Alert.create({
            title: 'Ошибка!',
            subTitle: error,
            buttons: ['OK']
          });

          alert.present(alert);
        });
    } else {
      loading.dismiss();
    }
  }
}
