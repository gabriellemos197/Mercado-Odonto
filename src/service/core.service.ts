import { Injectable  } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Http, Headers } from '@angular/http';
import { LoadingController, Platform, AlertController} from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';
import { Config } from './config.service';
import { TranslateService } from 'ng2-translate';
import { Toast } from '@ionic-native/toast';

declare var OAuth: any;
declare var consumer_key: string;
declare var consumer_secret: string;
declare var oauthSignature: any;
declare var request_timeout: number;
declare var notice_timeout: number;
declare var wordpress_url;

@Injectable()
export class Core {
	loading: any;
	isLoading:boolean;
	constructor(
		public loadingCtrl: LoadingController,
		public translate: TranslateService,
		public platform: Platform,
		private Network: Network,
        private config: Config,
        public alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private storage: Storage,
        public Toast: Toast,
        public http: Http

	) {}
	getSignature(method:string, url:string, params:Object=null):Object{
		var oauth_data: any;
		if(this.config['check_https']){
			oauth_data = {
				consumer_key:consumer_key,
				consumer_secret:consumer_secret
			}
			Object.assign(oauth_data, params);
		} else {
			var oauth = new OAuth({
				consumer: {
					public: consumer_key,
					secret: consumer_secret
				},
				signature_method: 'HMAC-SHA1',
				hash_function: function(){}
			});
			oauth_data = {
				oauth_consumer_key: oauth.consumer.public,
				oauth_nonce: oauth.getNonce(),
				oauth_signature_method: oauth.signature_method,
				oauth_timestamp: oauth.getTimeStamp(),
			};
			Object.assign(oauth_data, params);
			oauth_data.oauth_signature = oauthSignature.generate(method,url,oauth_data,oauth.consumer.secret);
		}
		return oauth_data;
	}
	objectToURLParams(object): URLSearchParams {
		let params: URLSearchParams = new URLSearchParams();
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				if(Array.isArray(object[key])){
					object[key].forEach(val => {
						params.append(key+'[]', val);
					});
				}
				else params.set(key, object[key]);
			}
		}
		return params;
	}

	objectToStringParams(object): any {
		let params = "";
		let i = 0;
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				if (i == 0) {
					params += key + "=" + object[key];
				} else {
					params += "&" + key + "=" + object[key];
				}
			}
			i++;
		}
		return params;
	}

	showLoading(content:string = null) {
		if(!this.isLoading){
			this.isLoading = true;
			this.loading = this.loadingCtrl.create({
				content: content
			});
			this.loading.present();
			// this.loading.onDidDismiss(() => {
			// 	this.isLoading = false
			// });
			setTimeout(() => { this.hideLoading();}, request_timeout);
			this.Network.onDisconnect().subscribe(() => { this.hideLoading();});
		}
    }
    
    hideLoading() { 
    	this.isLoading = false;
    	this.loading.dismiss(); 
    }
    
	getVariation(variations:Object[], attributes:Object[]):Observable<Object> {
		return new Observable(observable => {
			let variation:Object;
			let _attr = JSON.stringify(attributes).toLowerCase();
			let maxEqual = 0;
			variations.forEach(val => {
				let equalAttr = 0;
				val["attributes"].forEach(attr => {
					if(_attr.indexOf(JSON.stringify(attr).toLowerCase()) != -1) equalAttr++;
				});
				if(equalAttr > maxEqual && equalAttr == val["attributes"].length) {
					variation = val;
					maxEqual = equalAttr;
				}
			});
			if(!variation) variation = variations.filter(
				item => item["attributes"].length == 0
			)[0];
			observable.next(JSON.parse(JSON.stringify(variation)));
			observable.complete();
		});
    }
    
	filterProfile(profile:Object):any {
		if(!profile) profile = {};
		return {
			billing_first_name: profile['billing_first_name'],
			billing_last_name: profile['billing_last_name'],
			billing_company: profile['billing_company'],
			billing_country: profile['billing_country'],
			billing_state: profile['billing_state'],
			billing_address_1: profile['billing_address_1'],
			billing_address_2: profile['billing_address_2'],
			billing_city: profile['billing_city'],
			billing_postcode: profile['billing_postcode'],
			billing_phone: profile['billing_phone'],
			shipping_first_name: profile['shipping_first_name'],
			shipping_last_name: profile['shipping_last_name'],
			shipping_company: profile['shipping_company'],
			shipping_country: profile['shipping_country'],
			shipping_state: profile['shipping_state'],
			shipping_address_1: profile['shipping_address_1'],
			shipping_address_2: profile['shipping_address_2'],
			shipping_city: profile['shipping_city'],
			shipping_postcode: profile['shipping_postcode']
		};
	}

    /**
     * scroll view to class
     * @param className
     */
	scrollToView(className) {
		try {
		  var elements = document.getElementsByClassName(className);
			if (elements.length == 0) {
				return;
            }
            console.log(elements[0]);
			elements[0].scrollIntoView({behavior: "smooth"});
		}
		finally{
			className = null;
		}
    }

    /**
     * show toast
     * @param 
     *      msg string = null
     *      duration number = notice_timeout
     *      cssClass: string = null
     */
    showToastBottom(msg: string = null, duration: number = notice_timeout, cssClass: string = null){
        let toast = this.toastCtrl.create({
            message: msg,
            duration: duration,
            position: 'bottom',
            cssClass: cssClass
        });
        toast.onDidDismiss(() => {
            console.log('Dismissed toast');
        });
        toast.present();
    }

    /**
   	 * auto focus on input 
     */
    autoFocus(target) { 
        // let element = target._elementRef.nativeElement;
        // element.scrollIntoView({behavior: "smooth"});
        setTimeout(function() {target.setFocus()}, 500)
    }

    /**
     * format product dimensions
     * @param dimensions Object
     * @return string
     */
	formatDimensions(value):string {
        let result = (value.length + " x " + value.width + " x " +  value.height).trim();
        if(result.substring(0,1)=="x") {
            result = result.substring(1);
        }
        if(result.slice(-1)=="x") {
            result = result.substring(0, result.length - 1);
        }
        return result;
	}

	/**
     * add sort type to params when search
     * require sort_type: -date, price, -price, -name, name, popularity, rating_sort
     * @param params Object
     * @param sort_type String 
     * @return Object
     */
    addSortToSearchParams(params: Object, sort_type: String) {
    	if(sort_type == "-date") {
            params['post_order_by'] = 'date';
            params['post_order_page'] = 'ASC';
        } else if (sort_type == 'price') {
            params['price_sort'] = 1;
            params['post_order_page'] = 'ASC';
        } else if (sort_type == '-price') {
            params['price_sort'] = 1;
            params['post_order_page'] = 'DESC';
        } else if (sort_type == '-name') {
            params['name_sort'] = 1;
            params['post_order_page'] = 'DESC';
        } else if (sort_type == 'name') {
            params['name_sort'] = 1;
            params['post_order_page'] = 'ASC';
        } else if (sort_type == 'popularity') {
        	params['popularity_sort'] = 1;
        	params['post_order_page'] = 'DESC';
        } else if (sort_type == 'rating') {
        	params['rating_sort'] = 1;
        	params['post_order_page'] = 'DESC';
        }
        return params;
    }
   
    /**
     * find country from country code
     * @param list Object[]
     * @param country_code String
     */
     findCountryFromCode(list, country_code) {
     	let elementPos = list.map(function(x) {return x.value; }).indexOf(country_code);
		let objectFound = list[elementPos];
		return objectFound;
     }

    // removeToken() {
    // 	this.storage.remove('login').then(() => {
    // 		this.translate.get('general.expired_token').subscribe(trans => {
    // 			let alert = this.alertCtrl.create({
		  //           message: trans['message'],
		  //           cssClass: 'alert-no-title',
		  //           enableBackdropDismiss: false,
		  //           buttons: [trans['button']]
		  //       });
		  //       alert.present();
    // 		})
	   //  });
    // }

    getNestedChildren(arr, parent) {
	    var out = []
	    for(var i in arr) {
	        if(arr[i].parent == parent) {
	            var children = this.getNestedChildren(arr, arr[i].id)

	            if(children.length) {
	                arr[i].children = children
	            }
	            out.push(arr[i])
	        }
	    }
	    return out;
    }


    /**
     * change url base on language settings
     * @param current_url string
     * @return new_url string
     */
    initialUrl() {
        let new_url = this.config['base_url'];
        let config = this.config['app_settings'];
        if (!config['hide_default']
            || (config['hide_default'] && this.config['lang']['language'] != config['default_qtranslate_languages']['language'])) {
            if (config['url_mode'] == 1) {
                this.config['language_param'] = true;
                this.config['url_mode'] = "query";
            } else if (config['url_mode'] == 2) {
                this.config['url_mode'] = "pre-path";
                new_url = this.config['base_url'] + '/' + this.config['lang']['language'];
            } else if (config['url_mode'] == 3) {
                this.config['url_mode'] = "pre-domain";
                new_url = this.config['lang']['language'] + '.' + this.config['base_url'];
            }
        } else {
            this.config['language_param'] = false;
            this.config['url_mode'] = "hide";
            new_url = this.config['base_url'];
        }
        this.config['wordpress_url'] = new_url;
        return new_url;
    }

    /*
		
    */

    removeToken() {
	  	this.storage.remove('user').then(() => {
			this.storage.remove('login').then(() => {
				// this.Toast.showShortBottom(message)
			});
		});
	}
  	checkTokenLogin(token: string):Observable<any> {
	  	return new Observable(observable => {
	  		let headers = new Headers();
		  		headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
				headers.set('Authorization', 'Bearer ' + token);
	  		this.http.post(wordpress_url + '/wp-json/mobiconnector/jwt/token/validate',{}, {
	  			headers: headers,
				withCredentials: true
	  		}).subscribe(data => {
	  			observable.next(data.json());
	            observable.complete();
	  		}, err => {
	  			console.log(err.json());
	  			observable.next(err.json());
	            observable.complete();
	  		});
	  	});
  	}
}