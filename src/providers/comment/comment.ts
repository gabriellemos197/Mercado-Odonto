// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Config } from '../../service/config.service';
import { Core } from '../../service/core.service';

/*
  Generated class for the CommentProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CommentProvider {
	private wordpress_url = '';
	private url_get = "/wp-json/wooconnector/product/getnewcomment";
	private url_add = "/wp-json/wooconnector/product/postreviews";

    constructor(public http: Http, public config: Config, public core: Core) {
   		console.log('Hello CommentProvider Provider');
   		this.wordpress_url = config['wordpress_url'];
    }

    get(body: Object): Observable<Object[]> {
        let url = this.wordpress_url + this.url_get;
    	return this.http.get(url, {
        	search: this.core.objectToURLParams(body)
    	}).map((res:Response) => res.json())
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    add(body: Object, token: string): Observable<Object[]> {
        // let bodyString = JSON.stringify(body); // Stringify payload
        let headers = new Headers();
        headers.set('Content-Type', 'application/json; charset=UTF-8');
        headers.set('Authorization', 'Bearer ' + token);
        let options = new RequestOptions({ headers: headers }); // Create a request option
        let url = this.wordpress_url + this.url_add;

        return this.http.post(url, body, options)
	    .map((res:Response) => res.json())
	    .catch((error:any) => Observable.throw(error.json().error || 'Server error')); 
    }   
}
