import {Injectable} from '@angular/core';
import {HTTP_PROVIDERS, Http, Headers} from '@angular/http';
import {API} from '../api';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {Storage, LocalStorage} from 'ionic-angular';

@Injectable()
export class DataService {
  http: Http;
  data: Object;
  local: any;
  public getDateObserver: any;
  public getDate: any;

  constructor(http: Http) {
    this.http = http;
    this.data = null;

    this.local = new Storage(LocalStorage);
  }

  setData(data) {
    return this.local.set(data.key, data.value);
  }

  getData(key) {
    return this.local.get(key);
  }

  createAuthorizationHeader(headers:Headers, params, isPost) {
    if(window.localStorage.getItem('token')) {
      headers.append('authorization', window.localStorage.getItem('token'));
    }

    if(isPost) {

      headers.append('X-Requested-With', 'XMLHttpRequest');
    }

    //headers.append('Content-Type', 'application/x-www-form-urlencoded');
    //headers.append('Parameter', params);
  }

  jsonToQueryString(json) {
    return   Object.keys(json).map(function(key) {
            return encodeURIComponent(key) + '=' +
                encodeURIComponent(json[key]);
        }).join('&');
}

  get(url, data) {
    let headers = new Headers();
    this.createAuthorizationHeader(headers, data, false);

    let options = {
      headers: headers,
      search: this.jsonToQueryString(data)
    }

    return this.http.get(`${API.API_ENDPOINT}/${url}`, options).map(res => res.json());
  }

  post(url, data) {
    let headers = new Headers();
    this.createAuthorizationHeader(headers, data, true);

    let options = {
      headers: headers,
      withCredentials: true
    }

    return this.http.post(`${API.API_ENDPOINT}/${url}`, data, options).map(res => res.json());
  }

  /* Auth methods */
  login(data) {
    return this.http.post('http://gofocus.ru/signin', data).map(res => res.json());
  }
}
