import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {DataService} from '../../services/DataService';
import {Slides, Nav, Content, Platform, PopoverController, NavParams, AlertController, Events, Modal, LoadingController, ViewController, ActionSheetController, App} from 'ionic-angular';
import {Camera, LocalNotifications} from 'ionic-native';
import * as moment from 'moment';
import 'moment/locale/ru';
import {Observable} from "rxjs/Rx";

@Component({
  providers: [DataService],
  template: `
  <ion-header>
    <ion-navbar light>
      <button menuToggle>
        <ion-icon name="menu">Назад</ion-icon>
      </button>
      <ion-title *ngIf="!_navParams.data.goal">
        Добавить
      </ion-title>

      <ion-title *ngIf="_navParams.data.goal">
        Изменить
      </ion-title>
    </ion-navbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item>
        <ion-input type="text" placeholder="Содержание" [(ngModel)]="addForm.name"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label stacked>Критерий выполнения</ion-label>
        <ion-textarea [(ngModel)]="addForm.description"></ion-textarea>
      </ion-item>
    </ion-list>

    <ion-list>
      <ion-item>
        <ion-label>Статус</ion-label>
        <ion-select [(ngModel)]="addForm.status">
          <ion-option value="0">Активна</ion-option>
          <ion-option value="2">Заморожена</ion-option>
          <ion-option value="1">Выполнена</ion-option>
        </ion-select>
      </ion-item>
    </ion-list>

    <div class="full-img-container" *ngIf="addForm.image_path">
      <ion-img width="100%" src="//dev.gofocus.ru/img/thumbs/{{addForm.image_path}}"></ion-img>
    </div>

    <button dark full (click)="attachImages()" [disabled]="disableAttach"><ion-icon name="attach"></ion-icon>Прикрепить фотографию</button>

    <button full (click)="createGoal()" *ngIf="!_navParams.data.goal" [disabled]="disableCreate">
      <ion-spinner *ngIf="disableCreate" name="dots"></ion-spinner>
      <span *ngIf="!disableCreate">Добавить</span>
    </button>

    <button full (click)="updateGoal()" *ngIf="_navParams.data.goal" [disabled]="disableUpdate">
      <ion-spinner *ngIf="disableUpdate" name="dots"></ion-spinner>
      <span *ngIf="!disableUpdate">Сохранить</span>
    </button>
  </ion-content>`
})
class MyModal {
  addForm: any;
  colors: any;
  disableCreate: any;
  disableUpdate: any;
  disableAttach: any;

  constructor(
    private viewCtrl: ViewController,
    private ds: DataService,
    private nav: Nav,
    private _navParams: NavParams,
    public events: Events,
    private alert: AlertController,
    private loading: LoadingController,
    private actionsheet: ActionSheetController) {
      this.disableCreate = false;
      this.disableUpdate = false;
      this.disableAttach = false;

      this.addForm = {
        name: '',
        description: '',
        status: 0,
        image_path: ''
      };

      if(this._navParams.data.goal) {
        this.addForm = {
          name: this._navParams.data.goal.name,
          description: this._navParams.data.goal.description,
          status: this._navParams.data.goal.status,
          image_path: this._navParams.data.goal.image_path
        };
      }
    }

  createGoal() {
    if(!this.disableCreate) {
      this.disableCreate = true;
      let form = {
          name: this.addForm.name,
          description: this.addForm.description,
          status: this.addForm.status,
          image_path: this.addForm.image_path
        };

      this.ds.post('core/api/v2/target/create-one', form)
        .subscribe(data => {
          if(!data.error) {
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
          }
        });
    }
  }

  updateGoal() {
    if(!this.disableUpdate) {
      this.disableUpdate = true;

      let form = {
          id: this._navParams.data.goal.id,
          name: this.addForm.name,
          description: this.addForm.description,
          status: this.addForm.status,
          image_path: this.addForm.image_path,
          weight: this._navParams.data.goal.weight
        };

      console.log(JSON.stringify(form));

      this.ds.post('core/api/v2/target/update-one', form)
        .subscribe(data => {
          if(!data.error) {
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
          }
        });
    }
  }

  attachImages(index) {
    if(!this.disableAttach) {
      this.disableAttach = true;
      let actionSheet = this.actionsheet.create({
        title: 'Загрузить фотографию',
        buttons: [
          {
            text: 'Камера',
            handler: () => {
              this.disableAttach = false;

              let loading = this.loading.create();

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
                      this.addForm.image_path = data.result;
                    } else {
                      let alert = this.alert.create({
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

              let loading = this.loading.create();

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
                      this.addForm.image_path = data.result;
                    } else {
                      let alert = this.alert.create({
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

  close() {
    this.viewCtrl.dismiss({form: this.addForm});
  }
}

@Component({
  template: `
    <ion-list radio-group class="popover-page">
      <ion-item>
        <ion-label>Дата</ion-label>
        <ion-datetime displayFormat="YYYY-MM-DD" [(ngModel)]="today"  (ngModelChange)="selectDate($event)"></ion-datetime>
      </ion-item>

      <ion-item tappable (click)="add()">
        <ion-label>Добавить цель</ion-label>
      </ion-item>

      <ion-item tappable (click)="toggleEdit()">
        <ion-label>Мои цели</ion-label>
      </ion-item>
    </ion-list>
  `,
})
class PopoverPage {
  background: string;
  contentEle: any;
  textEle: any;
  today: any;
  callback: any;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    public events: Events,
    private alert: AlertController
  ) {

  }

  ngOnInit() {
    if (this.navParams.data) {
      this.today = this.navParams.data.today;
      this.callback = this.navParams.get('cb');
    }
  }

  add() {
    this.viewCtrl.dismiss();

    this.events.publish('goals:add', {});
    //this.viewCtrl.dismiss();
  }

  toggleEdit() {
    this.viewCtrl.dismiss();

    this.events.publish('goals:editMode', {});
  }

  selectDate($event) {
    console.log(this.today);

    this.callback(this.today);
    this.viewCtrl.dismiss();
  }
}

@Component({
  templateUrl: 'build/pages/goals/goals.html',
  providers: [DataService]
})
export class GoalsScreen {
  targets: any;
  expandedGoal: any;
  today: string;
  dayStatus: any;
  watch: any;
  disableSend: any;
  progress: any;
  photos: any;
  editMode: any;
  targetList: any;
  disableSave: any;
  @ViewChild(Content) content: Content;
  private app: App = null;

  constructor(
    private ds: DataService,
    private platform: Platform,
    private nav: Nav,
    app: App,
    public events: Events,
    private alert: AlertController,
    private loading: LoadingController,
    private actionSheet: ActionSheetController,
    private popover: PopoverController
  ) {
    this.today = moment(new Date().setTime(new Date().getTime() - (3*60*60*1000))).format('YYYY-MM-DD');
    this.disableSend = false;
    this.photos = {0: []};
    this.editMode = false;
    this.disableSave = false;
    this.expandedGoal = [
      {
        visible: true
      }
    ];

    this.app = app;

    this.progress = 0;

    this.targetList = [];

    this.events.subscribe('goals:editMode', (data) => {
      this.editMode = !this.editMode;
      this.getTargets();
    });

    this.events.subscribe('goals:add', (data) => {
      this.addGoal();
    });

    this.events.subscribe('goals:update', (data) => {
      this.getTargets();
      this.getGoals(this.today);
    });

    this.dayStatus = {
      color:'#EAEBEC',
      text:'Обычный день'
    };

    /*this.targets = {
      reply: {
        reply: {}
      },
      target_reports: {
        target_reports: {}
      }
    };*/
    this.getGoals(this.today);


  }

  ngAfterViewInit() {
   // Here 'my-content' is the ID of my ion-content
   /*this.content = this.app.getComponent('goals-content');
   //this.content.onScrollEnd(this.onPageScroll);
   this.content.addEventListener("scroll", () => {
        this.onPageScroll();
    });
   //console.log(this.content.getScrollTop());
   console.log(this);*/
   /*this.scrollerHandle = this.element.nativeElement.children[0];
   if(this.app.isScrolling()) {
     console.log('true');
   }*/
   /*document.querySelector('body').addEventListener('scroll', function(e) {
     console.log('scroll fire');
     if(document.querySelector('.report-btns').getBoundingClientRect().bottom <= 680) {
       console.log('pam a');
       document.querySelector('.goals-bar').classList.remove('fixed');
     } else {
       document.querySelector('.goals-bar').classList.add('fixed');
     }
   });*/
  }

  onPageScroll($event) {
    console.log($event);
  }

  calcProgress() {
    this.disableSend = false;
    let total = this.targets.target_reports.target_reports.length + 2;
    let done = 0;

    if(this.targets.reply.reply.day_conclusion) {
      done += 1;
    }

    if(this.targets.reply.reply.description) {
      done += 1;
    }


    this.targets.target_reports.target_reports.forEach((item, id) => {
      if(!item.comment) {
        this.disableSend = true;
      } else {
        done += 1;
      }
    });

    this.progress = parseInt((done / total * 100).toString());
  }

  showPopover(ev) {
    let popover = this.popover.create(PopoverPage, {
      today: this.today,
      cb: (data) => {
        this.today = data;

        this.getGoals(this.today);
      }
    }, {enableBackdropDismiss: true});

    popover.present({ ev: ev });
  }

  updateDayStatus() {
    this.dayStatus = {
      color:'#EAEBEC',
      text:'Обычный день'
    };

    if(this.targets.reply.reply.relax && !this.targets.reply.reply.work) {
      this.dayStatus = {
        color: '#FFFC99',
        text: 'День отдыха'
      };

      console.log(1);
    }

    if(!this.targets.reply.reply.relax && this.targets.reply.reply.work) {
      this.dayStatus = {
        color: '#D5F2FD',
        text: 'Продуктивный день'
      };

      console.log(2);
    }

    if(this.targets.reply.reply.relax && this.targets.reply.reply.work) {
      this.dayStatus = {
        color: '#84FBCE',
        text: 'День победителя'
      };

      console.log(3);
    }
    console.log(this.dayStatus);
  }

  parseInt(val) {
    return parseInt(val);
  }

  getGoals(date) {
    ///core/api/v2/target-reports/get-by-date
    this.ds.get('core/api/v2/target-reports/get-by-date', {
      date: date
    })
      .subscribe(data => {
        if(!data.error) {
          this.targets = data.result;

          this.expandedGoal = [
            {
              visible: true
            }
          ];
          this.photos[0] = this.targets.reply.reply.images || [];
          for (var item in this.targets.target_reports.target_reports) {
            this.expandedGoal.push({visible: false});
            this.photos[parseInt(item)+1] = this.targets.target_reports.target_reports[item].images || [];
          }

          this.calcProgress();

          this.updateDayStatus();
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);
        }
      });
  }

  photosAction(target, index) {
    let actionSheet = this.actionSheet.create({
      buttons: [
        {
          text: 'Показать',
          handler: () => {
            //console.log(item);
          }
        }, {
          text: 'Удалить',
          role: 'destructive',
          handler: () => {
            this.photos[0].splice(index, 1);
          }
        },{
          text: 'Отмена',
          role: 'cancel'
        }
      ]
    });

    actionSheet.present(actionSheet);
  }

  getTargets() {
    //core/api/v2/target/get
    this.ds.get('core/api/v2/target/get', {})
      .subscribe(data => {
        if(!data.error) {
          this.targetList = data.result;
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);
        }
      });
  }

  attachImages(index) {
    let actionSheet = this.actionSheet.create({
      title: 'Загрузить фотографию',
      buttons: [
        {
          text: 'Камера',
          handler: () => {
            let loading = this.loading.create();

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
                  console.log(JSON.stringify(data));
                  console.log(JSON.stringify(this.photos[index]));
                  if(!data.error) {
                    this.photos[index].push(data.result);
                  } else {
                    let alert = this.alert.create({
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
            let loading = this.loading.create();

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
                    this.photos[index].push(data.result);
                  } else {
                    let alert = this.alert.create({
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
          }
        }
      ]
    });
    actionSheet.present(actionSheet);
  }

  saveReport() {
    if(!this.disableSave) {
      this.disableSave = true;
      this.targets.reply.reply.images = this.photos[0] || [];
      console.log(JSON.stringify(this.photos));

      for (var item in this.targets.target_reports.target_reports) {
        this.targets.target_reports.target_reports[item].images = this.photos[parseInt(item)+1];
      }
      this.ds.post('core/api/v2/target-reports/update-all', this.targets)
        .subscribe(data => {
          if(!data.error) {
            let alert = this.alert.create({
              title: 'Отчет был сохранен!',
              buttons: ['OK']
            });

            alert.present(alert);

            this.disableSave = false;
          } else {
            let alert = this.alert.create({
              title: 'Ошибка!',
              subTitle: data.error,
              buttons: ['OK']
            });

            alert.present(alert);

            this.disableSave = false;
          }
        });
    }
  }

  addGoal() {
    /*let modal = Modal.create(MyModal, {});

    modal.onDismiss((data: any[]) => {
      if (data) {
        this.getGoals(this.today);
      }
    });

    this.nav.present(modal);*/

    this.nav.push(MyModal);
  }

  editGoal(goal) {
    console.log(JSON.stringify(goal));
    let now = new Date();
    let date = moment(goal.created_at);
    let diff = (Math.ceil((now.getTime() - date.valueOf()) / (1000 * 3600 * 24)));
    if(diff < 7) {
      /*let modal = Modal.create(MyModal, {goal: goal});

      modal.onDismiss((data: any[]) => {
        if (data) {
          this.getGoals(this.today);
          this.getTargets();
        }
      });

      this.nav.present(modal);*/
      this.nav.push(MyModal, {goal: goal});
    } else {
      let alert = this.alert.create({
        title: 'Упс...',
        subTitle: 'Время редактирования цели истекло!',
        buttons: ['OK']
      });

      alert.present(alert);
    }
  }

  publishReport() {
    let confirm = this.alert.create({
      title: 'Отправить отчет?',
      message: 'После публикации отчет нельзя будет изменить!',
      buttons: [
       {
         text: 'Отмена',
         handler: () => {
           console.log('Disagree clicked');
         }
       },
       {
         text: 'Отправить',
         handler: () => {
           this.ds.post('core/api/v2/target-reports/publish', this.targets)
             .subscribe(data => {
               if(!data.error) {
                 LocalNotifications.cancel(1);
                 let alert = this.alert.create({
                   title: 'Отчет опубликован!',
                   buttons: ['OK']
                 });

                 alert.present(alert);
               } else {
                 let alert = this.alert.create({
                   title: 'Ошибка!',
                   subTitle: data.error,
                   buttons: ['OK']
                 });

                 alert.present(alert);
               }
             });
         }
       }
      ]
    });

    confirm.present(confirm);
  }

  expandGoal(index) {
    this.expandedGoal[index].visible = !this.expandedGoal[index].visible;
  }
}
