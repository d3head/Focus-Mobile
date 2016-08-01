import {Component, Input, Output, EventEmitter, ViewChild, Directive, ElementRef} from '@angular/core';
import {DataService} from '../../services/DataService';
import {Slides, Nav, Popover, NavParams, Alert, Modal, ViewController, Loading, Content, ActionSheet} from 'ionic-angular';
import {Camera} from 'ionic-native';
import * as moment from 'moment';
import 'moment/locale/ru';
import {ViewPost} from './viewpost';
import {DateFormatPipe, TimeAgoPipe} from 'angular2-moment';

@Component({
    templateUrl: 'build/components/post/post.html',
    selector: '[post]',
    providers: [DataService],
})
export class PostDirective {
    images: any;
    postMode: any;
    element: any;
    templateUrl: 'build/components/post/post.html'
    public news: any;

    constructor(
      element: ElementRef,
      private nav: Nav,
      private ds: DataService
    ) {
      this.element = element;

      this.images = [];
      this.postMode = [];
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
