import {Component, ViewChild} from '@angular/core';
import {Slides, MenuController, NavParams, Nav, AlertController} from 'ionic-angular';
import {DataService} from '../../services/DataService';
import * as moment from 'moment';
import * as tz from 'moment-timezone';
import 'moment/locale/ru';

@Component({
  templateUrl: 'build/pages/dashboard/dashboard.html'
})
export class DashboardScreen {
  user: any;
  isDebtComplete: boolean;
  isDebtWarn: boolean;
  timerPanel: any;
  timer: any;
  stats: any;

  sliderOptions = {
    initialSlide: 1,
    loop: false,
    pager: true
  };

  constructor(
    private nav: Nav,
    private menu: MenuController,
    private navParams: NavParams,
    private alert: AlertController,
    private ds: DataService)
  {
    this.user = this.navParams.data.user;
    this.timerPanel = this.navParams.data.timerPanel;
    this.isDebtWarn = this.navParams.data.isDebtWarn;
    this.isDebtComplete = this.navParams.data.isDebtComplete;
    this.timer = null;

    this.stats = {
      tasks: {},
      routines: {}
    };

    this.loadStats();

    setInterval(() => {
      this.dailyTimer();
    }, 1000);
  }

  dailyTimer() {
    //var dt = moment(new Date()).tz(vm.user.profile.timezone).format('YYYY/MM/DD HH:mm:ss ZZ')._d;
    var hh = parseInt(moment(new Date()).format('HH'));
    var mm = parseInt(moment(new Date()).format('mm'));
    var ss = parseInt(moment(new Date()).format('ss'));

    var secEnd = 10800,
        serDay = 24 * 3600;

    var curSec = (hh * 3600) + (mm * 60) + (ss),
        diff = secEnd - curSec;

    if (diff < 0) {
        diff = serDay + diff;
    }

    var hours = Math.floor(diff / 3600),
        minutes = Math.floor(diff / 60) % 60,
        seconds = Math.floor(diff) % 60;

    if (hours < 10) hours = 0 + hours;
    if (minutes < 10) minutes = 0 + minutes;
    if (seconds < 10) seconds = 0 + seconds;

    this.timer = hours + ':' + minutes + ':' + seconds;
  };

  hours(val) {
    return (val / 60).toFixed(2);
  };

  loadStats() {
    this.ds.getGo('stat/task', {
      date_start: moment(new Date().setTime(new Date().getTime() - (3*60*60*1000))).format('YYYY-MM-DD'),
      date_end: moment(new Date().setTime(new Date().getTime() - (3*60*60*1000))).format('YYYY-MM-DD')
    })
      .subscribe(data => {
        if(!data.error) {
          this.stats.tasks = data;
        }
      });

    this.ds.getGo('stat/routine', {
      date_start: moment(new Date().setTime(new Date().getTime() - (3*60*60*1000))).format('YYYY-MM-DD'),
      date_end: moment(new Date().setTime(new Date().getTime() - (3*60*60*1000))).format('YYYY-MM-DD')
    })
      .subscribe(data => {
        if(!data.error) {
          this.stats.routines = data;
        }
      });
  }
}
