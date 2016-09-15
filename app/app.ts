import {Component, ViewChild, Input, Output, Inject, EventEmitter, enableProdMode} from '@angular/core';
import {ionicBootstrap, Platform, AlertController, MenuController, Nav, Events, Storage, LocalStorage, ToastController} from 'ionic-angular';
import {StatusBar, Keyboard, Network, LocalNotifications, Push, OneSignal, Splashscreen} from 'ionic-native';
import {HelloIonicPage} from './pages/hello-ionic/hello-ionic';
import {ListPage} from './pages/list/list';
import {StartScreen} from './pages/start-screen/start-screen';
import {AuthService} from './services/auth-service';
import {SyncEvent} from 'ts-events';
import {DataService} from './services/DataService';
import * as moment from 'moment';
import * as tz from 'moment-timezone';
import 'moment/locale/ru';
import {TasksScreen} from './pages/tasks/tasks';
import {GoalsScreen} from './pages/goals/goals';
import {RoutinesScreen} from './pages/routines/routines';
import {NewsScreen} from './pages/news/news';
import {SettingsScreen} from './pages/settings/settings';
import {UserScreen} from './pages/user/user';
import {PlayFocusScreen} from './pages/play/play';
import {DashboardScreen} from './pages/dashboard/dashboard';
enableProdMode();

@Component({
  templateUrl: 'build/app.html',
  providers: [AuthService, DataService]
})
class MyApp {
  @ViewChild(Nav) nav: Nav;
  @Output() updateUser = new EventEmitter();
  //rootPage: any = (!AuthService.isAuthorized()) ? StartScreen : HelloIonicPage;
  rootPage: any = StartScreen;
  pages: Object;
  user: any;
  local: any;
  API_URL: any;
  timerPanel: any;
  isDebtComplete: any;
  isDebtWarn: any;
  until: boolean;
  timer: any;

  constructor(
    private platform: Platform,
    private menu: MenuController,
    private AuthService: AuthService,
    public events: Events,
    private ds: DataService,
    private alert: AlertController
    //private Toast: ToastController
  ) {
    //this.API_URL = API_URL;
    this.initializeApp();
    this.local = new Storage(LocalStorage);
    // set our app's pages
    this.pages = {
      tasks: TasksScreen,
      goals: GoalsScreen,
      routines: RoutinesScreen,
      news: NewsScreen,
      settings: SettingsScreen,
      user: UserScreen,
      dashboard: DashboardScreen
    };
    //console.log(moment(new Date()).tz.names());
    this.user = [];
    this.timerPanel = null;
    this.timer = null;
    this.until = false;

    this.events.subscribe('user:login', (data) => {
      this.user = data[0].user[0];
      this.getTimerPanel();
    });

    this.events.subscribe('user:update', (data) => {
      this.updateUserInfo();
    });

    this.AuthService.isAuthorized().then(data => {
      if(data) {
        this.AuthService.getUser().then(data => {
          this.user = JSON.parse(data);
          setTimeout(() => {
            console.log('debug Auth:');
            if(this.user.purchased_billing_rate[0].activated) {
              this.getTimerPanel();
              this.nav.setRoot(TasksScreen);
            } else {
              this.nav.setRoot(PlayFocusScreen, {user: this.user});
            }
          }, 1000);

          window["plugins"].OneSignal.sendTag("id", this.user.id);
          window["plugins"].OneSignal.registerForPushNotifications();
          window["plugins"].OneSignal.setSubscription(true);

          this.updateUserInfo();
        });
      } else {
        Splashscreen.hide();
      }
    });

    this.AuthService.updateUserInfo.subscribe(user => this.user = user);
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

    if (hours < 10) hours = parseInt('0' + hours);
    if (minutes < 10) minutes = parseInt('0' + minutes);
    if (seconds < 10) seconds = parseInt('0' + seconds);

    this.timer = hours + ':' + minutes + ':' + seconds;
    this.until = (hours <= 3) ? true : false;
  };

  updateUserInfo() {
    this.ds.get('core/api/v2/user/get-user-info', {})
      .subscribe(data => {
        if(!data.error) {
          this.user = data.user[0];
          this.local.set('user', JSON.stringify(data.user[0]));
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

  activateAccount() {
    this.ds.post('core/api/v2/user/activate', {})
      .subscribe(data => {
        if(!data.error) {
          let alert = this.alert.create({
            title: 'Система активирована!',
            buttons: [{
              text: 'OK',
              handler: () => {
                this.updateUserInfo();
              }
            }]
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

  getTimerPanel() {
    ///core/api/v2/user/timer-panel
    console.log('debug TimerPanel');
    if(this.user.purchased_billing_rate[0].activated) {
      setInterval(() => {
        this.dailyTimer();
      }, 1000);

      console.log('getTimerPanel here');

      this.ds.get('core/api/v2/user/timer-panel', {})
        .subscribe(data => {
          console.log('data:');
          console.log(data);
          if(!data.error) {
            this.timerPanel = data.result;

            console.log(this.timerPanel);

            let sunday = function() {
              var myDate = new Date();

              if(myDate.getDay() == 6) {
                return true;
              } else {
                return false;
              }
            };

            this.isDebtComplete = function() {
              if(this.timerPanel.checkers.not_done_tasks.count < 6) {
                return true;
              } else {
                return false;
              }
            };

            this.isDebtWarn = function() {
              if(this.timerPanel.checkers.not_done_tasks.count < 6) {
                return true;
              } else {
                if(sunday()) {
                  return false;
                } else {
                  return true;
                }
              }
            };
          }
        });
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      StatusBar.styleDefault();
      Keyboard.disableScroll(true);
      console.log('App Init!');
      var notificationOpenedCallback = function(jsonData) {
        //console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
      };

      window["plugins"].OneSignal.init("41b03c5b-9b88-4415-9e06-804679cbbb27",
                                     {googleProjectNumber: "", autoRegister: true},
                                     notificationOpenedCallback);

      window["plugins"].OneSignal.enableInAppAlertNotification(true);

      window["plugins"].OneSignal.getTags(function(tags) {
        console.log('Tags Received: ' + JSON.stringify(tags));
      });

      // Show notification when internet was disconnected
      /*let disconnectSubscription = Network.onDisconnect().subscribe(() => {
        let toast = this.Toast.create({
          message: 'Отсутсвует интернет-подключение',
          position: 'top'
        });

        toast.onDidDismiss(() => {
          console.log('Dismissed toast');
        });

        toast.present(toast);

        let connectSubscription = Network.onConnect().subscribe(() => {
          toast.dismiss();
        });
      });*/
    });
  }

  getUser() {
    this.AuthService.getUser().then(data => {
      this.user = JSON.parse(data);
    });
  }

  openPage(page, data) {
    this.menu.close();
    this.nav.setRoot(this.pages[page], data);
  }
}
ionicBootstrap(MyApp, [], {
  backButtonText: 'Назад'
});
