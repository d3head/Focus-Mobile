import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {DataService} from '../../services/DataService';
import {Slides, Nav, Popover, NavParams, Alert, Modal, ViewController, Loading, Content, ActionSheet} from 'ionic-angular';
import {Camera} from 'ionic-native';
import * as moment from 'moment';
import 'moment/locale/ru';

import {DateFormatPipe, TimeAgoPipe} from 'angular2-moment';

@Component({
  templateUrl: 'build/pages/news/full-news.html',
  providers: [DataService],
  pipes: [DateFormatPipe, TimeAgoPipe]
})
export class ViewPost {
  item: any;
  comments: any;
  commentField: any;
  postMode: any;
  @ViewChild(Content) content: Content;

  constructor(
    private ds: DataService,
    private nav: Nav,
    private _navParams: NavParams
  ) {
    console.log(this);
    this.item = this._navParams.data.item;
    this.comments = [];
    this.getComments(this.item.id);
    this.postMode = '0';
  }

  //api.getComments = API_URL + "/social/api/v2/comment/get";
  //  api.postComment = API_URL + "/social/api/v2/comment/create";
  //  api.replyComment = API_URL + "/social/api/v2/comment/reply";

  sendComment() {
    this.ds.post('social/api/v2/comment/create', {
      en_type: 1,
      en_id: this.item.id,
      message: this.commentField
    })
      .subscribe(data => {
        if(!data.error) {
          console.log(data);
          this.commentField = "";
          this.comments.data.push(data.result);

          setTimeout(() => {
            this.content.scrollToBottom(200);

          }, 100);
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

  /*vm.sendComment = function(data) {
        if(vm.isReply) {
          CommentsService.replyComment({en_type: 1, en_id: vm.id, message: data, comment_id: vm.replyId})
            .then(function(response) {
              vm.text = null;
              vm.replyId = null;
              vm.isReply = false;
              vm.comments.data.push(response.data.result);
            });
        } else {
          CommentsService.postComment({en_type: 1, en_id: vm.id, message: data})
            .then(function(response) {
              vm.text = null;
              vm.replyId = null;
              vm.comments.data.push(response.data.result);
            });
        }
      };*/

  getComments(id) {
    this.ds.get('social/api/v2/comment/get', {
      en_type: 1,
      en_id: id
    })
      .subscribe(data => {

        if(!data.error) {
          this.comments = data.result;

          setTimeout(() => {
            this.content.scrollToBottom(200);

          }, 100);
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

  showActions(item) {
    let actionSheet = ActionSheet.create({
      buttons: [
        {
          text: 'Ответить',
          handler: () => {
            console.log(item);
          }
        }, {
          text: item.user.profile.name + ' ' + item.user.profile.soname,
          handler: () => {
            console.log(item);
          }
        },{
          text: 'Отмена',
          role: 'cancel'
        }
      ]
    });

    this.nav.present(actionSheet);
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
  providers: [DataService]
})
class PopoverPage {
  background: string;
  contentEle: any;
  textEle: any;
  today: any;
  callback: any;

  constructor(
    private navParams: NavParams,
    private ds: DataService,
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
  templateUrl: 'build/pages/news/news.html',
  providers: [DataService],
  pipes: [DateFormatPipe, TimeAgoPipe]
})
export class NewsScreen {
  news: any;
  today: string;
  displayMode: any;
  images: any;
  postMode: any;

  constructor(
    private ds: DataService,
    private nav: Nav
  ) {
    this.today = moment(new Date().setTime(new Date().getTime() - (3*60*60*1000))).format('YYYY-MM-DD');
    this.displayMode = '0';
    this.news = [];
    this.images = [];
    this.postMode = [];
    this.getNewsSubscribers(this.today);
  }

  //
  //api.getAllNews = API_URL + "/core/api/v2/post/get-news-world";
  //api.getFollowNews = API_URL + "/core/api/v2/post/get-news-subscribers";

  /*countRoutines() {
    this.news.data.forEach((item, id) => {
      item.routines.forEach((item, id) => {
        var countdone = 0;

        /*_.each(this.routines.routine_reports[i].routine[0].routine_reports, function(a, b) {
          console.log(a);
          console.log(b);
        });*/

        /*for(var i2=0; i2 < this.routines.routine_reports[i].routine[0].routine_reports; i2++) {
          if(this.routines.routine_reports[i].routine[0].routine_reports[i2].done) {
            countdone++;
          }
        }

        item.routine_reports[i].routine[0].routine_reports.forEach((item, id) => {
          if(item.done) {
            countdone++;
          }
        });

        this.routines.routine_reports[i].routine[0].countdone = countdone;
        this.routines.routine_reports[i].routine[0].percent = Math.round(countdone/this.routines.routine_reports[i].routine[0].count * 100);
      });
    });
    }
  }*/

  getNewsSubscribers(date) {
    let loading = Loading.create();

    this.nav.present(loading);
    this.news = [];

    this.ds.get('core/api/v2/post/get-news-subscribers', {
      date: date
    })
      .subscribe(data => {
        loading.dismiss();

        if(!data.error) {
          let images = [];
          this.news = data.result;

          this.news.data.forEach((item, id, arr) => {
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

  showPopover(ev) {
    let popover = Popover.create(PopoverPage, {
      today: this.today,
      cb: (data) => {
        this.today = data;
        console.log(this);
        if(this.displayMode == '0') {
          this.getNewsSubscribers(this.today);
        } else if(this.displayMode == '1') {
          this.getNewsAll(this.today);
        }
      }
    }, {enableBackdropDismiss: true});

    this.nav.present(popover, { ev: ev });
  }

  getNewsAll(date) {
    let loading = Loading.create();

    this.nav.present(loading);
    this.news = [];

    this.ds.get('core/api/v2/post/get-news-world', {
      date: date
    })
      .subscribe(data => {
        loading.dismiss();

        if(!data.error) {
          let images = [];
          this.news = data.result;

          this.news.data.forEach((item, id, arr) => {
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
}
