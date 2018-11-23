import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { TranslateService } from 'ng2-translate';
import { Core } from '../../service/core.service';
import { Observable } from 'rxjs/Observable';
 
declare var wordpress_url: string;
/*
  Generated class for the SocialLoginProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SocialLoginProvider {
    private _trans = {};
    private _activeSocialLink = "";

    constructor(
        public http: Http,
        public iab: InAppBrowser,
        public translate: TranslateService,
        public core: Core
    ) {
        console.log('Hello SocialLoginComponent Component');
        this.translate.get('social_login').subscribe(trans => this._trans = trans);
       
        this.getSocialList();
    }

    getSocialList(): Observable<any> {
    	return new Observable(observable => {
    		let url = wordpress_url + "/wp-json/mobiconnector/settings/getsocialloginlink";
    		let listSocial = [];
	        this.http.get(url).subscribe(
	        	res => {
		            if(res.json()) {
		                listSocial = res.json();
		                listSocial.map(item => {
		                    return item['name'] = this._trans[item.code];
		                });
		            }
		            console.log(listSocial);
		            observable.next(listSocial);
	                observable.complete();
		        }, err => {
		        	console.log(err);
		        	observable.next(listSocial);
	                observable.complete();
		        }
	        )
    	})
       
    }

    resetActiveSocial() {
        let url = this._activeSocialLink + "?reset=1";
        let social_control = this.iab.create(url, '_blank', 'location=yes');
        social_control.on('loadstart').subscribe(
            res => {
                console.log(res.url);
                if(res.url.indexOf("social-complete") != -1) {
                    social_control.close();
                    console.log("Reset social done");
                }
            }
        )
        social_control.on('loaderror').subscribe(res => {
            social_control.close();
            console.log(res);
        });
    }


    private filterSocialId(link:string) {
        let data = link.split('mobiconnector-social-complete.php?')[1].split('&');
        let user_id = data[0].split('=')[1];
        let social_id = "";
        if(link.indexOf('linkedin') != -1) {
            social_id = data[1].split('=')[1].replace(/[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,'');
        } else {
            social_id = data[1].split('=')[1].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,'');
        }
        let params = {
            user_id: user_id,
            social_id: social_id
        }
        console.log(params);
        return params;
    }

    socialLoginToken(loginLink: string): Observable<any>{
    	return new Observable(observable => {
    		let token = "";
    		this._activeSocialLink = loginLink;
	        let openCheckout = this.iab.create(loginLink, '_blank', 'location=no');
	        openCheckout.on('loadstart').subscribe(res => {
	            console.log(res);
	            if (res.url.indexOf('mobiconnector-social-complete.php?user_id=') != -1) {
	                openCheckout.close();
	                let params = this.filterSocialId(res.url);
	                this.http.get(wordpress_url+"/wp-json/mobiconnector/settings/getsocialuserinfo", {
	                    search: this.core.objectToURLParams(params)
	                }).subscribe(
	                    res => {
	                        console.log(res);
	                        console.log(res.json());
	                        if(res.json()) token = res.json()['token'];
                        	observable.next(token);
                			observable.complete();
	                    }, err => {
	                    	console.log('Get token err', err);
	                    }
	                );
	            }
	        })
	        openCheckout.on('loaderror').subscribe(res => {
	            openCheckout.close();
	            console.log(res);
	            observable.next(token);
                observable.complete();
	        });
    	})
       
    }

}
