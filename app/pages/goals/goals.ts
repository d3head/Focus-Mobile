import {Component, Input, Output, EventEmitter} from '@angular/core';
import {DataService} from '../../services/DataService';
import {Slides, Nav, Popover, NavParams, Alert, Modal, ViewController} from 'ionic-angular';
import {Camera} from 'ionic-native';
import * as moment from 'moment';
import 'moment/locale/ru';

@Component({
  templateUrl: 'build/pages/goals/goals.html',
  providers: [DataService]
})
export class GoalsScreen {
  targets: any;
  expandedGoal: any;
  today: string;

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

  getGoals(date) {
    ///core/api/v2/target-reports/get-by-date
    this.ds.get('core/api/v2/target-reports/get-by-date', {
      date: date
    })
      .subscribe(data => {
        if(!data.error) {
          this.targets = data.result;

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
          console.log(data);
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
