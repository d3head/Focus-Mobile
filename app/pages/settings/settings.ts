import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Nav, AlertController, Storage, ActionSheetController, LoadingController, LocalStorage, Events} from 'ionic-angular';
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
      <ion-title>Уведомления</ion-title>

      <ion-buttons end>
        <button (click)="save()">
          <span>Готово</span>
        </button>
      </ion-buttons>
    </ion-navbar>
  </ion-header>

  <ion-content>
    <ion-list *ngIf="settings">
      <ion-item>
        <ion-label>Уведомления</ion-label>
        <ion-toggle secondary [(ngModel)]="settings.reminder"></ion-toggle>
      </ion-item>
    </ion-list>

    <div *ngIf="settings">
      <ion-list *ngIf="settings.reminder">
        <ion-list-header>
          Напоминания
        </ion-list-header>

        <ion-item>
          <ion-label>Об отчете в</ion-label>
          <ion-datetime displayFormat="H" [(ngModel)]="settings.remind_no_order"></ion-datetime>
        </ion-item>

        <ion-item>
          <ion-label>Об задачах в</ion-label>
          <ion-datetime displayFormat="H" [(ngModel)]="settings.remind_no_tasks"></ion-datetime>
        </ion-item>
      </ion-list>
    </div>

    <!--<div text-center>
      <button tappable primary (click)="save()">Сохранить</button>
      </div>-->
  </ion-content>`
})
class NotificationsScreen {
  settings: any;
  local: any;
  @Output() updateUserInfo = new EventEmitter();

  constructor(
    private nav: Nav,
    private ds: DataService,
    private AuthService: AuthService,
    private Alert: AlertController
  ) {
    this.local = new Storage(LocalStorage);

    this.AuthService.getAppSettings().then(settings => {
      this.settings = JSON.parse(settings);

      //social/api/v2/profile/retrieve-my-profile
      this.ds.post('social/api/v2/profile/retrieve-my-profile', {})
        .subscribe(data => {
          console.log(JSON.stringify(data));
          if(!data.error) {
            this.settings.id = data.result.id;
          }
        });
    });
  }

  save() {
    this.local.set('appSettings', JSON.stringify(this.settings));
    console.log(JSON.stringify(this.settings));
    this.settings.remind_no_tasks = this.settings.remind_no_tasks.split(':')[0];
    this.settings.remind_no_order = this.settings.remind_no_order.split(':')[0];
    this.ds.post('social/api/v2/profile/update-my-profile', this.settings)
      .subscribe(data => {
        console.log(JSON.stringify(data));
        if(!data.error) {

        } else {
          let alert = this.Alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);
        }
      });
  }
}

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
        <ion-avatar item-left>
          <img *ngIf="user.profile.avatar" src="//dev.gofocus.ru/img/170/{{user.profile.avatar}}">
          <img *ngIf="!user.profile.avatar" src="//dev.gofocus.ru/img/170/No-Image-Icon_medium.png">
        </ion-avatar>
        <button dark (click)="attachPhoto()" [disabled]="disableAttach"><ion-icon name="attach"></ion-icon>Загрузить фотографию</button>
      </ion-item>

    </ion-list>

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
      <!--<ion-item>
        <ion-label>Дата рождения</ion-label>
        <ion-datetime displayFormat="DD.MM.YYYY" pickerFormat="DD.MM.YYYY" [(ngModel)]="dt"></ion-datetime>
      </ion-item>-->

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

      <ion-item>
        <ion-label>Теги</ion-label>
        <ion-textarea [(ngModel)]="user.profile.tags"></ion-textarea>
      </ion-item>
    </ion-list>

    <div text-center>
      <button full tappable primary (click)="save()">Сохранить</button>
    </div>
  </ion-content>`
})
class AccountScreen {
  user: any;
  dt: any;
  local: any;
  disableAttach: any;
  @Output() updateUserInfo = new EventEmitter();

  constructor(
    private nav: Nav,
    private ds: DataService,
    private AuthService: AuthService,
    private Alert: AlertController,
    private ActionSheet: ActionSheetController,
    private Loading: LoadingController,
    public events: Events
  ) {
    this.user = [];
    this.disableAttach = false;

    this.local = new Storage(LocalStorage);

    this.AuthService.getUser().then(data => {
      this.user = JSON.parse(data);

      this.dt = new Date(this.user.profile.birth_date);
    });
  }

  attachPhoto() {
    if(!this.disableAttach) {
      this.disableAttach = true;
      let actionSheet = this.ActionSheet.create({
        title: 'Загрузить фотографию',
        buttons: [
          {
            text: 'Камера',
            handler: () => {
              this.disableAttach = false;

              let loading = this.Loading.create();

              loading.present(loading);

              let options = {
                quality: 80,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                saveToPhotoAlbum: false,
                correctOrientation: true
              };

              navigator.camera.getPicture((imageData) => {
                this.ds.post('core/api/v2/file/upload-base64', {
                  image: "data:image/jpeg;base64," + imageData
                })
                  .subscribe(data => {
                    loading.dismiss();
                    if(!data.error) {
                      this.user.profile.avatar = data.result;
                      let alert = this.Alert.create({
                        title: 'Фотография обновлена!',
                        buttons: [{
                          text: 'OK',
                          role: 'cancel',
                          handler: () => {
                            loading.dismiss();
                          }
                        }]
                      });
                      alert.present();
                    } else {
                      let alert = this.Alert.create({
                        title: 'Ошибка!',
                        subTitle: data.error,
                        buttons: [{
                          text: 'OK',
                          role: 'cancel',
                          handler: () => {
                            loading.dismiss();
                          }
                        }]
                      });

                      alert.present(alert);
                    }
                  });
              }, (error) => {
                loading.dismiss();
              }, options);
            }
          },{
            text: 'Галерея',
            handler: () => {
              this.disableAttach = false;

              let loading = this.Loading.create();

              loading.present(loading);

              let options = {
                quality: 80,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                saveToPhotoAlbum: false,
                correctOrientation: true
              };

              navigator.camera.getPicture((imageData) => {
                this.ds.post('core/api/v2/file/upload-base64', {
                  image: "data:image/jpeg;base64," + imageData
                })
                  .subscribe(data => {
                    loading.dismiss();
                    if(!data.error) {
                      this.user.profile.avatar = data.result;
                      let alert = this.Alert.create({
                        title: 'Фотография обновлена!',
                        buttons: [{
                          text: 'OK',
                          role: 'cancel',
                          handler: () => {
                            loading.dismiss();
                          }
                        }]
                      });
                      alert.present();
                    } else {
                      let alert = this.Alert.create({
                        title: 'Ошибка!',
                        subTitle: data.error,
                        buttons: [{
                          text: 'OK',
                          role: 'cancel',
                          handler: () => {
                            loading.dismiss();
                          }
                        }]
                      });

                      alert.present(alert);
                    }
                  });
              }, (error) => {
                loading.dismiss();
              }, options);
            }
          },{
            text: 'Отмена',
            role: 'cancel',
            handler: () => {
              this.disableAttach = false;
            }
          }
        ]
      });
      actionSheet.present(actionSheet);
    }
  }

  save() {
    if (this.dt) {
      //this.user.profile.birth_date = this.dt.toISOString();
    }

    console.log(JSON.stringify(this.user.profile.avatar));

    this.user.name = this.user.profile.name;

    this.ds.post('social/api/v2/profile/update-my-profile', this.user.profile)
      .subscribe(data => {
        if(!data.error) {
          this.local.set('user', JSON.stringify(this.user));
          this.events.publish('user:update');
          let alert = this.Alert.create({
            title: 'Учетная запись сохранена!',
            buttons: ['OK']
          });

          alert.present(alert);
        } else {
          let alert = this.Alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);
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

  openNotificationsScreen() {
    this.nav.push(NotificationsScreen);
  }

  logout() {
    this.AuthService.logout();
    this.nav.setRoot(StartScreen);
  }
}
