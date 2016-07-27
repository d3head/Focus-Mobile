import {Component, Input, Output, EventEmitter} from '@angular/core';
import {DataService} from '../../services/DataService';
import {Slides, Nav, Popover, NavParams, Alert, Modal, ViewController} from 'ionic-angular';
import {Camera} from 'ionic-native';
import * as moment from 'moment';
import 'moment/locale/ru';

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

  constructor(
    private ds: DataService,
    private nav: Nav
  ) {
    this.today = moment(new Date().setTime(new Date().getTime() - (3*60*60*1000))).format('YYYY-MM-DD');

    this.expandedGoal = [
      {
        visible: true
      }
    ];

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

          for (var item in this.targets.target_reports.target_reports) {
            this.expandedGoal.push({visible: false});
          }

          console.log(this.expandedGoal);
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

  attachImages(index) {
    if(index === 0) {

    }

  /*  let options = {
      destinationType: 1,
      saveToPhotoAlbum: true
    };*/

    console.log('camera');

    /*Camera.getPicture(options).then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        let base64Image = "data:image/jpeg;base64," + imageData;

        console.log(base64Image);
    }, (err) => {
    });*/
      let options = {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        saveToPhotoAlbum: false
      };
      // https://github.com/apache/cordova-plugin-camera#module_camera.getPicture
      Camera.getPicture(options).then((imageData) => {
        // imageData is a base64 encoded string
          console.log(imageData);
      }, (err) => {
          console.log(err);
      });
  }

  ///core/api/v2/target-reports/update-all
  ///core/api/v2/target-reports/publish
  /*vm.updateTargets = function() {
      ReportsService.updateTargets(vm.dayform)
        .then(function(response) {
          if(!vm.autosave) {
            if (response.data.error) {
                swal({title: "Ошибка!", text: response.data.error, type: "error"});
            } else {
                swal({
                    title: "Отчет сохранен!",
                    text: "Теперь можно опубликовать.",
                    type: "success"
                });
            }
          } else {
            vm.autosave = false;
          }
        });
    };*/

  saveReport() {
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
