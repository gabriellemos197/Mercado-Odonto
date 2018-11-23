import { Component, NgZone, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, Content, Platform, Navbar } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { StorageMulti } from '../../service/storage-multi.service';
import { CallNumber } from '@ionic-native/call-number';
import { Config } from '../../service/config.service';
import { DetailPage } from '../detail/detail';

// Custom
import { Storage } from '@ionic/storage';
import { Core } from '../../service/core.service';
import { Toast } from '@ionic-native/toast';
import { TranslateService } from 'ng2-translate';
import { OrderPage } from '../order/order';

import { FADEIN } from '../../app/loading-animation';

@Component({
    selector: 'page-orderdetail',
    templateUrl: 'orderdetail.html',
    providers: [StorageMulti, Core, CallNumber],
    animations: FADEIN,
})
export class OrderdetailPage {
    DetailPage = DetailPage;
    OrderPage = OrderPage;
    id: Number; login: Object; data: Object; user: Object;
    date_format: string = "hh:mm a, dd/MM/yyyy";
    @ViewChild(Content) content: Content;
    @ViewChild('footer') buttonFooter;
    @ViewChild('navbar') navBar: Navbar;
    trans: Object;
    checklist: boolean = false;
    textStatic: Object;
    checkAdd: boolean = false;
    checkBill: boolean = false;
    total_item: string = "";
    lang: any;
    wordpress_url = "";
    loaded_data = false;
    time = new Date().getTime();

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public storageMul: StorageMulti,
        public http: Http,
        public ngZone: NgZone,
        public storage: Storage,
        public core: Core,
        public config: Config,
        public translate: TranslateService,
        public Toast: Toast,
        public callNumber: CallNumber,
        public alertCtrl: AlertController,
        public platform: Platform
    ) {
        this.wordpress_url = config['wordpress_url'];
        this.textStatic = config['text_static'];
        this.lang = config['lang']['language'];
        this.date_format = config['app_settings']['date_format'];
        this.translate.get('orderdetail').subscribe(trans => this.trans = trans);
        this.id = navParams.get('id');
        this.storage.remove('order_update');
        storageMul.get(['login', 'user']).then(val => {
            if (val && val['login']['token']) {
                this.login = val['login'];
                this.user = val['user'];
                this.getData();
            } else navCtrl.push(OrderPage);
        });
    }

    ngOnInit() {
        this.platform.ready().then(() => {
            this.platform.registerBackButtonAction(() => {
                if(this.navParams.get('parent') && this.navParams.get('parent') == "ThankPage") {
                    this.navCtrl.popToRoot();
                } else {
                    this.navCtrl.pop();
                }
            });
        })
        
        this.navBar.backButtonClick = () => {
            if(this.navParams.get('parent') && this.navParams.get('parent') == "ThankPage") {
                this.navCtrl.popToRoot();
            } else {
                this.navCtrl.pop();
            }
        };
    }

    scrollHandler(event) {
        let pos = document.getElementById('order-content').scrollTop;
        if (pos != 0) {
            this.content.setElementAttribute('scroll', true);
        } else {
            this.content.setElementAttribute('scroll', false);
        }
    }

    callNow(phone) {
        if (phone) {
            this.callNumber.callNumber(phone, true)
                .then(() => console.log('Launched dialer!'))
                .catch(() => console.log('Error launching dialer'));
        }
    }

    ionViewDidEnter() {
        this.buttonFooter.update_footer();
    }
    getData() {
        let params = {time: this.time};
        let headers = new Headers();
        headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        headers.set('Authorization', 'Bearer ' + this.login["token"]);
        this.http.get(this.wordpress_url + '/wp-json/wooconnector/order/getorderbyid?order=' + this.id, {
            search: this.core.objectToURLParams(params),
            headers: headers
        }).subscribe(res => {
            this.data = res.json();
            this.data['date_created_gmt'] += 'Z';
            console.log(this.data);
            let i;
            for (i = 0; i < this.data['coupon_lines'].length; i++) {
                let coupon_item = this.data['coupon_lines'][i];
                if (coupon_item.meta_data[0]) {
                    if (coupon_item.meta_data[0].value.discount_type == "percent") {
                        coupon_item['amount'] = coupon_item.meta_data[0].value.amount + "%";
                    } else {
                        coupon_item['amount'] = coupon_item.meta_data[0].value.amount;
                    }
                }
                this.data['coupon_lines'][i] = coupon_item;
            }
            for (i = 0; i < this.data['line_items'].length; i++) {
                let attr = this.data['line_items'][i]['attributes'];
                let key;
                let selected_attr = [];
                if (this.data['line_items'][i]['variation_id'] != 0) {
                    for (key = 0; key < attr.length; key++) {
                        selected_attr.push(attr[key]['option']);
                    }
                }
                console.log(selected_attr);
                this.data['line_items'][i]['selected_attributes'] = selected_attr;
            }
            this.data['total_cost_price'] = (Number(this.data['total']) + Number(this.data['discount_total'])
                - Number(this.data['shipping_total']) - Number(this.data['total_tax']));
            this.data['_tax'] = (Number(res.json()['total_tax']) + Number(res.json()['shipping_tax']));
            this.data['shipping_lines'].forEach(val => {
                this.data['_shipping_title'] = val['method_title'];
            });
            this.total_item = this.totalItem(this.data['line_items']);
            this.content.resize();
            this.ngZone.run(() => {
                this.loaded_data = true;
            })
            
        });
    }
    
    changeStatus() {

        let confirm = this.alertCtrl.create({
            message: this.trans["message"],
            cssClass: 'alert-no-title alert-blue-btn',
            buttons: [
                {
                    text: this.trans["no"],
                },
                {
                    text: this.trans["yes"],
                    cssClass: 'dark',
                    handler: () => {
                        this.core.showLoading();
                        let params = { order: this.id };
                        let send_params = this.core.objectToURLParams(params);
                        let headers = new Headers();
                        headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                        headers.set('Authorization', 'Bearer ' + this.login["token"]);
                        this.http.post(this.wordpress_url + '/wp-json/wooconnector/order/changestatus', send_params, {
                            headers: headers
                        }).subscribe(res => {
                            this.core.hideLoading();
                            if (res.json()['result'] == 'success') {
                                // this.navCtrl.push(OrderPage);
                                this.data['status'] = this.trans['cancelled'];
                                let order_update = {
                                    id: this.data['id'],
                                    status: this.data['status']
                                }
                                this.storage.set('order_update', order_update);
                                this.content.scrollToTop();
                                this.core.showToastBottom(this.trans["success"]);
                            } else {
                                this.core.showToastBottom(this.trans["fail"]);
                            }
                        });
                    }
                }
            ]
        });
        confirm.present();
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

    findCountryFormCode(code) {
        console.log('country code');
        console.log(code);
        let country = this.core.findCountryFromCode(this.config['countries'], code);
        if (country) {
            return country.name;
        }
        return '';
    }

    doRefresh(refresher) {
        this.getData();
        refresher.complete();
    }
    showProductList() {
        if (this.checklist) {
            this.checklist = false;
        } else {
            this.checklist = true;
        }
    }
    showAddress() {
        if (this.checkAdd) {
            this.checkAdd = false;
        } else {
            this.checkAdd = true;
        }
    }
    showBilling() {
        if (this.checkBill) {
            this.checkBill = false;
        } else {
            this.checkBill = true;
        }
    }
}
