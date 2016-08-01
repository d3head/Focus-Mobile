import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {DataService} from '../../services/DataService';
import {Slides, Nav, Content, Platform, Popover, NavParams, Alert, Modal, Loading, ViewController, ActionSheet, App} from 'ionic-angular';
import {Camera} from 'ionic-native';
import * as moment from 'moment';
import 'moment/locale/ru';
import {Observable} from "rxjs/Rx";

@Component({
  template: `
    <ion-list radio-group class="popover-page">
      <ion-item>
        <ion-label>Дата</ion-label>
        <ion-datetime displayFormat="YYYY-MM-DD" [(ngModel)]="today" (ngModelChange)="selectDate($event)"></ion-datetime>
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
    private viewCtrl: ViewController
  ) {

  }

  ngOnInit() {
    if (this.navParams.data) {
      this.today = this.navParams.data.today;
      this.callback = this.navParams.get('cb');
    }
  }

  selectDate($event) {
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
  @ViewChild(Content) content: Content;
  private app: App = null;

  constructor(
    private ds: DataService,
    private platform: Platform,
    private nav: Nav,
    app: App
  ) {
    this.today = moment(new Date().setTime(new Date().getTime() - (3*60*60*1000))).format('YYYY-MM-DD');
    this.disableSend = false;
    this.photos = {0: []};
    this.expandedGoal = [
      {
        visible: true
      }
    ];

    this.app = app;

    this.progress = 0;

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
    let popover = Popover.create(PopoverPage, {
      today: this.today,
      cb: (data) => {
        this.today = data;

        this.getGoals(this.today);
      }
    }, {enableBackdropDismiss: true});

    this.nav.present(popover, { ev: ev });
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

  photosAction(target, index) {
    let actionSheet = ActionSheet.create({
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

    this.nav.present(actionSheet);
  }

  attachImages(index) {
    let actionSheet = ActionSheet.create({
      title: 'Загрузить фотографию',
      buttons: [
        {
          text: 'Камера',
          handler: () => {
            let loading = Loading.create();

            this.nav.present(loading);

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
                    let alert = Alert.create({
                      title: 'Ошибка!',
                      subTitle: data.error,
                      buttons: ['OK']
                    });

                    this.nav.present(alert);
                  }
                });
            }, (error) => {
              loading.dismiss();
            }, options);
          }
        },{
          text: 'Галерея',
          handler: () => {
            let loading = Loading.create();

            this.nav.present(loading);

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
                    let alert = Alert.create({
                      title: 'Ошибка!',
                      subTitle: data.error,
                      buttons: ['OK']
                    });

                    this.nav.present(alert);
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
    this.nav.present(actionSheet);
  }

  saveReport() {
    this.targets.reply.reply.images = this.photos[0] || [];
    console.log(JSON.stringify(this.photos));

    for (var item in this.targets.target_reports.target_reports) {
      this.targets.target_reports.target_reports[item].images = this.photos[parseInt(item)+1];
    }
    this.ds.post('core/api/v2/target-reports/update-all', this.targets)
      .subscribe(data => {
        if(!data.error) {
          let alert = Alert.create({
            title: 'Отчет был сохранен!',
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

  publishReport() {
    let confirm = Alert.create({
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
                 let alert = Alert.create({
                   title: 'Отчет опубликован!',
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
      ]
    });

    this.nav.present(confirm);
  }

  expandGoal(index) {
    this.expandedGoal[index].visible = !this.expandedGoal[index].visible;
  }
}
