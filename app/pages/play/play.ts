import {Component, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {Slides, MenuController, AlertController, LoadingController, NavParams, Events, ActionSheetController, Nav, LocalStorage, Storage} from 'ionic-angular';
import {TasksScreen} from '../../pages/tasks/tasks';
import {DataService} from '../../services/DataService';
import * as moment from 'moment';
import 'moment/locale/ru';

@Component({
  templateUrl: 'build/pages/play/play.html'
})
export class PlayFocusScreen {
  step: number = 1;
  user: any;
  routineForm: any;
  taskForm: any;
  goalForm: any;
  colors: any;
  disableAttach: any;
  local: any;
  @Output() updateUserInfo = new EventEmitter();

  constructor(
    private nav: Nav,
    private menu: MenuController,
    private ds: DataService,
    private ActionSheet: ActionSheetController,
    private Loading: LoadingController,
    private Alert: AlertController,
    private events: Events,
    private navParams: NavParams)
  {
    this.menu.enable(false);
    this.user = JSON.parse(this.navParams.data.user);
    console.log(this.user);
    this.local = new Storage(LocalStorage);
  }

  stepTwo() {
    this.saveProfile();
    this.step = 2;

    this.colors =  ["#000","#42036F","#707070","#FF3199","#C5C5C5","#FBAFD9","#D77DDE","#5B78AD","#0063B7","#A501DA","#A477F1","#5E76FF","#57C9F9","#7AF9D4","#60E487","#FFAE34","#FFE3C7","#FF7E06","#F76767","#409D8F","#69FFE9","#B2E4E6","#4FA93F","#8CFF0C","#F1FF82","#CD9575"];

    this.routineForm = {
      name: '',
      color: '#000',
      remind: false,
      remind_days: '',
      remind_at: moment(new Date()).format('HH:mm:ss'),
      count: 3
    };
  }

  stepThree() {
    this.saveRoutine();
    this.step = 3;

    let estimate_time = new Date();
    estimate_time.setHours(0, 15);

    this.taskForm = {
      estimate_date: moment(new Date()).format('YYYY-MM-DD'),
      estimate_time: moment(estimate_time).format('HH:mm'),
      backlog: false,
      name: '',
      important: false,
      remind: false,
      remind_date: moment(new Date()).format('YYYY-MM-DD'),
      remind_time: moment(new Date()).format('HH:mm')
    };
  }

  stepFour() {
    this.saveTask();
    this.step = 4;

    this.goalForm = {
      name: '',
      description: '',
      status: 0,
      image_path: ''
    };
  }

  finish() {
    this.saveGoal();
    this.activateRate();
    this.nav.setRoot(TasksScreen);
  }

  /* step first */

  saveProfile() {
    this.user.name = this.user.profile.name;

    this.ds.post('social/api/v2/profile/update-my-profile', this.user)
      .subscribe(data => {
        if(!data.error) {
          this.local.set('user', JSON.stringify(this.user));
          this.updateUserInfo.emit(this.user);
        }
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
                    } else {
                      let alert = this.Alert.create({
                        title: 'Ошибка!',
                        subTitle: data.error,
                        buttons: ['OK']
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
                    } else {
                      let alert = this.Alert.create({
                        title: 'Ошибка!',
                        subTitle: data.error,
                        buttons: ['OK']
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

  /* step two */

  saveRoutine() {
    console.log('create');

    let form = {
        name: this.routineForm.name,
        color: this.routineForm.color,
        count: this.routineForm.count,
        remind_days: (this.routineForm.remind) ?this.routineForm.remind_days.join() : null,
        remind_at: (this.routineForm.remind) ? moment(this.routineForm.remind_at) : null
      };

    this.ds.post('core/api/mobile/routine/create-one', form)
      .subscribe(data => {
        /*if(!data.error) {
          this.viewCtrl.dismiss({form: form});
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });
          this.viewCtrl.dismiss();
          alert.present(alert);
        }*/
      });
  }

  /* step three */

  saveTask() {
    let form = {
        name: this.taskForm.name,
        estimate_date: (!this.taskForm.backlog) ? this.taskForm.estimate_date : null,
        estimate_time: parseInt(this.taskForm.estimate_time.split(':')[0]) * 60 + parseInt(this.taskForm.estimate_time.split(':')[1]),
        type: (this.taskForm.important) ? 1 : 2,
        remind_at: (this.taskForm.remind) ? moment.utc(this.taskForm.remind_date + ' ' + this.taskForm.remind_time) : null
      };

    this.ds.post('core/api/mobile/task/create-one', form)
      .subscribe(data => {
        /*if(!data.error) {
          this.viewCtrl.dismiss({form: form});
          loading.dismiss();
        } else {
          let alert = this.Alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });
          this.viewCtrl.dismiss();
          loading.dismiss();
          alert.present(alert);
        }*/
      });
  }

  /* step finish */
  saveGoal() {
    let form = {
        name: this.goalForm.name,
        description: this.goalForm.description,
        status: this.goalForm.status,
        image_path: this.goalForm.image_path
      };

    this.ds.post('core/api/v2/target/create-one', form)
      .subscribe(data => {
        /*if(!data.error) {
          this.viewCtrl.dismiss({form: form});
          this.events.publish('goals:update', {});
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });
          this.viewCtrl.dismiss();
          alert.present(alert);
        }*/
      });
  }

  activateRate() {
    ///billing/api/v2/rate/activate

    this.ds.post('billing/api/v2/rate/activate', {})
      .subscribe(data => {
        if(!data.error) {
          this.events.publish('user:update', {});

          let alert = this.Alert.create({
            title: 'Игра началась!',
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
