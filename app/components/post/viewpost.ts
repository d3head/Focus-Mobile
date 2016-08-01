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
