import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from 'ng2-translate';
import { Config } from '../../service/config.service';

// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';

// Page
import { OrderdetailPage } from '../orderdetail/orderdetail';
import { SigninPage } from '../signin/signin';

import { FADEIN } from '../../app/loading-animation';

@Component({
    selector: 'page-order',
    templateUrl: 'order.html',
    animations: FADEIN,
})
export class OrderPage {
    OrderdetailPage = OrderdetailPage;
    SigninPage = SigninPage;
    login: Object = {};
    data: Object[] = [];
    date_format: string;
    page = 1;
    checkOrder: boolean = false;
    @ViewChild('footer') buttonFooter;
    @ViewChild(Content) content: Content;
    display_status: boolean = false;
    trans: Object = {};
    lang: any;
    isCache: boolean = false;
    wordpress_url = "";
    wordpress_order = '';
    loaded_data = false;
    time = new Date().getTime();

    constructor(
        public http: Http,
        public core: Core,
        public storage: Storage,
        public navCtrl: NavController,
        public config: Config,
        public navParams: NavParams,
        public translate: TranslateService
    ) {
        this.wordpress_url = config['wordpress_url'];
        this.wordpress_order = this.wordpress_url + '/wp-json/wooconnector/order';
        this.lang = config['lang']['language'];
        this.date_format = config['app_settings']['date_format'];
        translate.get('order').subscribe(trans => {
            if (trans) this.trans = trans;
        });
        this.storage.get('login').then(val => {
            if (val && val['token']) {
                this.login = val;
                this.getData().subscribe(order => {
                    this.checkOrder = true;
                    if (order.length > 0) this.page++;
                    this.data = order;
                    console.log(this.data);
                    this.loaded_data = true;
                });
            } else this.navCtrl.push(SigninPage);
        });
    }

    scrollHandler(event) {
        let pos = document.getElementById('order-content').scrollTop;
        if (pos != 0) {
            this.content.setElementAttribute('scroll', true);
        } else {
            this.content.setElementAttribute('scroll', false);
        }
    }

    ionViewDidEnter() {
        this.buttonFooter.update_footer();
        if (this.isCache) {
            this.checkOrderDetail();
        } else {
            this.isCache = true;
        }
    }

    totalItem(object: any): string {
        let obj;
        let total = 0;
        let result = "";
        for (obj in object) {
            if (object.hasOwnProperty(obj)) {
                total += Number(object[obj]['quantity']);
            }
        }
        if (total == 1) {
            result = total.toString() + ' ' + this.trans['item'];
        } else {
            result = total.toString() + ' ' + this.trans['items'];
        }
        return result;
    }

    getData(): Observable<Object[]> {
        return new Observable(observable => {
            let params = { post_per_page: 10, post_num_page: this.page, time: this.time };
            let headers = new Headers();
            headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            headers.set('Authorization', 'Bearer ' + this.login["token"]);
            this.http.get(this.wordpress_order + '/getorderbyterm', {
                search: this.core.objectToURLParams(params),
                headers: headers
            }).subscribe(res => {
                observable.next(res.json());
                observable.complete();
            }, err => {
                console.log(err);
                if (err.json()["message"] == 'Expired token') {
                    this.translate.get('errorMessage.expiredToken').subscribe(trans => {
                        this.core.showToastBottom(trans);
                    });
                } else {
                    this.core.showToastBottom(err.json()["message"]);
                }
            });
        });
    }

    shop() {
        this.navCtrl.popToRoot();
    }

    load(infiniteScroll) {
        setTimeout(() => {
            this.page++;
            this.getData().subscribe(order => {
                this.data = this.data.concat(order);
                infiniteScroll.complete();
            });
        }, 500);
    }

    checkOrderDetail() {
        this.storage.get('order_update').then(res => {
            if (res) {
                let i;
                console.log(this.data);
                for (i = 0; i < this.data.length; i++) {
                    if (this.data[i]['id'] == res['id']) {
                        this.data[i]['status'] = res['status'];
                        break;
                    }
                }
            }
        });
    }
}
