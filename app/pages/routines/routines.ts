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
  templateUrl: 'build/pages/routines/routines.html',
  providers: [DataService]
})
export class RoutinesScreen {
  routines: any;
  expandedGoal: any;
  today: string;

  constructor(
    private ds: DataService,
    private nav: Nav
  ) {
    this.today = moment(new Date().setTime(new Date().getTime() - (3*60*60*1000))).format('YYYY-MM-DD');

    this.getRoutines(this.today);
  }

  compareWeight(a, b) {
    return a.routine[0].weight - b.routine[0].weight;
  }

  showPopover(ev) {
    let popover = Popover.create(PopoverPage, {
      today: this.today,
      cb: (data) => {
        this.today = data;
        this.getRoutines(this.today);
      }
    }, {enableBackdropDismiss: true});

    this.nav.present(popover, { ev: ev });
  }

  getRoutines(date) {
    ///core/api/v2/target-reports/get-by-date
    this.ds.get('core/api/v2/routine-reports/get-by-date', {
      date: date
    })
      .subscribe(data => {
        if(!data.error) {
          this.routines = data.result;

          this.countRoutines();

          //this.routines.sort(this.compareWeight);

          console.log(this.routines);
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

  countRoutines() {
    for(var i=0; i < this.routines.routine_reports.length; i++) {
      var countdone = 0;

      /*_.each(this.routines.routine_reports[i].routine[0].routine_reports, function(a, b) {
        console.log(a);
        console.log(b);
      });*/

      /*for(var i2=0; i2 < this.routines.routine_reports[i].routine[0].routine_reports; i2++) {
        if(this.routines.routine_reports[i].routine[0].routine_reports[i2].done) {
          countdone++;
        }
      }*/

      this.routines.routine_reports[i].routine[0].routine_reports.forEach((item, id) => {
        if(item.done) {
          countdone++;
        }
      });

      this.routines.routine_reports[i].routine[0].countdone = countdone;
      this.routines.routine_reports[i].routine[0].percent = Math.round(countdone/this.routines.routine_reports[i].routine[0].count * 100);
    }
  }

  deleteRoutine(item, itemSliding) {
    ///core/api/v2/routine/delete
  }

  updateRoutine(item, itemSliding) {
    item.done = !item.done;
    itemSliding.close();

    if(item.done) {
      item.routine[0].countdone++;
    } else {
      item.routine[0].countdone--;
    }

    item.routine[0].percent = Math.round(item.routine[0].countdone / item.routine[0].count * 100);

    if(item.id) {
      this.ds.post('core/api/v2/routine-reports/update-one', item)
        .subscribe(data => {
          if(!data.error) {
            item = data.result;
          } else {
            let alert = Alert.create({
              title: 'Ошибка!',
              subTitle: data.error,
              buttons: ['OK']
            });

            //this.nav.present(alert);
          }
        });
    } else {
      this.ds.post('core/api/v2/routine-reports/create-one', item)
        .subscribe(data => {
          if(!data.error) {
            item = data.result;
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
}
