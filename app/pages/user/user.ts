import {Component, ViewChild} from '@angular/core';
import {Slides, Nav, NavParams, AlertController} from 'ionic-angular';
import {AuthService} from '../../services/auth-service';
import {DataService} from '../../services/DataService';
import {DateFormatPipe, TimeAgoPipe} from 'angular2-moment';
import {ViewPost} from '../../components/post/viewpost';
import {OrderBy} from '../../pipes/orderBy';
import 'chart.js';
import * as moment from 'moment';
import 'moment/locale/ru';
import {ChartComponent, Chart} from 'ng2-chartjs2';

@Component({
  providers: [DataService],
  pipes: [OrderBy],
  template: `
  <ion-header>
    <ion-navbar light>
      <button menuToggle>
        <ion-icon name="menu">Назад</ion-icon>
      </button>
      <ion-title>Подписки</ion-title>
    </ion-navbar>
  </ion-header>

  <ion-content>
  <ion-searchbar (ionInput)="searchSubscribes($event)" placeholder="Поиск"></ion-searchbar>
    <ion-list>
      <ion-item *ngIf="!subscribes">
        <div text-center padding>
          <ion-spinner></ion-spinner>
        </div>
      </ion-item>

      <ion-item *ngFor="let item of subscribes | orderBy: ['id']">
        <ion-avatar tappable (click)="openProfile(item.id)" item-left>
          <ion-img *ngIf="item.avatar" src="http://dev.gofocus.ru/img/170/{{item.avatar}}"></ion-img>
          <ion-img *ngIf="!item.avatar" src="images/No-Image-Icon_medium.png"></ion-img>
        </ion-avatar>
        <h2 tappable (click)="openProfile(item.id)">{{item.name}} {{item.soname}}</h2>

        <div item-right *ngIf="item.auth_relation" style="margin: 0;padding: 0;">
            <button *ngIf="item.auth_relation[0].status === 0 && item.auth_relation[0].sender_id === self_id" item-right tappable dark (click)="removeFriend(item)">Отписаться</button>
            <button *ngIf="item.auth_relation[0].status === 0 && item.auth_relation[0].recipient_id === self_id"  tappable dark (click)="acceptRequest(item)">Принять запрос</button>
            <button *ngIf="item.auth_relation[0].status === 1" item-right tappable dark (click)="removeFriend(item)">Отписаться</button>
        </div>

        <button *ngIf="!item.auth_relation && item.id !== self_id" item-right tappable dark (click)="sendRequest(item)">Подписаться</button>
      </ion-item>
    </ion-list>
  </ion-content>`
})
class SubscribesList {
  subscribes: any;
  self_id: any;
  user_id: number;
  _temp: any;

  constructor(
    private navParams: NavParams,
    private nav: Nav,
    private ds: DataService,
    private alert: AlertController
  ) {
    this.subscribes = null;
    this.self_id = this.navParams.data.self_id;
    this.user_id = this.navParams.data.id;
    this._temp = [];

    this.getSubscribes(this.user_id);
  }

  getSubscribes(id) {
    this.ds.getGo('social/api/v2/friend/get-user-subscribes', {
      user_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this._temp = [];
          this.subscribes = data.result;

          this._temp.push(this.subscribes);
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }

  searchSubscribes(ev: any) {
    this.subscribes = this._temp[0];

    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.subscribes = this.subscribes.filter((item) => {
        if(item.name && item.soname) {
          console.log((item.name.toLowerCase().indexOf(val.toLowerCase())));
          return ((item.name.toLowerCase().indexOf(val.toLowerCase()) > -1) || (item.soname.toLowerCase().indexOf(val.toLowerCase()) > -1));
        }
      })
    }
  }

  openProfile(id) {
    this.nav.push(UserScreen, {id: id});
  }

  sendRequest(item) {
    this.ds.post('social/api/v2/friend/send-friend-request', {
      recipient_id: item.id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getSubscribes(this.user_id);
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }

  acceptRequest(item) {
    this.ds.post('social/api/v2/friend/accept-friend-request', {
      recipient_id: item.id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getSubscribes(this.user_id);
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }

  removeFriend(item) {
    this.ds.post('social/api/v2/friend/remove-friend', {
      recipient_id: item.id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getSubscribes(this.user_id);
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }
}

@Component({
  providers: [DataService],
  pipes: [OrderBy],
  template: `
  <ion-header>
    <ion-navbar light>
      <button menuToggle>
        <ion-icon name="menu">Назад</ion-icon>
      </button>
      <ion-title>Подписчики</ion-title>
    </ion-navbar>
  </ion-header>

  <ion-content>
  <ion-searchbar (ionInput)="searchSubscribers($event)" placeholder="Поиск"></ion-searchbar>
    <ion-list>
      <ion-item *ngIf="!subscribers">
        <div text-center padding>
          <ion-spinner></ion-spinner>
        </div>
      </ion-item>

      <ion-item *ngFor="let item of subscribers | orderBy: ['id']">
        <ion-avatar tappable (click)="openProfile(item.id)" item-left>
          <ion-img *ngIf="item.avatar" src="http://dev.gofocus.ru/img/170/{{item.avatar}}"></ion-img>
          <ion-img *ngIf="!item.avatar" src="images/No-Image-Icon_medium.png"></ion-img>
        </ion-avatar>
        <h2 tappable (click)="openProfile(item.id)">{{item.name}} {{item.soname}}</h2>

        <div item-right *ngIf="item.auth_relation" style="margin: 0;padding: 0;">
            <button *ngIf="item.auth_relation[0].status === 0 && item.auth_relation[0].sender_id === self_id" item-right tappable dark (click)="removeFriend(item)">Отписаться</button>
            <button *ngIf="item.auth_relation[0].status === 0 && item.auth_relation[0].recipient_id === self_id"  tappable dark (click)="acceptRequest(item)">Принять запрос</button>
            <button *ngIf="item.auth_relation[0].status === 1" item-right tappable dark (click)="removeFriend(item)">Отписаться</button>
        </div>

        <button *ngIf="!item.auth_relation && item.id !== self_id" item-right tappable dark (click)="sendRequest(item)">Подписаться</button>
      </ion-item>
    </ion-list>
  </ion-content>`
})
class SubscribersList {
  subscribers: any;
  _temp: any;
  self_id: any;
  user_id: number;

  constructor(
    private navParams: NavParams,
    private nav: Nav,
    private ds: DataService,
    private alert: AlertController
  ) {
    this.subscribers = null;
    this.self_id = this.navParams.data.self_id;
    this.user_id = this.navParams.data.id;
    this._temp = [];

    this.getSubscribers(this.user_id);
  }

  getSubscribers(id) {
    this.ds.getGo('social/api/v2/friend/get-user-subscribers', {
      user_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this._temp = [];
          this.subscribers = data.result;

          this._temp.push(this.subscribers);
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }

  searchSubscribers(ev: any) {
    this.subscribers = this._temp[0];

    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.subscribers = this.subscribers.filter((item) => {
        if(item.name && item.soname) {
          console.log((item.name.toLowerCase().indexOf(val.toLowerCase())));
          return ((item.name.toLowerCase().indexOf(val.toLowerCase()) > -1) || (item.soname.toLowerCase().indexOf(val.toLowerCase()) > -1));
        }
      })
    }
  }

  openProfile(id) {
    this.nav.push(UserScreen, {id: id});
  }

  sendRequest(item) {
    this.ds.post('social/api/v2/friend/send-friend-request', {
      recipient_id: item.id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getSubscribers(this.user_id);
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }

  acceptRequest(item) {
    this.ds.post('social/api/v2/friend/accept-friend-request', {
      recipient_id: item.id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getSubscribers(this.user_id);
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }

  removeFriend(item) {
    console.log(item);
    this.ds.post('social/api/v2/friend/remove-friend', {
      recipient_id: item.id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getSubscribers(this.user_id);
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }
}

@Component({
  templateUrl: 'build/pages/user/user.html',
  providers: [AuthService, DataService],
  pipes: [DateFormatPipe, TimeAgoPipe],
  directives: [ChartComponent]
})
export class UserScreen {
  user: any;
  _id: any;
  posts: any;
  postMode: any;
  images: any;
  displayMode: any;
  targets: any;
  relations: any;
  self_id: any;
  subscribes: any;
  subscribers: any;
  routines: any;

  constructor(
    private nav: Nav,
    private AuthService: AuthService,
    private navParams: NavParams,
    private ds: DataService,
    private alert: AlertController
  ) {
    this.user = [];
    this.posts = [];
    this.images = [];
    this.postMode = [];
    this.displayMode = '0';
    this.targets = [];
    this.relations = null;
    this.routines = [];
    this.subscribes = [];
    this.subscribers = [];
    console.log(this.navParams);
    this._id = (this.navParams.data.id) ? this.navParams.data.id : null;
    if(!this._id) {
      this.AuthService.getUser().then(data => {
        this._id = JSON.parse(data).id;
        this.self_id = JSON.parse(data).id;
        this.loadPosts(this._id);
        this.getUser(this._id);
      });
    } else {
      this.AuthService.getUser().then(data => {
        this.self_id = JSON.parse(data).id;
        this.loadPosts(this._id);
        this.getUser(this._id);
      });
    }

  }

  sendRequest(id) {
    this.ds.post('social/api/v2/friend/send-friend-request', {
      recipient_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getRelations(this.user.user_id, this.self_id);
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

  getSubscribes(id) {
    this.ds.getGo('social/api/v2/friend/get-user-subscribes', {
      user_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.subscribes = data.result;

        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }

  getSubscribers(id) {
    this.ds.getGo('social/api/v2/friend/get-user-subscribers', {
      user_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.subscribers = data.result;

        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }

  acceptRequest(id) {
    this.ds.post('social/api/v2/friend/accept-friend-request', {
      recipient_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getRelations(this.user.user_id, this.self_id);
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }

  removeFriend(id) {
    this.ds.post('social/api/v2/friend/remove-friend', {
      recipient_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getRelations(this.user.user_id, this.self_id);
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }

  public lineChartData:Array<any> = [
    {data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A'},
    {data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B'},
    {data: [18, 48, 77, 9, 100, 27, 40], label: 'Series C'}
  ];
  public lineChartLabels:Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions:any = {
    animation: false,
    responsive: true
  };
  public lineChartColours:Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';

  compareWeight(a, b) {
    return a.weight - b.weight;
  };

  getRelations(id1, id2) {
    ///social/api/v2/friend/get-relations
    this.ds.get('social/api/v2/friend/get-relations', {
      user_id_1: id1,
      user_id_2: id2
    })
      .subscribe(data => {
        if(!data.error) {
          this.relations = data.result.relationType;

        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }

  getTargets(id: number) {
    if(this.targets.length < 1) {
      ///core/api/v2/target/get
      this.ds.get('core/api/v2/target/get', {
        uid: id
      })
        .subscribe(data => {
          if(!data.error) {
            this.targets = data.result.sort(this.compareWeight);

          } else {
            let alert = this.alert.create({
              title: 'Ошибка!',
              subTitle: data.error,
              buttons: ['OK']
            });

            alert.present(alert);;
          }
        });
      }
  }

  charts: any;

  getRoutines(id: number) {
    if(this.routines.length < 1) {
      ///core/api/v2/target/get
      this.ds.get('core/api/v2/routine/routines-by-user-id', {
        uid: id
      })
        .subscribe(data => {
          if(!data.error) {
            this.routines = data.data.sort(this.compareWeight);
            var arr = [];
            this.charts = [];

            Chart.defaults.global.legend.display = false;

            console.log('before loading');
            data.data.forEach((item) => {
              arr.push(item);
              if(!this.charts[item.id]) {
                this.charts[item.id] = {
                  data:  [{
                    data: [],
                    label: '',
                    //backgroundColor: item.color,
                    borderColor: item.color,
                    spanGaps: true,
                    lineTension: 0.5,
                    options: {
                      height: 250
                    }
                  }],
                  labels: []
                };
              }

              var counter = 0;
              var cnt = 0;

              item.allRoutineReports.forEach(() => {
                cnt++;
              });

              item.allRoutineReports.forEach((chart, i) => {
                if(chart.done) {
                  counter++;
                }

                console.log(moment(chart.date).format('MM.DD'));

                this.charts[item.id].labels.push(moment(chart.date).format('MM.DD'));
                this.charts[item.id].data[0].data.push(counter);

                //if(parseFloat(item.done_routine_reports_stat.percent) >= 90) {
                  //this.charts[item.id].labels.push(chart.date);

                  /*this.charts[item.id].push({
                    'y': chart.date,
                    'a': counter,
                    'b': item.count - counter,
                    data: [
                      {
                        data: [12, 19, 3, 5, 2, 3]
                      }
                    ]
                  });*/
                //} else {
                  //this.charts[item.id].labels.push(chart.date);
                  /*this.charts[item.id].push({
                    'y': chart.date,
                    'a': counter,
                    data: [
                      {
                        label: '# of Votes',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.2)',
                          'rgba(54, 162, 235, 0.2)',
                          'rgba(255, 206, 86, 0.2)',
                          'rgba(75, 192, 192, 0.2)',
                          'rgba(153, 102, 255, 0.2)',
                          'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                          'rgba(255,99,132,1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(255, 206, 86, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(153, 102, 255, 1)',
                          'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                      }
                    ]
                  });*/
                //}
              });
            });

            console.log('charts:');

            console.log(this.charts);

          } else {
            let alert = this.alert.create({
              title: 'Ошибка!',
              subTitle: data.error,
              buttons: ['OK']
            });

            alert.present(alert);;
          }
        });
      }
  }

  getUser(id: number) {
    this.ds.get('social/api/v2/profile/retrieve-profile-by-user-id', {
      uid: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.user = data.result;
          this.getRelations(this.user.user_id, this.self_id);
          this.getSubscribes(this.user.user_id);
          this.getSubscribers(this.user.user_id);
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }

  openPost(item, comment) {
    this.nav.push(ViewPost, {item: item, comment: comment});
  }

  likePost(item) {
    //api.likeAction = API_URL + "/social/api/v2/like/action";

    this.ds.post('social/api/v2/like/action', {
      en_type: 1,
      en_id: item.id
    })
      .subscribe(data => {
        if(!data.error) {
          console.log(item);
          item.likes = data.result.likes.length;
          item.user_liked = data.result.your_like;
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }

  loadMore(page: number, infiniteScroll) {
    console.log(page);

    this.ds.getGo('core/api/v2/post/get', {
      uid: this._id,
      page: page
    })
      .subscribe(data => {
        infiniteScroll.complete();
        if(!data.error) {
          let images = [];
          let next = data.result.data;
          var prev = this.posts.data;

          this.posts = data.result;
          this.posts.data = prev;

          console.log(this.posts.page);

          for(var i=0; i < next.length; i++) {
            this.posts.data.push(next[i]);
          }

          if(this.posts.data) {
            this.posts.data.forEach((item, id, arr) => {
              images[id] = [];

              this.postMode[id] = '0';

              if(item.reply) {
                if(item.reply.images) {
                  item.reply.images.forEach(function(item, i, arr) {
                    images[id].push(item);
                  });
                }
              }

              item.targets.forEach(function(item, i, arr) {
                if(item.images) {
                  item.images.forEach(function(item, i, arr) {
                    images[id].push(item);
                  });
                }
              });
            });

            this.images = images;
          }

          console.log(this);
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
    };

  openSubscribes(data) {
    this.nav.push(SubscribesList, {subscribes: data, id: this.user.user_id, self_id: this.self_id});
  }

  openSubscribers(data) {
    console.log(data);
    this.nav.push(SubscribersList, {subscribers: data, id: this.user.user_id, self_id: this.self_id});
  }

  loadPosts(id: number) {
    //api.getPostsById = API_URL + "/core/api/v2/post/get";
    //api.getMyPosts = API_URL + "/core/api/v2/post/get-my";

    this.ds.getGo('core/api/v2/post/get', {
      uid: id
    })
      .subscribe(data => {
        if(!data.error) {
          let images = [];
          this.posts = data.result;
          if(this.posts.data) {
            this.posts.data.forEach((item, id, arr) => {
              images[id] = [];

              this.postMode[id] = '0';

              if(item.reply) {
                if(item.reply.images) {
                  item.reply.images.forEach(function(item, i, arr) {
                    images[id].push(item);
                  });
                }
              }

              item.targets.forEach(function(item, i, arr) {
                if(item.images) {
                  item.images.forEach(function(item, i, arr) {
                    images[id].push(item);
                  });
                }
              });
            });

            this.images = images;
          }
        } else {
          let alert = this.alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          alert.present(alert);;
        }
      });
  }
}
