import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Slides, Nav, Alert, MenuController, Events} from 'ionic-angular';
import {FORM_DIRECTIVES, FormBuilder,  ControlGroup, Validators, AbstractControl} from '@angular/common';
import {FormValidator} from '../../validator/FormValidator';
import {DataService} from '../../services/DataService';
import {AuthService} from '../../services/auth-service';
import {TasksScreen} from '../../pages/tasks/tasks';
import {SyncEvent} from 'ts-events';

let userEvent = new SyncEvent();

@Component({
  templateUrl: 'build/pages/start-screen/login.html',
  providers: [DataService, AuthService]
})
export class LoginScreen {
  authForm: ControlGroup;
  email: AbstractControl;
  password: AbstractControl;
  @Output() updateUser = new EventEmitter();

  constructor(
    private navController: Nav,
    private fb: FormBuilder,
    private ds: DataService,
    private as: AuthService,
    private nav: Nav,
    private menu: MenuController,
    public events: Events
  ) {
      this.authForm = fb.group({
          'email': ['', Validators.compose([Validators.required, Validators.minLength(5)])],
          'password': ['', Validators.compose([Validators.required, Validators.minLength(5)])]
      });

      this.email = this.authForm.controls['email'];
      this.password = this.authForm.controls['password'];
  }

  onSubmit(value: string): void {
    if(this.authForm.valid) {
      this.ds.post('signin', value)
        .subscribe(data => {
          if(!data.error) {
            this.as.login(data);
            this.menu.enable(true);
            this.events.publish('user:login', data);
            this.nav.setRoot(TasksScreen);
          } else {
            let alert = Alert.create({
              title: 'Ошибка!',
              subTitle: data.error,
              buttons: ['OK']
            });

            this.nav.present(alert);
          }
        }, error => {
          let alert = Alert.create({
            title: 'Ошибка!',
            subTitle: error,
            buttons: ['OK']
          });

          this.nav.present(alert);
        });
    }
  }
}
