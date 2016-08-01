import {Component, ViewChild} from '@angular/core';
import {Slides, Nav, NavParams, Alert} from 'ionic-angular';
import {AuthService} from '../../services/auth-service';
import {DataService} from '../../services/DataService';
import {DateFormatPipe, TimeAgoPipe} from 'angular2-moment';
import {ViewPost} from '../../components/post/viewpost';

@Component({
  providers: [DataService],
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
  <ion-searchbar (ionInput)="getItems($event)" placeholder="Поиск"></ion-searchbar>
    <ion-list>
      <ion-item *ngFor="let item of subscribes" (click)="openProfile(item.profile.user_id)">
        <ion-avatar tappable (click)="openProfile(item.profile.user_id)" item-left>
          <img *ngIf="item.profile.avatar" src="http://api.gofocus.ru/img/170/{{item.profile.avatar}}">
          <img *ngIf="!item.profile.avatar" src="images/No-Image-Icon_medium.png">
        </ion-avatar>
        <h2 tappable (click)="openProfile(item.profile.user_id)">{{item.profile.name}} {{item.profile.soname}}</h2>

        <button item-right *ngIf="item.relation.relationType === 0" tappable dark (click)="sendRequest(item.profile.user_id)">Подписаться</button>
        <button item-right *ngIf="item.relation.relationType === 1" tappable dark (click)="acceptRequest(item.profile.user_id)">Принять запрос</button>
        <button item-right *ngIf="item.relation.relationType === 2 || item.relation.relationType === 3" tappable dark (click)="removeFriend(item.profile.user_id)">Отписаться</button>
      </ion-item>
    </ion-list>
  </ion-content>`
})
class SubscribesList {
  subscribes: any;

  constructor(
    private navParams: NavParams,
    private nav: Nav,
    private ds: DataService
  ) {
    this.subscribes = this.navParams.data.subscribes;
    console.log(this.subscribes);
  }

  openProfile(id) {
    this.nav.push(UserScreen, {id: id});
  }

  /*sendRequest(id) {
    this.ds.post('social/api/v2/friend/send-friend-request', {
      recipient_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getRelations(this.user.user_id, this.self_id);
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

  acceptRequest(id) {
    this.ds.post('social/api/v2/friend/accept-friend-request', {
      recipient_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getRelations(this.user.user_id, this.self_id);
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

  removeFriend(id) {
    this.ds.post('social/api/v2/friend/remove-friend', {
      recipient_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getRelations(this.user.user_id, this.self_id);
        } else {
          let alert = Alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          this.nav.present(alert);
        }
      });
  }*/
}

@Component({
  providers: [DataService],
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
  <ion-searchbar (ionInput)="getItems($event)" placeholder="Поиск"></ion-searchbar>
    <ion-list>
      <ion-item *ngFor="let item of subscribers">
        <ion-avatar tappable (click)="openProfile(item.profile.user_id)" item-left>
          <img *ngIf="item.profile.avatar" src="http://api.gofocus.ru/img/170/{{item.profile.avatar}}">
          <img *ngIf="!item.profile.avatar" src="images/No-Image-Icon_medium.png">
        </ion-avatar>
        <h2 tappable (click)="openProfile(item.profile.user_id)">{{item.profile.name}} {{item.profile.soname}}</h2>

        <button item-right *ngIf="item.relation.relationType === 0" tappable dark (click)="sendRequest(item.profile.user_id)">Подписаться</button>
        <button item-right *ngIf="item.relation.relationType === 1" tappable dark (click)="acceptRequest(item.profile.user_id)">Принять запрос</button>
        <button item-right *ngIf="item.relation.relationType === 2 || item.relation.relationType === 3" tappable dark (click)="removeFriend(item.profile.user_id)">Отписаться</button>
      </ion-item>
    </ion-list>
  </ion-content>`
})
class SubscribersList {
  subscribers: any;

  constructor(
    private navParams: NavParams,
    private nav: Nav,
    private ds: DataService
  ) {
    this.subscribers = this.navParams.data.subscribers;
  }

  openProfile(id) {
    this.nav.push(UserScreen, {id: id});
  }

  /*sendRequest(id) {
    this.ds.post('social/api/v2/friend/send-friend-request', {
      recipient_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getRelations(this.user.user_id, this.self_id);
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

  acceptRequest(id) {
    this.ds.post('social/api/v2/friend/accept-friend-request', {
      recipient_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getRelations(this.user.user_id, this.self_id);
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

  removeFriend(id) {
    this.ds.post('social/api/v2/friend/remove-friend', {
      recipient_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getRelations(this.user.user_id, this.self_id);
        } else {
          let alert = Alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          this.nav.present(alert);
        }
      });
  }*/
}

@Component({
  templateUrl: 'build/pages/user/user.html',
  providers: [AuthService, DataService],
  pipes: [DateFormatPipe, TimeAgoPipe]
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

  constructor(
    private nav: Nav,
    private AuthService: AuthService,
    private navParams: NavParams,
    private ds: DataService
  ) {
    this.user = [];
    this.posts = [];
    this.images = [];
    this.postMode = [];
    this.displayMode = '0';
    this.targets = [];
    this.relations = [];
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
          let alert = Alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          this.nav.present(alert);
        }
      });
  }

  getSubscribes(id) {
    this.ds.get('social/api/v2/friend/get-user-subscribes', {
      user_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.subscribes = data.result;

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

  getSubscribers(id) {
    this.ds.get('social/api/v2/friend/get-user-subscribers', {
      user_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.subscribers = data.result;

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

  acceptRequest(id) {
    this.ds.post('social/api/v2/friend/accept-friend-request', {
      recipient_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getRelations(this.user.user_id, this.self_id);
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

  removeFriend(id) {
    this.ds.post('social/api/v2/friend/remove-friend', {
      recipient_id: id
    })
      .subscribe(data => {
        if(!data.error) {
          this.getRelations(this.user.user_id, this.self_id);
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
          let alert = Alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          this.nav.present(alert);
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
          let alert = Alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          this.nav.present(alert);
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
          item.likes = data.result.likes;
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

  loadMore(page: string) {
    console.log(page);
      /*HttpService.get(page + '&uid=' + vm.id)
        .then(function(response) {
          var prev = vm.posts.data;
          var next = response.data.result.data;

          vm.posts = response.data.result;
          vm.posts.data = prev;

          for(var i=0; i < next.length; i++) {
            vm.posts.data.push(next[i]);
          }
        });*/

    this.ds.getClear(page, {
      uid: this._id
    })
      .subscribe(data => {
        if(!data.error) {
          let images = [];
          let next = data.result.data;
          var prev = this.posts.data;

          this.posts = data.result;
          this.posts.data = prev;

          for(var i=0; i < next.length; i++) {
            this.posts.data.push(next[i]);
          }

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
        } else {
          let alert = Alert.create({
            title: 'Ошибка!',
            subTitle: data.error,
            buttons: ['OK']
          });

          this.nav.present(alert);
        }
      });
    };

  openSubscribes(data) {
    this.nav.push(SubscribesList, {subscribes: data});
  }

  openSubscribers(data) {
    this.nav.push(SubscribersList, {subscribers: data});
  }

  loadPosts(id: number) {
    //api.getPostsById = API_URL + "/core/api/v2/post/get";
    //api.getMyPosts = API_URL + "/core/api/v2/post/get-my";

    this.ds.get('core/api/v2/post/get', {
      uid: id
    })
      .subscribe(data => {
        if(!data.error) {
          let images = [];
          this.posts = data.result;

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
