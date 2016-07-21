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
  @ViewChild(Content) content: Content;

  constructor(
    private ds: DataService,
    private nav: Nav,
    private _navParams: NavParams
  ) {
    console.log(this);
    this.item = this._navParams.data;
    this.comments = [];
    this.getComments(this.item.id);
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
  templateUrl: 'build/pages/news/news.html',
  providers: [DataService],
  pipes: [DateFormatPipe, TimeAgoPipe]
})
export class NewsScreen {
  news: any;
  today: string;
  displayMode: any;
  images: any;

  constructor(
    private ds: DataService,
    private nav: Nav
  ) {
    this.today = moment(new Date().setTime(new Date().getTime() - (3*60*60*1000))).format('YYYY-MM-DD');
    this.displayMode = '0';
    this.news = [];
    this.images = [];
    this.getNewsSubscribers(this.today);
  }

  //
  //api.getAllNews = API_URL + "/core/api/v2/post/get-news-world";
  //api.getFollowNews = API_URL + "/core/api/v2/post/get-news-subscribers";

  getNewsSubscribers(date) {
    let loading = Loading.create();

    this.nav.present(loading);

    this.ds.get('core/api/v2/post/get-news-subscribers', {
      date: date
    })
      .subscribe(data => {
        loading.dismiss();

        if(!data.error) {
          let images = [];
          this.news = data.result;

          this.news.data.forEach(function(item, id, arr) {
            images[id] = [];

            if(item.reply.images) {
              item.reply.images.forEach(function(item, i, arr) {
                images[id].push(item);
              });
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

  getNewsAll(date) {
    let loading = Loading.create();

    this.nav.present(loading);

    this.ds.get('core/api/v2/post/get-news-world', {
      date: date
    })
      .subscribe(data => {
        loading.dismiss();

        if(!data.error) {
          let images = [];
          this.news = data.result;

          this.news.data.forEach(function(item, id, arr) {
            images[id] = [];

            if(item.reply.images) {
              item.reply.images.forEach(function(item, i, arr) {
                images[id].push(item);
              });
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

  openPost(item) {
    this.nav.push(ViewPost, item);
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
