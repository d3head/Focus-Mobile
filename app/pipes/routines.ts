import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/en-ca';

@Pipe({name: 'todayRoutines', pure: false})
export class TodayRoutines implements PipeTransform {

  transform(input:any): any{
    var array = [];
    input.forEach((item, id) => {
      if(item.routine.remind_days.indexOf(moment(new Date()).format('dd')) !== -1 && !item.done) {
        array.push(item);
      }
    });

    return array;
  }
}

@Pipe({name: 'anotherRoutines', pure: false})
export class AnotherRoutines implements PipeTransform {

  transform(input:any): any{
    var array = [];
    input.forEach((item, id) => {
      if(item.routine.remind_days.indexOf(moment(new Date()).format('dd')) == -1 && !item.done) {
        array.push(item);
      }
    });

    return array;
  }
}

@Pipe({name: 'doneRoutines', pure: false})
export class DoneRoutines implements PipeTransform {

  transform(input:any): any{
    var array = [];
    input.forEach((item, id) => {
      if(item.done) {
        array.push(item);
      }
    });

    return array;
  }
}
