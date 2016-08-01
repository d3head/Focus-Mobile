import {Component, ViewChild, ElementRef} from '@angular/core';
import {Slides, Nav, Popover, NavParams, MenuController, Alert, Modal, ViewController} from 'ionic-angular';
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
        <ion-label>Длительность</ion-label>
        <ion-datetime displayFormat="HH:mm" pickerFormat="HH mm" [(ngModel)]="addForm.estimate_time"></ion-datetime>
      </ion-item>
    </ion-list>

    <ion-list>
      <ion-item>
        <ion-label>В Backlog</ion-label>
        <ion-toggle [(ngModel)]="addForm.backlog"></ion-toggle>
      </ion-item>

      <ion-item *ngIf="!addForm.backlog">
        <ion-label>Дата</ion-label>
        <ion-datetime displayFormat="DD.MM.YYYY" [(ngModel)]="addForm.estimate_date"></ion-datetime>
      </ion-item>
    </ion-list>

    <ion-list>
      <ion-item>
        <ion-label>Обязательная</ion-label>
        <ion-toggle [(ngModel)]="addForm.important"></ion-toggle>
      </ion-item>

    </ion-list>

    <button full (click)="createTask()" *ngIf="!_navParams.data.task">
      Добавить
    </button>

    <button full (click)="updateTask()" *ngIf="_navParams.data.task">
      Сохранить
    </button>
  </ion-content>`
})
class MyModal {
  addForm: any;

  constructor(
    private viewCtrl: ViewController,
    private ds: DataService,
    private nav: Nav,
    private menu: MenuController,
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
          estimate_date: (this._navParams.data.task.estimate_date) ? this._navParams.data.task.estimate_date : moment(new Date()).format('YYYY-MM-DD'),
          estimate_time: hours + ':' + min,
          backlog: (this._navParams.data.task.estimate_date == null) ? true : false,
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
          this.viewCtrl.dismiss();
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
          this.viewCtrl.dismiss();
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
        <ion-datetime displayFormat="DD-MM-YYYY" [(ngModel)]="today" (ngModelChange)="selectDate($event)"></ion-datetime>
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
  templateUrl: 'build/pages/tasks/tasks.html',
  providers: [DataService],
  pipes: [OrderBy, DateFormatPipe]
})
export class TasksScreen {
  @ViewChild('popoverContent', {read: ElementRef}) content: ElementRef;
  @ViewChild('popoverText', {read: ElementRef}) text: ElementRef;

  allTasks: any;
  today: string;
  trueToday: string;
  displayMode: any;
  counters: any;

  constructor(
    private nav: Nav,
    private ds: DataService,
    private viewCtrl: ViewController
  ) {
    this.allTasks = {};
    this.today = moment(new Date().setTime(new Date().getTime() - (3*60*60*1000))).format('YYYY-MM-DD');
    this.trueToday = moment(new Date().setTime(new Date().getTime() - (3*60*60*1000))).format('YYYY-MM-DD');
    this.displayMode = '0';
    this.counters = [];
    this.getTasks(this.today);
  }

  formatedTaskTime (minutes: number) {
    var hours: number = parseInt((parseInt(minutes.toString())  / 60).toString());
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
          this.countTasks();
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

  /*vm.getReqTaskInfoByDate = function(date) {
        //if ($scope.all_user_tasks.length == 0) {
        //    return {p: 0, t: 0, po: 0, to: 0};
        //}

        vm.prepareTaskArray(date.yyyymmdd());

        var info = {
            q_done: 0,
            q_total: vm.all_user_tasks[date.yyyymmdd()][1] ? vm.all_user_tasks[date.yyyymmdd()][1].length : 0,
            q_progress: 0,
            q_estimate: 0,
            o_done: 0,
            o_total: vm.all_user_tasks[date.yyyymmdd()][2] ? vm.all_user_tasks[date.yyyymmdd()][2].length : 0,
            o_progress: 0,
            o_estimate: 0
        };

        if (!vm.all_user_tasks.hasOwnProperty(date.yyyymmdd())) {
            vm.all_user_tasks[date.yyyymmdd()] = {1: [], 2: []};
        }

        angular.forEach(vm.all_user_tasks[date.yyyymmdd()][1], (function (info) {
            return function (element, key) {if (element.done) {info.q_done++;} else {info.q_estimate+=parseInt(element.estimate_time);};};
        })(info));
        angular.forEach(vm.all_user_tasks[date.yyyymmdd()][2], (function (info) {
            return function (element, key) {
                if (element.done) {
                    info.o_done++;
                } else {
                    info.o_estimate+=parseInt(element.estimate_time);
                }
            };
        })(info));

        if(info.q_total>0) {
            info.q_progress = parseInt(info.q_done/info.q_total*100);
        }
        if(info.o_total>0) {
            info.o_progress = parseInt(info.o_done/info.o_total*100);
        }
        return {p: info.q_progress, t:info.q_estimate, po: info.o_progress, to:info.o_estimate};
    };*/
  parseInt(val) {
    return parseInt(val);
  }

  countTasks() {
    this.counters.required_done = 0;
    this.counters.required_not_done = 0;
    this.counters.required_estimate = 0;
    this.counters.optional_done = 0;
    this.counters.optional_not_done = 0;
    this.counters.optional_estimate = 0;
    for(var i in this.allTasks.required_tasks) {
        var item = this.allTasks.required_tasks[i];
        if(item.done) {
          this.counters.required_done++;
        } else {
          this.counters.required_estimate += parseInt(item.estimate_time);
          this.counters.required_not_done++;
        }
    }

    for(var i in this.allTasks.optional_tasks) {
        var item = this.allTasks.optional_tasks[i];
        if(item.done) {
          this.counters.optional_done++;
        } else {
          this.counters.optional_estimate += parseInt(item.estimate_time);
          console.log(this.counters.optional_estimate);
          this.counters.optional_not_done++;
        }
    }
  }

  /*getReqTaskInfoByDate(date) {
        //if ($scope.all_user_tasks.length == 0) {
        //    return {p: 0, t: 0, po: 0, to: 0};
        //}

        this.prepareTaskArray(date.yyyymmdd());

        var info = {
            q_done: 0,
            q_total: this.allTasks.all_tasks[date.yyyymmdd()][1] ? this.allTasks.all_tasks[date.yyyymmdd()][1].length : 0,
            q_progress: 0,
            q_estimate: 0,
            o_done: 0,
            o_total: this.allTasks.all_tasks[date.yyyymmdd()][2] ? this.allTasks.all_tasks[date.yyyymmdd()][2].length : 0,
            o_progress: 0,
            o_estimate: 0
        };

        if (!this.allTasks.all_taskshasOwnProperty(date.yyyymmdd())) {
            this.allTasks.all_tasks[date.yyyymmdd()] = {1: [], 2: []};
        }

        this.allTasks.all_tasks[date.yyyymmdd()][1].forEach((function (info) {
            return function (element, key) {if (element.done) {info.q_done++;} else {info.q_estimate+=parseInt(element.estimate_time);};};
        })(info));
        this.allTasks.all_tasks[date.yyyymmdd()][2].forEach((function (info) {
            return function (element, key) {
                if (element.done) {
                    info.o_done++;
                } else {
                    info.o_estimate+=parseInt(element.estimate_time);
                }
            };
        })(info));

        if(info.q_total>0) {
            info.q_progress = parseInt(info.q_done/info.q_total*100);
        }
        if(info.o_total>0) {
            info.o_progress = parseInt(info.o_done/info.o_total*100);
        }
        return {p: info.q_progress, t:info.q_estimate, po: info.o_progress, to:info.o_estimate};
    };*/

  keys() : Array<string> {
    return Object.keys(this.allTasks.all_tasks);
  }

  logDrag(event) {
    console.log(event);
  }

  showPopover(ev) {
    let popover = Popover.create(PopoverPage, {
      today: this.today,
      cb: (data) => {
        this.today = data;
        this.getTasks(this.today);
      }
    }, {enableBackdropDismiss: true});

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
    if(task.done) {
      this.allTasks.done_tasks++;
    } else {
      this.allTasks.done_tasks--;
    }
    slidingItem.close();
    this.ds.post('core/api/v2/task/update-one', task)
      .subscribe(data => {
        if(!data.error) {
          this.getTasks(this.today);
          //this.countTasks();
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
