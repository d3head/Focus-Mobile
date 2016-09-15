import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Slides, Nav, LoadingController, AlertController, MenuController, Events} from 'ionic-angular';
import {FORM_DIRECTIVES, FormBuilder,  ControlGroup, Validators, AbstractControl} from '@angular/common';
import {FormValidator} from '../../validator/FormValidator';
import {DataService} from '../../services/DataService';
import {AuthService} from '../../services/auth-service';
import {TasksScreen} from '../../pages/tasks/tasks';
import {PlayFocusScreen} from '../../pages/play/play';
import {SyncEvent} from 'ts-events';
import {Mask} from '../../directives/mask/mask';
import {Directive} from 'ionic2-input-mask';
import MaskedInput from 'angular2-text-mask'

let userEvent = new SyncEvent();

@Component({
  templateUrl: 'build/pages/start-screen/signup.html',
  providers: [DataService, AuthService],
  directives: [Mask]
})
export class SignupScreen {
  authForm: ControlGroup;
  email: any;
  password: any;
  password_confirmation: any;
  name: any;
  phone: any;
  empty_name: boolean;
  empty_phone: boolean;
  wrong_email: boolean;
  passwords_different: boolean;
  empty_password: boolean;
  disableCreate: any;
  error: any;
  public mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
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
    this.password_confirmation = "";
    this.phone = "";
    this.name = "";

    this.error = {};

    this.disableCreate = false;

    this.empty_name = false;
    this.empty_password = false;
    this.wrong_email = false;
    this.passwords_different = false;

    this.menu.enable(false);
  }

  checkPhone() {
    this.phone = this.phone.replace(/(\d)(\d\d\d)(\d\d\d)(\d\d)(\d\d)/, '+7 ($2) $3-$4-$5');
  }

  validatePassword() {
    if(this.password.length < 1) {
      this.empty_password = true;
    } else {
      this.empty_password = false;
    }

    if(this.password !== this.password_confirmation || this.password_confirmation.length < 1) {
      this.passwords_different = true;
    } else {
      this.passwords_different = false;
    }
  };

  validateName() {
    if(this.name.length < 1) {
      this.empty_name = true;
    } else {
      this.empty_name = false;
    }
  };

  validatePhone() {
    if(this.phone.length < 1) {
      this.empty_phone = true;
    } else {
      this.empty_phone = false;
    }
  };

  validateEmail() {
    let re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

    if(!re.test(this.email) || this.email.length < 1) {
      this.wrong_email = true;
    } else {
      this.wrong_email = false;
    }
  };

  onSubmit() {
    if(!this.disableCreate) {
      this.error = {};
      let loading = this.loadingCtrl.create({
        content: 'Регистрируемся...'
      });

      loading.present();

      this.disableCreate = true;

      let form = {
        email: this.email,
        password: this.password,
        password_confirmation: this.password_confirmation,
        phone: this.phone,
        name: this.name,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      this.validatePassword();
      this.validateName();
      this.validateEmail();
      this.validatePhone();

      if(!this.empty_password && !this.passwords_different && !this.wrong_email && !this.empty_name && !this.empty_phone) {
        this.ds.post('registration', form)
          .subscribe(data => {
            loading.dismiss();
            if(!data.error) {
              console.log('Do Login');
              this.as.login(data);
              console.log('Do Menu');
              console.log('Do Event');
              this.events.publish('user:login', data);
              console.log('Do Play Screen');
              this.nav.setRoot(PlayFocusScreen, {user: JSON.stringify(data.user[0])});
            } else {
              loading.dismiss();
              this.disableCreate = false;
              this.error = data.error;
              let alert = this.Alert.create({
                title: 'Ошибка!',
                subTitle: data.error,
                buttons: ['OK']
              });

              alert.present(alert);
            }
          }, (error) => {
            loading.dismiss();
            this.disableCreate = false;
            this.error = JSON.parse(error._body);
            /*let alert = this.Alert.create({
              title: 'Ошибка!',
              subTitle: JSON.parse(error._body),
              buttons: ['OK']
            });

            alert.present(alert);*/
          });
      } else {
        this.disableCreate = false;
        loading.dismiss();
      }
    }
  }
}
