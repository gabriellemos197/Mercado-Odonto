import { Component, ViewChild } from '@angular/core';
import { Nav, NavController, AlertController, NavParams } from 'ionic-angular'
import { Http, Headers } from '@angular/http';
import { FormBuilder, FormGroup } from '@angular/forms';

// Custom
import { Storage } from '@ionic/storage';
import { StorageMulti } from '../../service/storage-multi.service';
import { TranslateService } from 'ng2-translate';
import { Core } from '../../service/core.service';
import { Config } from '../../service/config.service';
import { ShoppingCartProvider } from '../../providers/shopping-cart/shopping-cart';

//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';

// Page
import { SigninPage } from '../signin/signin';
import { DetailPage } from '../detail/detail';
import { CheckoutPage } from '../checkout/checkout';
import { AccountPage } from '../account/account';
import { CoreValidator } from '../../validator/core';

@Component({
    selector: 'page-cart',
    templateUrl: 'cart.html',
    providers: [StorageMulti, Core, ObjectToArray],
})
export class CartPage {
    SigninPage = SigninPage;
    DetailPage = DetailPage;
    CheckoutPage = CheckoutPage;
    AccountPage = AccountPage;
    wordpress_url = '';
    formCoupon: FormGroup;
    @ViewChild('footer') buttonFooter;
    data: Object;
    datacoupon: Object;
    tax: number = 0;
    coupon = []; couponData: Object[];
    login: Object;
    trans: Object = {};
    isCache: boolean;
    // couponCode:String;
    couponUsed = false;
    submitCoupon = false;
    couponRes: Object;
    totalPayment: Number;
    subtotal: number;
    delivery: Object;
    invalid: boolean;
    checkResuilt: boolean = false;
    out_of_stock: String[] = [];
    show_keyboard = false;
    dir_mode = "ltr";
    rest_outstock_temporary = "";

    constructor(
        public navParams: NavParams,
        public storage: Storage,
        public storageMul: StorageMulti,
        public navCtrl: NavController,
        public http: Http,
        public alertCtrl: AlertController,
        public core: Core,
        public translate: TranslateService,
        public config: Config,
        public formBuilder: FormBuilder,
        public cart_provider: ShoppingCartProvider,
        public nav: Nav
    ) {
        this.formCoupon = formBuilder.group({
            code: ['', CoreValidator.required]
        });
        this.wordpress_url = config['wordpress_url'];
        translate.get('cart').subscribe(trans => this.trans = trans);
        this.getData();
    }

    ionViewDidEnter() {
        this.buttonFooter.update_footer();
        this.dir_mode = this.config['lang']['display_mode'];
        if (this.isCache) {
            this.getData();
        } else this.isCache = true;
        // this.nav.swipeBackEnabled = false;
    }

    // ionViewWillLeave() {
    //     this.nav.swipeBackEnabled = true;
    // }

    getData() {
        this.storage.get('cart').then(res => {
            this.data = res;
            console.log("cart ", this.data);
        })
        this.storageMul.get(['coupon', 'login', 'shipping_method']).then((val) => {
            if (val && val['coupon']) this.coupon = val['coupon'];
            if (val['login']) this.login = val['login'];
            if (this.data && Object.keys(this.data).length > 0) {
                this.validate();
            } else this.checkResuilt = true;
            if (val['shipping_method']) {
                this.delivery = val['shipping_method'];
            }
        });
    }

    shop() {
        this.navCtrl.popToRoot();
    }

    delete(id: string) {
        let data = Object.assign({}, this.data);
        let confirm = this.alertCtrl.create({
            message: this.trans['clear']["message"],
            cssClass: 'alert-no-title alert-blue-btn',
            buttons: [
                {
                    text: this.trans['clear']["no"],
                },
                {
                    text: this.trans['clear']["yes"],
                    handler: () => {
                        delete data[id];
                        this.data = data;
                        this.update_cart();
                    }
                }
            ]
        });
        confirm.present();
    }

    update_cart() {
        this.storage.set('cart', this.data).then(() => {
            if (Object.keys(this.data).length > 0) {
                this.validate();
            } else {
                this.checkResuilt = true;
                this.coupon = [];
                this.couponData = [];
                this.storage.remove('coupon');
                this.apply();
            }
            this.buttonFooter.update_footer();
        });
    }

    askLogin() {
        this.translate.get('checkout.confirm_login').subscribe(trans => {
            if (!this.login) {
                let alert = this.alertCtrl.create({
                    message: trans['message'],
                    cssClass: 'alert-no-title alert-blue-btn',
                    buttons: [
                        {
                            text: trans["no"],
                            handler: () => {
                                this.navCtrl.push(this.CheckoutPage, { total: this.totalPayment });
                            }
                        },
                        {
                            text: trans["yes"],
                            handler: () => {
                                this.navCtrl.push(this.SigninPage);
                            }
                        }
                    ]
                });
                alert.present();
            } else {
                this.navCtrl.push(this.CheckoutPage, { total: this.totalPayment });
            }
        });
    }


    /**
     * validate product for checking out
     * @param lastValidate = false
     *  valid = true
     *  send request for checking products and coupons
     *      tax = 0
     *      if has discount
     *          assign totalPayment
     *          compute tax, assign couponData
     *          storage coupon list
     *      else has tax only 
     *          foreach total in resp[total]
     *              totalPayment += total
     *              subtotal += total[subtotal]
     *      if has delivery 
     *          totalPayment += delivery cost
     *      if has errors
     *          valid = false
     *          foreach error
     *              get list of product out stock
     *              get list of product not exist
     *              get list of coupon err
     *              remove coupon err and produc not exist
     *          if hasOutOfStock
     *              remove out stock product
     *              show toast msg of deleting coupon
     *      hide loading
     *      if lastValidate and valid = true 
     *          askLogin()
     *      else if lastValidate and has out stock product
     *          show alert
     */
    validate(lastValidate: boolean = false) {
        this.core.showLoading();
        let valid = true;
        let params = {};
        let products: Object[] = [];
        products = this.cart_provider.convertProductCheckout(this.data);
        params['products'] = JSON.stringify(products);
        params['coupons'] = JSON.stringify(this.coupon);
        params['woo_currency'] = this.config['currency']['code'];
        let headers = new Headers();
        if (this.login && this.login['token']) {
            headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            headers.set('Authorization', 'Bearer ' + this.login["token"]);
        }
        let url = this.wordpress_url + "/wp-json/wooconnector/calculator/addcoupons";
        this.http.post(url, this.core.objectToURLParams(params), { headers: headers })
            .subscribe(res => {
                let resp = res.json();
                this.tax = 0;
                if (resp['discount']) {
                    this.totalPayment = resp['total'];
                    this.subtotal = resp['subtotal'];
                    if (Array.isArray(resp['tax'])) {
                        if (resp['tax']) {
                            resp['tax'].forEach(tax => this.tax += tax['value']);
                        }
                    }
                    this.couponData = resp['discount'];
                    this.storage.set('coupon', this.coupon);
                } else {
                    this.totalPayment = 0;
                    this.subtotal = 0;
                    let obj;
                    for (obj in resp['total']) {
                        if (resp['total'].hasOwnProperty(obj) && !resp['total'][obj]['code']
                            && !resp['total'][obj]['errors']) {
                            this.totalPayment += resp['total'][obj]['total'];
                            this.tax += resp['total'][obj]['tax'];
                            this.subtotal += resp['total'][obj]['subtotal'];
                        }
                    }
                }
                if (this.delivery) {
                    this.totalPayment += this.delivery['cost'];
                }
                let coupon_err = [];
                let product_not_exist = [];
                let err_message = '';
                if (resp['errors']) {
                    valid = false;
                    this.out_of_stock = [];
                    for (var key in resp['errors']) {
                        if (resp['errors'][key]['code'] == "rest_stock_error") {
                            this.out_of_stock.push(resp['errors'][key]['product']);
                        } else if (resp['errors'][key]['code'] == "rest_order_stock_error") {
                            this.rest_outstock_temporary += resp['errors'][key]['product_name'] + " - ";
                        } else if (resp['errors'][key]['code'] == "rest_product_error") {
                            product_not_exist.push(resp['errors'][key]['product']);
                        } else if (resp['errors'][key]['code'] == "rest_quantity_error") {
                            err_message = resp['errors'][key]['message'];
                        } else if (resp['errors'][key]['errors']
                            && resp['errors'][key]['errors']['rest_coupon_error']) {
                            coupon_err.push(key);
                        }
                    }
                    // remove coupon err 
                    if (coupon_err.length > 0) {
                        let i;
                        for (i = 0; i < coupon_err.length; i++) {
                            this.coupon = this.coupon.map(ele => ele.toLowerCase());
                            let index = this.coupon.indexOf(coupon_err[i]);
                            if (index > -1) {
                                this.coupon.splice(index, 1);
                            }
                            if (this.couponData) {
                                this.couponData.forEach(function (element, i) {
                                    if (element['code'] == coupon_err[i]) {
                                        index = i;
                                    }
                                });
                                this.couponData.splice(index, 1);
                            }
                        }
                        this.storage.set('coupon', this.coupon);
                    }

                    // remove product not exist 
                    if (product_not_exist.length > 0) {
                        this.data = this.cart_provider.removeErrProduct(product_not_exist, this.data);
                        this.storage.set('cart', this.data);
                    }
                }
                this.cart_provider.translateErrorMsg(err_message);
                this.core.hideLoading();
                if (lastValidate && valid) {
                    this.askLogin();
                } else if (lastValidate && this.out_of_stock.length > 0) {
                    this.showAlert(this.trans['out_of_stock']);
                }
            }, error => {
                console.log(error.json());
                if (error.json()['code'] == 'jwt_auth_invalid_token') {
                    this.core.removeToken();
                }
                this.core.hideLoading();
            });
    }

    checkOutStock(product): boolean {
        for (let i = 0; i < this.out_of_stock.length; i++) {
            if (Object.keys(product.attributes).length === 0) {
                if (product.id == this.out_of_stock[i]) {
                    return true;
                }
            } else {
                if (product.variation_id == this.out_of_stock[i]) {
                    return true;
                }
            }
        }
        return false;
    }

    showAlert(message: string) {
        let alert = this.alertCtrl.create({
            message: message,
            cssClass: 'alert-no-title',
            buttons: [this.trans['validate']]
        });
        alert.present();
    }

    apply() {
        this.submitCoupon = true;
        if (this.formCoupon.valid) {
            this.core.showLoading();
            this.submitCoupon = false;
            this.coupon = this.coupon.concat(this.formCoupon.value.code);
            let params = {};
            let products: Object[] = [];
            products = this.cart_provider.convertProductCheckout(this.data);
            params['products'] = JSON.stringify(products);
            params['coupons'] = JSON.stringify(this.coupon);
            params['woo_currency'] = this.config['currency']['code'];

            let headers = new Headers();
            headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            if (this.login && this.login['token']) {
                headers.set('Authorization', 'Bearer ' + this.login["token"]);
            }
            let url = this.wordpress_url + "/wp-json/wooconnector/calculator/addcoupons";
            this.http.post(url, this.core.objectToURLParams(params), { headers: headers })
                .subscribe(res => {
                    let resp = res.json();
                    let coupon_err = '';
                    if (resp['errors']) {
                        let message: string = '';
                        let coupon_only_exist = false;
                        let coupon_only_delete = false;
                        for (var key in resp['errors']) {
                            if (resp['errors'][key]['errors']) {
                                if (resp['errors'][key]['errors']['rest_coupon_error']) {
                                    coupon_err = key;
                                    message = resp['errors'][key]['errors']['rest_coupon_error'][0];
                                } else if (resp['errors'][key]['errors']['rest_coupon_error_delete']) {
                                    coupon_err = key;
                                    coupon_only_delete = true;
                                } else if (resp['errors'][key]['errors']['rest_coupon_error_exists']) {
                                    coupon_err = key;
                                    coupon_only_exist = true;
                                }
                            }
                        }
                        if (coupon_only_delete) {
                            let confirm = this.alertCtrl.create({
                                message: this.trans["coupon_only_notice"]["message"],
                                cssClass: 'alert-no-title alert-blue-btn',
                                buttons: [
                                    {
                                        text: this.trans['coupon_only_notice']["no"],
                                    },
                                    {
                                        text: this.trans['coupon_only_notice']["yes"],
                                        handler: () => {
                                            // remove other coupons
                                            this.coupon = [];
                                            this.couponData = [];
                                            this.storage.remove('coupon');
                                            this.apply();
                                        }
                                    }
                                ]
                            });
                            confirm.present();
                        } else if (coupon_only_exist) {
                            // remove coupon err 
                            let index = this.coupon.indexOf(coupon_err);
                            if (index > -1) {
                                this.coupon.splice(index, 1);
                            }
                            this.core.showToastBottom(this.trans['coupon_only_exist']);
                        } else if (coupon_err != '') {
                            this.coupon = this.coupon.map(ele => ele.toLowerCase());
                            let index = this.coupon.indexOf(coupon_err);
                            if (index > -1) {
                                this.coupon.splice(index, 1);
                            }
                            this.cart_provider.translateErrorMsg(message);
                        }
                    }

                    if (coupon_err == '') {
                        if (resp['discount']) {
                            this.tax = 0;
                            this.couponData = resp['discount'];
                            if (Array.isArray(resp['tax'])) {
                                if (resp['tax']) {
                                    resp['tax'].forEach(tax => this.tax += tax['value']);
                                }
                            }
                            this.totalPayment = resp['total'];
                            this.subtotal = resp['subtotal'];
                        }
                        if (this.delivery) {
                            this.totalPayment += this.delivery['cost'];
                        }
                        this.formCoupon.patchValue({
                            code: null
                        });
                        this.storage.set('coupon', this.coupon);
                        this.core.showToastBottom(this.trans["add"]);
                    }
                    this.core.hideLoading();
                }, err => {
                    if (err.json()['code'] == 'jwt_auth_invalid_token') {
                        this.core.removeToken();
                    };
                    this.core.hideLoading();
                });
        }
    }

    remove(index: number) {
        if (this.coupon.length == 1) {
            this.storage.remove('coupon').then(() => {
                this.coupon = [];
                this.couponData = [];
                this.validate();
                this.core.showToastBottom(this.trans["remove"]);
            });
        } else {
            let coupon = this.coupon.slice(0);
            coupon.splice(Number(index), 1);
            this.storage.set('coupon', coupon).then(() => {
                this.coupon.splice(Number(index), 1);
                this.couponData.splice(Number(index), 1);
                this.validate();
                this.core.showToastBottom(this.trans["remove"]);
            });
        }
    }

    gotoAddress() {
        this.validate(true);
    }

    onSwipeContent(event) {
        if (event['deltaX'] < -90 && this.dir_mode == 'ltr'){
            this.navCtrl.push(this.AccountPage, {}, {animate: true, direction: "forward"}); 
        } else if (event['deltaX'] > 90 && this.dir_mode == 'rtl') {
            this.navCtrl.push(this.AccountPage, {}, {animate: true, direction: "back"}); 
        } else if (this.dir_mode == 'ltr') {
            this.navCtrl.popToRoot({animate: true, direction: "back"}); 
        } else {
            this.navCtrl.popToRoot({animate: true, direction: "forward"}); 
        }
    }
}
