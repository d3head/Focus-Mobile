import {Component, ViewChild, ElementRef} from '@angular/core';
import {Slides, Nav, Popover, NavParams, Alert, Modal, ViewController} from 'ionic-angular';
import * as moment from 'moment';
import 'moment/locale/ru';

import {DateFormatPipe} from 'angular2-moment';

import {OrderBy} from '../../pipes/orderBy';

import {DataService} from '../../services/DataService';

@Component({
  providers: [DataService],
  template: `
  <ion-header>
    <ion-toolbar>
      <ion-title *ngIf="!_navParams.data.task">
        Добавить
      </ion-title>

      <ion-title *ngIf="_navParams.data.task">
        Изменить
      </ion-title>

      <ion-buttons start>
        <button (click)="close()">
          <span primary showWhen="ios">Отмена</span>
          <ion-icon name="md-close" showWhen="android,windows"></ion-icon>
        </button>
      </ion-buttons>

      <ion-buttons end>
        <button (click)="createTask()" *ngIf="!_navParams.data.task">
          <span primary showWhen="ios">Добавить</span>
          <ion-icon name="md-close" showWhen="android,windows"></ion-icon>
        </button>

        <button (click)="updateTask()" *ngIf="_navParams.data.task">
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
        <ion-label>В Backlog</ion-label>
        <ion-toggle [(ngModel)]="addForm.backlog"></ion-toggle>
      </ion-item>

      <ion-item *ngIf="!addForm.backlog">
        <ion-label>Дата</ion-label>
        <ion-datetime displayFormat="MMM DD YYYY" [(ngModel)]="addForm.estimate_date"></ion-datetime>
      </ion-item>

      <ion-item>
        <ion-label>Длительность</ion-label>
        <ion-datetime displayFormat="HH:mm" pickerFormat="HH mm" [(ngModel)]="addForm.estimate_time"></ion-datetime>
      </ion-item>

      <ion-item>
        <ion-label>Обязательная</ion-label>
        <ion-toggle [(ngModel)]="addForm.important"></ion-toggle>
      </ion-item>

    </ion-list>
  </ion-content>`
})
class MyModal {
  addForm: any;

  constructor(
    private viewCtrl: ViewController,
    private ds: DataService,
    private nav: Nav,
    private _navParams: NavParams) {
      /*Date.prototype.tryHours = function(h) {
        this.setTime(this.getTime() - (h*60*60*1000));
        return this;
      }*/
      let estimate_time = new Date();
      estimate_time.setHours(0, 15);

      this.addForm = {
        estimate_date: moment(new Date()).format('YYYY-MM-DD'),
        estimate_time: moment(estimate_time).format('HH:mm'),
        backlog: false,
        name: '',
        important: false
      };

      if(this._navParams.data.task) {
        let hours: any = Math.round(this._navParams.data.task.estimate_time / 60);
        let min: number = this._navParams.data.task.estimate_time - hours * 60;
        hours = (hours >= 10) ? hours : "0" + hours;
        this.addForm = {
          estimate_date: this._navParams.data.task.estimate_date,
          estimate_time: hours + ':' + min,
          backlog: this._navParams.data.task.backlog,
          name: this._navParams.data.task.name,
          important: (this._navParams.data.task.type == 1) ? true : false
        };
      }
      //this.today.tryHours(3);
    }

  createTask() {
    let form = {
        name: this.addForm.name,
        estimate_date: (!this.addForm.backlog) ? this.addForm.estimate_date : null,
        estimate_time: parseInt(this.addForm.estimate_time.split(':')[0]) * 60 + parseInt(this.addForm.estimate_time.split(':')[1]),
        type: (this.addForm.important) ? 1 : 2
      };

    this.ds.post('core/api/v2/task/create-one', form)
      .subscribe(data => {
        if(!data.error) {
          this.viewCtrl.dismiss({form: form});
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

  updateTask() {
    let form = {
        name: this.addForm.name,
        estimate_date: (!this.addForm.backlog) ? this.addForm.estimate_date : null,
        estimate_time: parseInt(this.addForm.estimate_time.split(':')[0]) * 60 + parseInt(this.addForm.estimate_time.split(':')[1]),
        type: (this.addForm.important) ? 1 : 2,
        id: this._navParams.data.task.id
      };

    this.ds.post('core/api/v2/task/update-one', form)
      .subscribe(data => {
        if(!data.error) {
          this.viewCtrl.dismiss({form: form});
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

  close() {
    this.viewCtrl.dismiss({form: this.addForm});
  }
}

@Component({
  template: `
    <ion-list radio-group class="popover-page">
      <ion-item>
        <ion-label>Дата</ion-label>
        <ion-datetime displayFormat="YYYY-MM-DD" [(ngModel)]="today"></ion-datetime>
      </ion-item>
    </ion-list>
  `,
})
class PopoverPage {
  background: string;
  contentEle: any;
  textEle: any;
  today: any;
  fontFamily;

  colors = {
    'white': {
      'bg': 'rgb(255, 255, 255)',
      'fg': 'rgb(0, 0, 0)'
    },
    'tan': {
      'bg': 'rgb(249, 241, 228)',
      'fg': 'rgb(0, 0, 0)'
    },
    'grey': {
      'bg': 'rgb(76, 75, 80)',
      'fg': 'rgb(255, 255, 255)'
    },
    'black': {
      'bg': 'rgb(0, 0, 0)',
      'fg': 'rgb(255, 255, 255)'
    },
  };

  constructor(private navParams: NavParams) {

  }

  ngOnInit() {
    if (this.navParams.data) {
      this.today = this.navParams.data.today;
    }
  }

  dismiss() {
    console.log(this.today);
  }
}

@Component({
  templateUrl: 'build/pages/tasks/tasks.html',
  providers: [DataService],
  pipes: [OrderBy, DateFormatPipe]
})
export class TasksScreen {
  @ViewChild('popoverContent', {read: ElementRef}) content: ElementRef;
  @ViewChild('popoverText', {read: ElementRef}) text: ElementRef;

  allTasks: any;
  today: string;
  displayMode: any;

  constructor(
    private nav: Nav,
    private ds: DataService,
    private viewCtrl: ViewController
  ) {
    this.allTasks = {};
    this.today = moment(new Date()).format('YYYY-MM-DD');
    this.displayMode = '0';

    this.getTasks(this.today);
  }

  formatedTaskTime (minutes: number) {
    let hours: number = Math.round(minutes / 60);
    let min: number = minutes - hours * 60;
    if(hours == 0) return min + ' мин. ';
    if(hours == 1||hours == 21) return hours + ' час ' + min + ' мин. ';
    if(hours > 1 && hours < 5) return hours + ' часа ' + min + ' мин. ';
    if(hours >= 5 && hours <= 20) return hours + ' часов ' + min + ' мин. ';
    if(hours >= 22 && hours <= 24) return hours + ' часa ' + min + ' мин. ';
    return hours + ' часов ' + min + 'мин. ';
  };

  doRefresh(refresher) {
    this.getTasks(this.today);

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

  getTasks(date) {
    this.ds.get('core/api/v2/task/get-by-date', {
      estimate_date: date
    })
      .subscribe(data => {
        if(!data.error) {
          this.allTasks = data.result;

          if (!this.allTasks.all_tasks) {
            this.allTasks.all_tasks[''] = {1: [], 2: []};
          }

          console.log(this.allTasks.all_tasks);

          //this.dateKeys = this.keys(this.allTasks.all_tasks);
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

  keys() : Array<string> {
    return Object.keys(this.allTasks.all_tasks);
  }

  logDrag(event) {
    console.log(event);
  }

  showPopover(ev) {
    let popover = Popover.create(PopoverPage, {today: this.today}, {enableBackdropDismiss: true});
    popover.onDismiss((data: any[]) => {
      console.log(data);
      if (data) {
        console.log(data);
      }
    });
    this.nav.present(popover, { ev: ev });
  }

  sendTomorrow(task) {
    let datetask = new Date();

    if (task.estimate_date != null) {
        let datetask = task.estimate_date.split("-");
        var f = new Date(datetask[0], datetask[1] - 1, datetask[2]);
        f.setDate(f.getDate() + 1);
        task.estimate_date = moment(f).format('YYYY-MM-DD');
        task.$fromBacklog = false;
    } else {
        datetask.setTime(datetask.getTime() + (24*60*60*1000));
        task.estimate_date = moment(datetask).format('YYYY-MM-DD');
        task.$fromBacklog = true;
    }

    this.ds.post('core/api/v2/task/update-one', task)
      .subscribe(data => {
        if(!data.error) {
          this.getTasks(this.today);
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

  doneTask(task, slidingItem) {
    task.done = !task.done;
    slidingItem.close();
    this.ds.post('core/api/v2/task/update-one', task)
      .subscribe(data => {
        if(!data.error) {
          //this.getTasks(this.today);
        } else {
          let alert = Alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          this.nav.present(alert);
        }
      });
    //core/api/v2/task/update-one
  }

  removeTask(task) {
    this.ds.post('core/api/v2/task/delete', task)
      .subscribe(data => {
        if(!data.error) {
          this.getTasks(this.today);
        } else {
          let alert = Alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          this.nav.present(alert);
        }
      });
    //core/api/v2/task/update-one
  }

  addTaskScreen() {
    let modal = Modal.create(MyModal);

    modal.onDismiss((data: any[]) => {
      if (data) {
        this.getTasks(this.today);
      }
    });

    this.nav.present(modal);
  }

  ngDoCheck(changes) {
    //console.log(this);
  }

  editTask(task) {
    let modal = Modal.create(MyModal, {task: task});

    modal.onDismiss((data: any[]) => {
      if (data) {
        this.getTasks(this.today);
      }
    });

    this.nav.present(modal);
  }
}
