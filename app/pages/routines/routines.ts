import {Component, Input, Output, EventEmitter} from '@angular/core';
import {DataService} from '../../services/DataService';
import {Slides, Nav, PopoverController, NavParams, AlertController, ModalController, ViewController, Events} from 'ionic-angular';
import {Camera} from 'ionic-native';
import * as moment from 'moment';
import 'moment/locale/ru';
import {TodayRoutines, DoneRoutines, AnotherRoutines} from '../../pipes/routines';

@Component({
  template: `
    <ion-list radio-group class="popover-page">
      <ion-item>
        <ion-label>Дата</ion-label>
        <ion-datetime displayFormat="DD-MM-YYYY" [(ngModel)]="today" (ngModelChange)="selectDate($event)"></ion-datetime>
      </ion-item>

      <ion-item tappable (click)="add()">
        <ion-label>Добавить</ion-label>
      </ion-item>

      <ion-item tappable (click)="toggleEdit()">
        <ion-label>Изменить</ion-label>
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
    private alert: AlertController,
    private popover: PopoverController
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

    this.events.publish('routines:add', {});
  }

  toggleEdit() {
    this.viewCtrl.dismiss();

    this.events.publish('routines:editMode', {});
  }

  selectDate($event) {
    this.viewCtrl.dismiss();

    this.callback(this.today);
  }
}

@Component({
  providers: [DataService, Nav],
  template: `
  <ion-header>
    <ion-toolbar>
      <ion-title *ngIf="!_navParams.data.routine">
        Добавить
      </ion-title>

      <ion-title *ngIf="_navParams.data.routine">
        Изменить
      </ion-title>

      <ion-buttons start>
        <button (click)="close()">
          <span primary showWhen="ios">Отмена</span>
          <ion-icon name="md-close" showWhen="android,windows"></ion-icon>
        </button>
      </ion-buttons>

      <ion-buttons end>
        <button (click)="createRoutine()" *ngIf="!_navParams.data.routine">
          <span primary showWhen="ios">Добавить</span>
          <ion-icon name="md-close" showWhen="android,windows"></ion-icon>
        </button>

        <button (click)="updateRoutine()" *ngIf="_navParams.data.routine">
          <span primary showWhen="ios">Сохранить</span>
          <ion-icon name="md-close" showWhen="android,windows"></ion-icon>
        </button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item>
        <ion-input type="text" placeholder="Содержание" [(ngModel)]="addForm.name"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label>Цвет</ion-label>
        <ion-select [(ngModel)]="addForm.color" cancelText="Отмена" okText="Ок">
          <ion-option *ngFor="let color of colors;let $index = index; trackBy:$index" value="{{color}}"><span>{{color}}</span></ion-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label>Количество<sup>*</sup></ion-label>
        <ion-input item-right type="number" placeholder="Количество" [(ngModel)]="addForm.count"></ion-input>
      </ion-item>
    </ion-list>

    <div padding style="margin-top: -30px;margin-bottom: 30px;"><small><sup>*</sup>Укажите количество повторений, которые сделаете за два месяца</small></div>

    <ion-list>
      <ion-item>
        <ion-label>Напоминать о привычке</ion-label>
        <ion-toggle [(ngModel)]="addForm.remind"></ion-toggle>
      </ion-item>

      <ion-item *ngIf="addForm.remind">
        <ion-label>Когда напомнить</ion-label>
        <ion-select [(ngModel)]="addForm.remind_days" multiple="true" cancelText="Отмена" okText="Ок">
          <ion-option value="Mo">Понедельник</ion-option>
          <ion-option value="Tu">Вторник</ion-option>
          <ion-option value="We">Среда</ion-option>
          <ion-option value="Th">Четверг</ion-option>
          <ion-option value="Fr">Пятница</ion-option>
          <ion-option value="Sa">Суббота</ion-option>
          <ion-option value="Su">Воскресенье</ion-option>
        </ion-select>
      </ion-item>

      <ion-item *ngIf="addForm.remind">
        <ion-label>Во сколько напомнить</ion-label>
        <ion-datetime displayFormat="HH:mm" [(ngModel)]="addForm.remind_at"></ion-datetime>
      </ion-item>
    </ion-list>

    <button full (click)="createRoutine()" *ngIf="!_navParams.data.routine">
      Добавить
    </button>

    <button full (click)="updateRoutine()" *ngIf="_navParams.data.routine">
      Сохранить
    </button>
  </ion-content>`
})
class MyModal {
  addForm: any;
  colors: any;

  constructor(
    private viewCtrl: ViewController,
    private ds: DataService,
    private nav: Nav,
    private _navParams: NavParams,
    private alert: AlertController,
    private popover: PopoverController) {
      this.colors =  ["#000","#42036F","#707070","#FF3199","#C5C5C5","#FBAFD9","#D77DDE","#5B78AD","#0063B7","#A501DA","#A477F1","#5E76FF","#57C9F9","#7AF9D4","#60E487","#FFAE34","#FFE3C7","#FF7E06","#F76767","#409D8F","#69FFE9","#B2E4E6","#4FA93F","#8CFF0C","#F1FF82","#CD9575"];

      this.addForm = {
        name: '',
        color: '#000',
        remind: false,
        remind_days: '',
        remind_at: moment(new Date()).format('HH:mm:ss'),
        count: 3
      };

      if(this._navParams.data.routine) {
        this.addForm = {
          name: this._navParams.data.routine.name,
          color: this._navParams.data.routine.color,
          count: this._navParams.data.routine.count,
          remind: (this._navParams.data.routine.remind_days && this._navParams.data.routine.remind_days.length < 1) ? false : true,
          remind_days: (this._navParams.data.routine.remind_days) ? this._navParams.data.routine.remind_days.split(',') : [],
          remind_at: (this._navParams.data.routine.remind_at) ? moment.utc(this._navParams.data.routine.remind_at).format('HH:mm:ss') : moment(new Date()).format('HH:mm:ss')
        };
      }
    }

  createRoutine() {
    let form = {
        name: this.addForm.name,
        color: this.addForm.color,
        count: this.addForm.count,
        remind_days: (this.addForm.remind) ?this.addForm.remind_days.join() : null,
        remind_at: (this.addForm.remind) ? moment(this.addForm.remind_at) : null
      };

    this.ds.post('core/api/mobile/routine/create-one', form)
      .subscribe(data => {
        if(!data.error) {
          this.viewCtrl.dismiss({form: form});
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

  updateRoutine() {
    let form = {
        id: this._navParams.data.routine.id,
        name: this.addForm.name,
        color: this.addForm.color,
        count: this.addForm.count,
        remind_days: (this.addForm.remind) ? this.addForm.remind_days.join() : null,
        remind_at: (this.addForm.remind) ? this.addForm.remind_at : null
      };

    this.ds.post('core/api/mobile/routine/update-one', form)
      .subscribe(data => {
        if(!data.error) {
          this.viewCtrl.dismiss({form: form});
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

  close() {
    this.viewCtrl.dismiss({form: this.addForm});
  }
}

@Component({
  templateUrl: 'build/pages/routines/routines.html',
  providers: [DataService, Nav],
  pipes: [TodayRoutines, DoneRoutines, AnotherRoutines]
})
export class RoutinesScreen {
  routines: any;
  expandedGoal: any;
  done_routines: any;
  not_done_routines: any;
  today: string;
  editMode: boolean;

  constructor(
    private ds: DataService,
    private nav: Nav,
    public events: Events,
    private alert: AlertController,
    private popover: PopoverController,
    private modal: ModalController
  ) {
    this.today = moment(new Date().setTime(new Date().getTime() - (3*60*60*1000))).format('YYYY-MM-DD');
    this.done_routines = 0;
    this.not_done_routines = 0;
    this.getRoutines(this.today);
    this.editMode = false;

    this.events.subscribe('routines:editMode', (data) => {
      this.editMode = !this.editMode;
    });

    this.events.subscribe('routines:add', (data) => {
      this.addRoutine();
    });
  }

  compareWeight(a, b) {
    return a.routine.weight - b.routine.weight;
  }

  showPopover(ev) {
    let popover = this.popover.create(PopoverPage, {
      today: this.today,
      cb: (data) => {
        this.today = data;
        this.getRoutines(this.today);
      }
    }, {enableBackdropDismiss: true});

    popover.present({ ev: ev });
  }

  getRoutines(date) {
    ///core/api/mobile/target-reports/get-by-date
    this.ds.getGo('core/api/v2/routine-reports/get-by-date', {
      date: date
    })
      .subscribe(data => {
        if(!data.error) {
          this.routines = data.result;
          this.countRoutines();


          this.routines.routine_reports.sort(this.compareWeight);
          this.counters();
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

  counters() {
    this.done_routines = 0;
    this.not_done_routines = 0;
    if(this.routines.routine_reports) {
      this.routines.routine_reports.forEach((id, item) => {
        if(id.done) {
          this.done_routines++;
        } else {
          this.not_done_routines++;
        }
      });
    }
  }


  countRoutines() {

    /*for(var i=0; i < this.routines.routine_reports.length; i++) {
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

      /*this.routines.routine_reports[i].routine[0].routine_reports.forEach((item, id) => {
        if(item.done) {
          countdone++;
        }
      });

      this.routines.routine_reports[i].routine[0].countdone = countdone;
      this.routines.routine_reports[i].routine[0].percent = Math.round(countdone/this.routines.routine_reports[i].routine[0].count * 100);*/
    //}
  }


  deleteRoutine(item) {
    ///core/api/mobile/routine/delete
    this.ds.post('core/api/mobile/routine/delete', {id: item.routine.id})
      .subscribe(data => {
        if(!data.error) {
          this.getRoutines(this.today);
          this.counters();
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

  addRoutine() {
    let modal = this.modal.create(MyModal, {});

    modal.onDidDismiss((data: any[]) => {
      if (data) {
        this.getRoutines(this.today);
      }
    });

    modal.present(modal);
  }

  editRoutine(routine) {
    let modal = this.modal.create(MyModal, {routine: routine});

    modal.onDidDismiss((data: any[]) => {
      if (data) {
        this.getRoutines(this.today);
      }
    });

    modal.present(modal);
  }

  updateRoutine(item, itemSliding) {
    item.done = !item.done;
    itemSliding.close();

    if(item.done) {
      item.routine.countdone++;
    } else {
      item.routine.countdone--;
    }

    //item.routine[0].percent = Math.round(item.routine[0].countdone / item.routine[0].count * 100);

    if(item.id !== 0) {
      this.ds.post('core/api/mobile/routine-reports/update-one', item)
        .subscribe(data => {
          if(!data.error) {
            this.getRoutines(this.today);
            this.counters();
          } else {
            let alert = this.alert.create({
              title: 'Ошибка!',
              subTitle: data.error,
              buttons: ['OK']
            });

            //this.nav.present(alert);
          }
        });
    } else {
      delete item.id;
      delete item.created_at;
      delete item.updated_at;
      delete item.post_id;
      delete item.status;
      this.ds.post('core/api/mobile/routine-reports/create-one', item)
        .subscribe(data => {
          if(!data.error) {
            this.getRoutines(this.today);
            this.counters();
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
}
