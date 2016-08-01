import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Nav, Alert, Storage, LocalStorage} from 'ionic-angular';
import {AuthService} from '../../services/auth-service';
import {DataService} from '../../services/DataService';
import {StartScreen} from '../../pages/start-screen/start-screen';

@Component({
  providers: [DataService, AuthService],
  template: `
  <ion-header>
    <ion-navbar light>
      <button menuToggle>
        <ion-icon name="menu">Назад</ion-icon>
      </button>
      <ion-title>Учетная запись</ion-title>

      <ion-buttons end>
        <button (click)="save()">
          <span>Готово</span>
        </button>
      </ion-buttons>
    </ion-navbar>
  </ion-header>

  <ion-content>
    <ion-list *ngIf="user.profile">
      <ion-item>
        <ion-label>Имя</ion-label>
        <ion-input type="text" [(ngModel)]="user.profile.name"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label>Фамилия</ion-label>
        <ion-input type="text" [(ngModel)]="user.profile.soname"></ion-input>
      </ion-item>
    </ion-list>

    <ion-list *ngIf="user.profile">
      <ion-item>
        <ion-label>Дата рождения</ion-label>
        <ion-datetime displayFormat="DD.MM.YYYY" pickerFormat="DD.MM.YYYY" [(ngModel)]="dt"></ion-datetime>
      </ion-item>

      <ion-item>
        <ion-label>Пол</ion-label>
        <ion-select [(ngModel)]="user.profile.gender">
          <ion-option value="2">Мужской</ion-option>
          <ion-option value="1">Женский</ion-option>
        </ion-select>
      </ion-item>
    </ion-list>

    <ion-list *ngIf="user.profile">
      <ion-item>
        <ion-label>О себе</ion-label>
        <ion-textarea [(ngModel)]="user.profile.about"></ion-textarea>
      </ion-item>

    </ion-list>

    <!--<div text-center>
      <button tappable primary (click)="save()">Сохранить</button>
      </div>-->
  </ion-content>`
})
class AccountScreen {
  user: any;
  dt: any;
  local: any;
  @Output() updateUserInfo = new EventEmitter();

  constructor(
    private nav: Nav,
    private ds: DataService,
    private AuthService: AuthService
  ) {
    this.user = [];

    this.local = new Storage(LocalStorage);

    this.AuthService.getUser().then(data => {
      this.user = JSON.parse(data);

      this.dt = new Date(this.user.profile.birth_date);
    });
  }

  save() {
    if (this.dt) {
      this.user.profile.birth_date = this.dt.toISOString();
    }

    this.user.name = this.user.profile.name;

    this.ds.post('social/api/v2/profile/update-my-profile', this.user)
      .subscribe(data => {
        if(!data.error) {
          this.local.set('user', JSON.stringify(this.user));
          this.updateUserInfo.emit(this.user);
          let alert = Alert.create({
            title: 'Учетная запись сохранена!',
            buttons: ['OK']
          });

          this.nav.present(alert);
        } else {
          let alert = Alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          this.nav.present(alert);
        }
      });
  }
}

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

  openAccountScreen() {
    this.nav.push(AccountScreen);
  }

  logout() {
    this.AuthService.logout();
    this.nav.setRoot(StartScreen);
  }
}
